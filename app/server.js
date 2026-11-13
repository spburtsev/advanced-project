import { createServer } from 'node:http';
import { handler } from './build/handler.js';
import { createRuntime } from './src/lib/server/runtime.js';

const server = createServer(handler);
await createRuntime({
	localDev: process.env.LOCAL_DEV === '1',
	databaseUrl: process.env.DATABASE_URL,
	origin: process.env.ORIGIN,
	dataDir: '.local',
	server
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`listening on http://localhost:${port}`));
