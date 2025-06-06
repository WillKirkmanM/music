use std::{env, time::{SystemTime, UNIX_EPOCH}};

use actix_web::{cookie::{self, Cookie, SameSite, CookieJar}, dev::ServiceRequest, get, http::header, post, web, HttpRequest, HttpResponse, Responder};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::Utc;
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use dotenvy::dotenv;
use futures::future::{ready, Ready};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::utils::{config::get_jwt_secret, database::{database::establish_connection, models::NewUser}};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub username: String,
    pub bitrate: i32,
    pub token_type: String,
    pub role: String
}

#[derive(Serialize, Deserialize)]
pub struct AuthData {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct ResponseAuthData {
    pub status: bool,
    pub access_token: String,
    pub refresh_token: String,
    pub message: Option<String>,
}

fn generate_access_token(user_id: i32, username: &str, bitrate: i32, role: &String) -> String {
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::days(7)) 
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp: expiration,
        username: username.to_string(),
        bitrate,
        token_type: "access".to_string(),
        role: role.to_string(),
    };

    let secret = get_jwt_secret();
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_ref())).expect("Token encoding failed")
}

fn generate_refresh_token(user_id: i32, username: &str, role: &String) -> String {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(30)) 
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp: expiration,
        username: username.to_string(),
        bitrate: 0,
        token_type: "refresh".to_string(),
        role: role.to_string(),
    };

    let secret = get_jwt_secret();
    let mut header = Header::default();
    header.alg = jsonwebtoken::Algorithm::HS256;

    encode(&header, &claims, &EncodingKey::from_secret(secret.as_ref())).expect("Token encoding failed")
}


#[get("/is-valid")]
pub async fn is_valid(req: HttpRequest) -> impl Responder {
    let token = if let Some(cookie_header) = req.headers().get(header::COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            cookie_str.split(';')
                .filter_map(|cookie| Cookie::parse_encoded(cookie.trim()).ok())
                .find(|cookie| cookie.name() == "plm_accessToken")
                .map(|cookie| cookie.value().to_string())
        } else {
            None
        }
    } else {
        None
    };

    let token = match token {
        Some(t) => t,
        None => return HttpResponse::Unauthorized().json(json!({
            "status": false,
            "message": "No token found in cookies"
        }))
    };

    let secret = get_jwt_secret();
    let mut validation = Validation::new(Algorithm::HS256);
    validation.leeway = 60;
    validation.validate_exp = true;

    match decode::<Claims>(&token, &DecodingKey::from_secret(secret.as_ref()), &validation) {
        Ok(token_data) => {
            let current_time = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs() as usize;

            if token_data.claims.exp < current_time {
                return HttpResponse::Unauthorized().json(json!({
                    "status": false,
                    "message": "Token expired",
                    "token_type": token_data.claims.token_type
                }));
            }

            HttpResponse::Ok().json(json!({
                "status": true,
                "token_type": token_data.claims.token_type,
                "claims": token_data.claims
            }))
        },
        Err(e) => HttpResponse::Unauthorized().json(json!({
            "status": false,
            "message": format!("Invalid token: {}", e)
        }))
    }
}


