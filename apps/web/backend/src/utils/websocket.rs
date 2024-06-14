use std::process::Command;
use std::io::Error;
use std::env;

use tracing::info;

fn get_path(file: &str) -> String {
  let deployment_type = env::var("DEPLOYMENT_TYPE").unwrap_or("docker".to_string());
  match deployment_type.as_str() {
    "containerless" => format!("apps/web/websocket/{}", file),
    _ => format!("/app/apps/web/websocket/{}", file),
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

pub async fn log_to_ws(message: String) -> Result<(), Error> {
  let current_dir = env::current_dir()?;
  let output = Command::new("bun")
    .arg(get_path("send.js"))
    .arg("--log")
    .arg(message)
    .current_dir(current_dir)
    .output()?;

  Ok(())
}