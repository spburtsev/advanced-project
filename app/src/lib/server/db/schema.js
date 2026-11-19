import {
	pgTable,
	pgEnum,
	uuid,
	text,
	integer,
	bigint,
	bigserial,
	jsonb,
	timestamp,
	primaryKey,
	unique,
	index
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const role = pgEnum('role', ['owner', 'editor', 'viewer']);

export const users = pgTable('users', {
	id: uuid().primaryKey().defaultRandom(),
	oidcSub: text('oidc_sub').notNull().unique(),
	email: text().notNull(),
	name: text().notNull(),
	createdAt: createdAt()
});

// id is sha256(cookie token), so a leaked table does not leak live sessions.
export const sessions = pgTable('sessions', {
	id: text().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

export const workspaces = pgTable('workspaces', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	createdAt: createdAt(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

export const memberships = pgTable(
	'memberships',
	{
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: role().notNull(),
		createdAt: createdAt()
	},
	(t) => [primaryKey({ columns: [t.workspaceId, t.userId] })]
);

export const invites = pgTable('invites', {
	id: uuid().primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id')
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	tokenHash: text('token_hash').notNull().unique(),
	role: role().notNull(),
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: createdAt()
});

// Identity only; name/parent/deletion live in tree_events.
export const files = pgTable('files', {
	id: uuid().primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id')
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: createdAt()
});

export const treeEvents = pgTable(
	'tree_events',
	{
		id: bigserial({ mode: 'number' }).primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id, { onDelete: 'cascade' }),
		fileId: uuid('file_id')
			.notNull()
			.references(() => files.id, { onDelete: 'cascade' }),
		actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
		payload: jsonb().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.workspaceId, t.id)]
);

export const ops = pgTable(
	'ops',
	{
		fileId: uuid('file_id')
			.notNull()
			.references(() => files.id, { onDelete: 'cascade' }),
		seq: bigint({ mode: 'number' }).notNull(),
		clientId: text('client_id').notNull(),
		clientSeq: integer('client_seq').notNull(),
		actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
		payload: jsonb().notNull(),
		createdAt: createdAt()
	},
	// The unique pair makes client retries idempotent.
	(t) => [
		primaryKey({ columns: [t.fileId, t.seq] }),
		unique().on(t.fileId, t.clientId, t.clientSeq)
	]
);

export const snapshots = pgTable(
	'snapshots',
	{
		fileId: uuid('file_id')
			.notNull()
			.references(() => files.id, { onDelete: 'cascade' }),
		seq: bigint({ mode: 'number' }).notNull(),
		state: jsonb().notNull(),
		createdAt: createdAt()
	},
	(t) => [primaryKey({ columns: [t.fileId, t.seq] })]
);

// Named points in a file's history.
export const checkpoints = pgTable('checkpoints', {
	id: uuid().primaryKey().defaultRandom(),
	fileId: uuid('file_id')
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),
	seq: bigint({ mode: 'number' }).notNull(),
	label: text().notNull(),
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: createdAt()
});

export const chatMessages = pgTable(
	'chat_messages',
	{
		id: bigserial({ mode: 'number' }).primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspaces.id, { onDelete: 'cascade' }),
		fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }),
		authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
		body: text().notNull(),
		createdAt: createdAt()
	},
	(t) => [index().on(t.workspaceId, t.id)]
);

export const attachments = pgTable('attachments', {
	id: uuid().primaryKey().defaultRandom(),
	messageId: bigint('message_id', { mode: 'number' })
		.notNull()
		.references(() => chatMessages.id, { onDelete: 'cascade' }),
	s3Key: text('s3_key').notNull().unique(),
	filename: text().notNull(),
	contentType: text('content_type').notNull(),
	size: integer().notNull(),
	createdAt: createdAt()
});
