use std::process::Command;
use std::io::Error;
use std::env;

use tracing::info;

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

fn sanitize_input(input: &str) -> String {
    input.chars().filter(|&c| c != '\0').collect()
}


pub async fn log_to_ws(message: String) -> Result<(), Error> {
  let current_dir = env::current_dir()?;
  let output = Command::new("bun")
    .arg(get_path("send.js"))
    .arg("--log")
    .arg(sanitize_input(&message))
    .current_dir(current_dir)
    .output()?;

  Ok(())
}
