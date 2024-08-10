use actix_web::{web, Error as OtherError, HttpRequest, HttpResponse};
use tracing::info;

use super::globals::GLOBAL_SESSION;

pub async fn ws(req: HttpRequest, body: web::Payload) -> Result<HttpResponse, OtherError> {
    let (response, session, mut _msg_stream) = actix_ws::handle(&req, body)?;

    {
      let mut session_lock = GLOBAL_SESSION.lock().unwrap();
      *session_lock = Some(session.clone());
    }

    info!("Started Websocket");

    Ok(response)
}

pub async fn log_to_ws(message: impl Into<String>) -> Result<(), Box<dyn std::error::Error>> {
    let message = message.into();
    let mut session_lock = GLOBAL_SESSION.lock().unwrap();
    if let Some(session) = session_lock.as_mut() {
        session.text(&message).await?;
    } else {
        eprintln!("No active session found");
        return Err("No active session found".into());
    }
    Ok(())
}