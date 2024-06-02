use std::process::Command;
use std::io::Error;
use std::env;

use tracing::info;

pub async fn start_ws() -> Result<(), Error> {
  let current_dir = env::current_dir()?;
  let mut child = Command::new("bun")  // Changed "bun" to "node"
    .arg("apps/web/backend/websocket.js")
    .current_dir(current_dir)
    .spawn()?;  // This will start the process

  info!("Websocket Server Started!");
  let _result = child.wait();  // This will wait for the process to finish
  Ok(())
}

pub async fn log_to_ws(message: String) -> Result<(), Error> {
  let current_dir = env::current_dir()?;
  let output = Command::new("bun")  // Changed "bun" to "node"
    .arg("apps/web/backend/send.js")
    .arg("--log")
    .arg(message)
    .current_dir(current_dir)
    .output()?;  // This will run the command and return its output

  Ok(())
}