#[post("/login")]
pub async fn login(form: web::Json<AuthData>) -> impl Responder {
    use crate::utils::database::schema::user::dsl::*;
    dotenv().ok();

    let mut connection = match establish_connection().get() {
        Ok(conn) => conn,
        Err(_) => {
            return HttpResponse::InternalServerError().json(ResponseAuthData {
                status: false,
                access_token: String::new(),
                refresh_token: String::new(),
                message: Some(String::from("Failed to establish database connection")),
            });
        }
    };

    let result = user
        .filter(username.eq(&form.username))
        .select((password, id, bitrate, role))
        .first::<(String, i32, i32, String)>(&mut connection);

    match result {
        Ok((stored_password_hash, user_id, user_bitrate, user_role)) => {
            if verify_password(&form.password, &stored_password_hash) {
                let generated_access_token = generate_access_token(user_id, &form.username, user_bitrate, &user_role);
                let generated_refresh_token = generate_refresh_token(user_id, &form.username, &user_role);

                let access_cookie = Cookie::build("plm_accessToken", generated_access_token.clone())
                    .http_only(false)
                    .same_site(SameSite::Lax)
                    .path("/")
                    .max_age(cookie::time::Duration::days(7))
                    .finish();

                let refresh_cookie = Cookie::build("plm_refreshToken", generated_refresh_token.clone())
                    .http_only(true)
                    .same_site(SameSite::Lax)
                    .path("/")
                    .max_age(cookie::time::Duration::days(30))
                    .finish();

                HttpResponse::Ok()
                    .cookie(access_cookie)
                    .cookie(refresh_cookie)
                    .json(ResponseAuthData {
                        status: true,
                        access_token: generated_access_token,
                        refresh_token: String::new(),
                        message: None,
                    })
            } else {
                HttpResponse::Ok().json(ResponseAuthData {
                    status: false,
                    access_token: String::new(),
                    refresh_token: String::new(),
                    message: Some(String::from("Invalid Username or Password!")),
                })
            }
        },
        Err(_) => {
            HttpResponse::Ok().json(ResponseAuthData { 
                status: false, 
                access_token: String::new(), 
                refresh_token: String::new(), 
                message: Some(String::from("Invalid Username or Password!")),
            })
        }
    }
}

#[derive(Deserialize)]
pub struct RegisterData {
    pub username: String,
    pub password: String,
    pub role: String,
}

#[post("/register")]
pub async fn register(form: web::Json<RegisterData>, req: HttpRequest) -> impl Responder {
    use crate::utils::database::schema::user::dsl::*;
    dotenv().ok();

    let mut connection = match establish_connection().get() {
        Ok(conn) => conn,
        Err(_) => {
            return HttpResponse::InternalServerError().json(ResponseAuthData {
                status: false,
                access_token: String::new(),
                refresh_token: String::new(),
                message: Some(String::from("Failed to establish database connection")),
            });
        }
    };

    let existing_users_count: i64 = user.count().get_result(&mut connection).unwrap_or(0);

    let new_user_role = if existing_users_count == 0 {
        "admin".to_string()
    }     else {
        let token = req
            .cookie("plm_accessToken")
            .map(|cookie| cookie.value().to_string());
        if let Some(token) = token {
            let jwt_secret = get_jwt_secret();
            match decode::<Claims>(&token, &DecodingKey::from_secret(jwt_secret.as_ref()), &Validation::default()) {
                Ok(token_data) => {
                    let claims = token_data.claims;
                    if claims.role.contains(&"admin".to_string()) {
                        form.role.clone()
                    } else {
                        return HttpResponse::Forbidden().json(ResponseAuthData {
                            status: false,
                            access_token: String::new(),
                            refresh_token: String::new(),
                            message: Some(String::from("Only admins can create admin users")),
                        });
                    }
                }
                Err(_) => {
                    return HttpResponse::Unauthorized().json(ResponseAuthData {
                        status: false,
                        access_token: String::new(),
                        refresh_token: String::new(),
                        message: Some(String::from("Invalid authorization token")),
                    });
                }
            }
        } else {
            return HttpResponse::Unauthorized().json(ResponseAuthData {
                status: false,
                access_token: String::new(),
                refresh_token: String::new(),
                message: Some(String::from("Authorization token is missing")),
            });
        }
    };

    let new_user = NewUser {
        username: form.username.clone(),
        password: hash_password(&form.password).expect("Failed to hash password"),
        role: new_user_role,
    };

    diesel::insert_into(user)
        .values(&new_user)
        .execute(&mut connection)
        .expect("Error saving new user");

    HttpResponse::Ok().json(ResponseAuthData {
        status: true,
        access_token: String::new(),
        refresh_token: String::new(),
        message: Some(String::from("User registered successfully")),
    })
}

