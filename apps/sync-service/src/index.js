import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT ?? 3001);
const wss = new WebSocketServer({ port, path: '/sync' });

wss.on('connection', (socket) => {
  socket.on('message', (data) => socket.send(data));
});

console.log(`sync-service listening on ws://localhost:${port}/sync`);