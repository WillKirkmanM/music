import WebSocket from "ws"

const wss = new WebSocket.Server({ port: 3002, path: '/ws' });

wss.on('connection', ws => {
  ws.on('message', message => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});