#[post("/renew-refresh-token")]
pub async fn renew_refresh_token(req: HttpRequest) -> impl Responder {
    dotenv().ok();

    let secret = get_jwt_secret();

    let refresh_token = match req.cookie("plm_refreshToken") {
        Some(cookie) => cookie.value().to_string(),
        None => {
            return HttpResponse::Unauthorized().json(ResponseAuthData {
                status: false,
                access_token: String::new(),
                refresh_token: String::new(),
                message: Some(String::from("Refresh token not found")),
            });
        }
    };

    let token_data = decode::<Claims>(&refresh_token, &DecodingKey::from_secret(secret.as_ref()), &Validation::new(Algorithm::HS256));

    match token_data {
        Ok(data) => {
            if data.claims.token_type == "refresh" {
                let new_refresh_token = generate_refresh_token(data.claims.sub.parse().unwrap(), &data.claims.username, &data.claims.role.clone());

                let refresh_cookie = Cookie::build("plm_refreshToken", new_refresh_token.clone())
                    .http_only(true)
                    .same_site(SameSite::Lax)
                    .path("/")
                    .max_age(cookie::time::Duration::days(30))
                    .finish();

                HttpResponse::Ok()
                    .cookie(refresh_cookie)
                    .json(ResponseAuthData {
                        status: true,
                        access_token: String::new(),
                        refresh_token: new_refresh_token,
                        message: None,
                    })
            } else {
                HttpResponse::Unauthorized().json(ResponseAuthData {
                    status: false,
                    access_token: String::new(),
                    refresh_token: String::new(),
                    message: Some(String::from("Invalid token type")),
                })
            }
        },
        Err(_) => {
            let mut jar = CookieJar::new();

            let expired_cookie = Cookie::build("plm_refreshToken", "")
                .path("/")
                .http_only(true)
                .same_site(SameSite::Lax)
                .max_age(cookie::time::Duration::seconds(0))
                .finish();

            jar.add(expired_cookie);

            HttpResponse::Unauthorized()
                .cookie(jar.delta().next().unwrap().clone())
                .json(ResponseAuthData {
                    status: false,
                    access_token: String::new(),
                    refresh_token: String::new(),
                    message: Some(String::from("Invalid token")),
                })
        }
    }
}

#[post("/refresh")]
pub async fn refresh(req: HttpRequest) -> impl Responder {
    dotenv().ok();

    let secret = get_jwt_secret();

    let refresh_token = match req.cookie("plm_refreshToken") {
        Some(cookie) => cookie.value().to_string(),
        None => {
            return HttpResponse::Unauthorized().json(ResponseAuthData {
                status: false,
                access_token: String::new(),
                refresh_token: String::new(),
                message: Some(String::from("Refresh token not found")),
            });
        }
    };

    let token_data = decode::<Claims>(&refresh_token, &DecodingKey::from_secret(secret.as_ref()), &Validation::new(Algorithm::HS256));

    match token_data {
        Ok(data) => {
            if data.claims.token_type == "refresh" {
                let new_access_token = generate_access_token(
                    data.claims.sub.parse().unwrap(),
                    &data.claims.username,
                    data.claims.bitrate,
                    &data.claims.role.clone()
                );

                let access_cookie = Cookie::build("plm_accessToken", new_access_token.clone())
                    .http_only(false)
                    .same_site(SameSite::Lax)
                    .path("/")
                    .max_age(cookie::time::Duration::days(7))
                    .finish();

                HttpResponse::Ok()
                    .cookie(access_cookie)
                    .json(ResponseAuthData {
                        status: true,
                        access_token: new_access_token,
                        refresh_token: String::new(),
                        message: None,
                    })
            } else {
                HttpResponse::Unauthorized().json(ResponseAuthData {
                    status: false,
                    access_token: String::new(),
                    refresh_token: String::new(),
                    message: Some(String::from("Invalid token type")),
                })
            }
        },
        Err(_) => {
            let mut jar = CookieJar::new();

            let expired_cookie = Cookie::build("plm_accessToken", "")
                .path("/")
                .http_only(true)
                .same_site(SameSite::Lax)
                .max_age(cookie::time::Duration::seconds(0))
                .finish();

            jar.add(expired_cookie);

            HttpResponse::Unauthorized()
                .cookie(jar.delta().next().unwrap().clone())
                .json(ResponseAuthData {
                    status: false,
                    access_token: String::new(),
                    refresh_token: String::new(),
                    message: Some(String::from("Invalid token")),
                })
        }
    }
}

