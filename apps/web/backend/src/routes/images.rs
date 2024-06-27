use actix_web::{get, web, HttpResponse, Responder, Result};
use std::fs::read;

#[get("/image/{path:.*}")]
pub async fn image(path: web::Path<String>) -> Result<impl Responder> {
  let file_path = path.into_inner();

  match read(file_path) {
    Ok(data) => Ok(HttpResponse::Ok().content_type("image/png").body(data)),
    Err(_) => Ok(HttpResponse::NotFound().body("Image not found")),
  }
}