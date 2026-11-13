// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: import('#lib/server/db/index.js').Db;
			sync: import('#lib/server/sync/index.js').Sync;
			storage: import('#lib/server/storage/index.js').Storage | null;
			localDev: boolean;
			userId: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