#[post("/logout")]
pub async fn logout() -> impl Responder {
    let mut jar = CookieJar::new();
    
    let access_cookie = Cookie::build("plm_accessToken", "")
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(cookie::time::Duration::seconds(0))
        .finish();

    let refresh_cookie = Cookie::build("plm_refreshToken", "")
        .path("/")
        .http_only(true) 
        .same_site(SameSite::Lax)
        .max_age(cookie::time::Duration::seconds(0))
        .finish();

    jar.add(access_cookie);
    jar.add(refresh_cookie);

    HttpResponse::Ok()
        .cookie(jar.delta().next().unwrap().clone())
        .cookie(jar.delta().nth(1).unwrap().clone())
        .json(json!({
            "status": true,
            "message": "Logged out successfully"
        }))
}

pub fn validator(
    req: ServiceRequest, 
    credentials: Option<BearerAuth>
) -> Ready<Result<ServiceRequest, (actix_web::Error, ServiceRequest)>> {
    dotenv().ok();

    if env::var("LOCAL_APP").is_ok() {
        return ready(Ok(req));
    }

    let token = if let Some(cookie_header) = req.headers().get(header::COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            cookie_str.split(';')
                .filter_map(|cookie| Cookie::parse_encoded(cookie.trim()).ok())
                .find(|cookie| cookie.name() == "plm_accessToken")
                .map(|cookie| cookie.value().to_string())
        } else {
            credentials.map(|creds| creds.token().to_string())
        }
    } else {
        credentials.map(|creds| creds.token().to_string())
    };

    let token = match token {
        Some(t) => t,
        None => {
            let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Access denied: No token"));
            return ready(Err((actix_err, req)));
        }
    };

    let secret = get_jwt_secret();

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;
    validation.leeway = 60;
    validation.required_spec_claims.clear();

    match decode::<Claims>(&token, &DecodingKey::from_secret(secret.as_ref()), &validation) {
        Ok(data) => {
            if data.claims.token_type == "access" {
                ready(Ok(req))
            } else {
                let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Invalid token type"));
                ready(Err((actix_err, req)))
            }
        },
        Err(e) => {
            let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized(format!("Invalid token: {}", e)));
            ready(Err((actix_err, req)))
        },
    }
}

pub fn admin_guard(
    req: ServiceRequest, 
    credentials: Option<BearerAuth>
) -> Ready<Result<ServiceRequest, (actix_web::Error, ServiceRequest)>> {
    dotenv().ok();

    const ADMIN_ROLE: &str = "admin";

    let token = if let Some(cookie_header) = req.headers().get(header::COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            cookie_str.split(';')
                .filter_map(|cookie| Cookie::parse_encoded(cookie.trim()).ok())
                .find(|cookie| cookie.name() == "plm_accessToken")
                .map(|cookie| cookie.value().to_string())
        } else {
            None
        }
    } else {
        credentials.map(|creds| creds.token().to_string())
    };

    if token.is_none() {
        let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Access denied: No valid authentication provided"));
        return ready(Err((actix_err, req)))
    }

    let mut validation = Validation::new(Algorithm::HS256);
    validation.leeway = 60;
    validation.validate_exp = true;

    let secret = get_jwt_secret();
    match decode::<Claims>(&token.unwrap(), &DecodingKey::from_secret(secret.as_ref()), &validation) {
        Ok(data) => {
            if data.claims.token_type == "access" {
                if data.claims.role.contains(&ADMIN_ROLE.to_string()) {
                    ready(Ok(req))
                } else {
                    let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Insufficient permissions"));
                    ready(Err((actix_err, req)))
                }
            } else {
                let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Invalid token type"));
                ready(Err((actix_err, req)))
            }
        },
        Err(_) => {
            let actix_err = actix_web::Error::from(actix_web::error::ErrorUnauthorized("Invalid token"));
            ready(Err((actix_err, req)))
        },
    }
}

pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
	let salt = SaltString::generate(&mut OsRng);
	let argon2 = Argon2::default();
	let password_hash = argon2.hash_password(password.as_bytes(), &salt)?.to_string();
	Ok(password_hash)
}

pub fn verify_password(password: &str, password_hash: &str) -> bool {
	let parsed_hash = match PasswordHash::new(password_hash) {
		Ok(hash) => hash,
		Err(_) => return false,
	};
	Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok()
}
