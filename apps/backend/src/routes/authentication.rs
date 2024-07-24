use std::{env, error::Error};

use actix_web::{dev::ServiceRequest, post, web, HttpResponse, Responder};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use dotenvy::dotenv;
use futures::future::{ready, Ready};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

use crate::utils::database::{database::establish_connection, models::NewUser};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(Serialize, Deserialize)]
pub struct AuthData {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct ResponseAuthData {
    pub status: bool,
    pub token: String,
    pub message: Option<String>,
}


#[post("/register")]
pub async fn register(form: web::Json<AuthData>) -> Result<impl Responder, Box<dyn Error>> {
    use crate::utils::database::schema::user::dsl::*;
    dotenv().ok();

    let hashed_password = hash_password(&form.password).map_err(|e| return HttpResponse::InternalServerError().body(format!("Failed to hash password: {}", e))).unwrap();

    let new_user = NewUser {
        username: form.username.clone(),
        password: hashed_password
    };

    let mut connection = establish_connection();

    diesel::insert_into(user)
        .values(&new_user)
        .execute(&mut connection)
        .expect("There was an error creating the new user!");


    let user_id = user
        .filter(username.eq(&form.username))
        .select(id)
        .first::<i32>(&mut connection)
        .expect("Error loading user");

    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::days(1))
        .ok_or("Invalid timestamp")?
        .timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_owned().to_string(),
        exp: expiration,
    };

    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref()))
        .map_err(|e| return HttpResponse::InternalServerError().body(format!("Token encoding failed: {}", e))).unwrap();

    Ok(web::Json(ResponseAuthData {
        status: true,
        token,
        message: None
    }))
}

#[post("/login")]
pub async fn login(form: web::Json<AuthData>) -> impl Responder {
    use crate::utils::database::schema::user::dsl::*;
    dotenv().ok();

    let mut connection = establish_connection();

    let result = user
        .filter(username.eq(&form.username))
        .select((password, id))
        .first::<(String, i32)>(&mut connection);

    match result {
        Ok((stored_password_hash, user_id)) => {
            if verify_password(&form.password, &stored_password_hash) {
                let expiration = chrono::Utc::now().checked_add_signed(chrono::Duration::days(1)).expect("valid timestamp").timestamp() as usize;
                let claims = Claims {
                    sub: user_id.to_string(),
                    exp: expiration,
                };

                let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
                let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())).expect("Token encoding failed");

                web::Json(ResponseAuthData {
                    status: true,
                    token,
                    message: None
                })
            } else {
                web::Json(ResponseAuthData {
                    status: false,
                    token: String::new(),
                    message: Some(String::from("Invalid Username or Password!"))
                })
            }
        },
        Err(_) => {
            web::Json(ResponseAuthData { 
                status: false, token: String::new(), message: Some(String::from("Invalid Username or Password!"))
            })
        }

    }
}

pub fn validator(
    req: ServiceRequest, 
    credentials: BearerAuth
) -> Ready<Result<ServiceRequest, (actix_web::Error, ServiceRequest)>> {
    dotenv().ok();

    let token = credentials.token();
    let mut validation = Validation::new(Algorithm::HS256);
    validation.leeway = 60;
    validation.validate_exp = true;

    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    match decode::<Claims>(&token, &DecodingKey::from_secret(secret.as_ref()), &validation) {
        Ok(_) => ready(Ok(req)),
        Err(_) => {
            let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Invalid token"));
            ready(Err((actix_err, req)))
        },
    }
}

fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
	let salt = SaltString::generate(&mut OsRng);
	let argon2 = Argon2::default();
	let password_hash = argon2.hash_password(password.as_bytes(), &salt)?.to_string();
	Ok(password_hash)
}

fn verify_password(password: &str, password_hash: &str) -> bool {
	let parsed_hash = match PasswordHash::new(password_hash) {
		Ok(hash) => hash,
		Err(_) => return false,
	};
	Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok()
}
