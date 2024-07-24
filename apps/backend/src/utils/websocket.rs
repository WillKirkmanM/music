use std::process::Command;
use std::io::Error;
use std::env;

use futures::StreamExt;
use tracing::info;

use actix_web::{web, Error as OtherError, HttpRequest, HttpResponse};
use actix_ws::Message;

use super::config::is_docker;

fn get_path(file: &str) -> String {
  match is_docker() {
    true => format!("/app/apps/web/websocket/{}", file),
    false => format!("apps/web/websocket/{}", file),
  }
}

pub async fn start_ws() -> Result<(), Error> {
  let current_dir = env::current_dir()?;
  let mut child = Command::new("bun")
    .arg(get_path("websocket.js"))
    .current_dir(current_dir)
    .spawn()?;

  info!("Websocket Server Started!");
  let _result = child.wait();
  Ok(())
}

fn sanitise_input(input: &str) -> String {
    input.chars().filter(|&c| c != '\0').collect()
}


pub async fn log_to_ws(message: String) -> Result<(), Error> {
  let current_dir = env::current_dir()?;

  Command::new("bun")
    .arg(get_path("send.js"))
    .arg("--log")
    .arg(sanitise_input(&message))
    .current_dir(current_dir)
    .output()?;

  Ok(())
}


pub async fn ws(req: HttpRequest, body: web::Payload) -> Result<HttpResponse, OtherError> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;

    actix_rt::spawn(async move {
        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                Message::Ping(bytes) => {
                    if session.pong(&bytes).await.is_err() {
                        return;
                    }
                }
                Message::Text(s) => { println!("Got text, {}", s); session.text("Pong").await.unwrap(); },
                _ => break,
            }
        }

        let _ = session.close(None).await;
    });

    Ok(response)
}