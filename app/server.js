import { createServer } from 'node:http';
import { handler } from './build/handler.js';
import { createRuntime } from './src/lib/server/runtime.js';

const server = createServer(handler);
createRuntime({ databaseUrl: process.env.DATABASE_URL, origin: process.env.ORIGIN, server });

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`listening on http://localhost:${port}`));
