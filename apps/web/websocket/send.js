import WebSocket from 'ws';
import process from 'process';
import os from "os"

const logIndex = process.argv.findIndex(arg => arg === '-l' || arg === '--log');
let message = 'Hello from WebSocket client!';
if (logIndex !== -1 && process.argv.length > logIndex + 1) {
  message = process.argv[logIndex + 1];
}

const networkInterfaces = os.networkInterfaces();
let ip;

  if (process.env.HOST_IP) {
    ip = process.env.HOST_IP;
  }



  if (networkInterfaces['Wi-Fi']) {
    for (const net of networkInterfaces['Wi-Fi']) {
      if (net.family === 'IPv4' && !net.internal) {
        ip = net.address;
      }
    }
  }

const ws = new WebSocket(`ws://${ip}/websocket/`);

ws.on('open', function open() {
  ws.send(message);
  ws.close()
});