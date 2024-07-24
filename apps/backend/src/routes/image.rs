use actix_web::{get, web, Error, HttpRequest, HttpResponse, Responder, Result};
use ::image::{ImageFormat, io::Reader};
use std::collections::HashMap;
use std::fs::read;
use std::io::Cursor;

#[get("/image/{path:.*}")]
pub async fn image(req: HttpRequest, path: web::Path<String>) -> Result<impl Responder, Error> {
    let file_path = path.into_inner();
    let query = req.query_string();
    let format = web::Query::<HashMap<String, String>>::from_query(query)?.get("format").cloned().unwrap_or_else(|| "".to_string());

    if format.is_empty() {
        match read(&file_path) {
            Ok(data) => Ok(HttpResponse::Ok().content_type("image/png").body(data)),
            Err(_) => Ok(HttpResponse::NotFound().body("Image not found")),
        }
    } else {
        let img = match Reader::open(&file_path)?.decode() {
            Ok(img) => img,
            Err(_) => return Ok(HttpResponse::NotFound().body("Image not found")),
        };

        let mut bytes: Vec<u8> = Vec::new();
        let content_type = match format.as_str() {
            "webp" => {
                img.write_to(&mut Cursor::new(&mut bytes), ImageFormat::WebP).unwrap();
                "image/webp"
            },
            "avif" => {
                img.write_to(&mut Cursor::new(&mut bytes), ImageFormat::Avif).unwrap();
                "image/avif"
            },
            _ => {
                return match read(&file_path) {
                    Ok(data) => Ok(HttpResponse::Ok().content_type("image/png").body(data)),
                    Err(_) => Ok(HttpResponse::NotFound().body("Image not found")),
                };
            }
        };

        Ok(HttpResponse::Ok().content_type(content_type).body(bytes))
    }
}