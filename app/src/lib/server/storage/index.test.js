import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { parseCookie } from '../auth/sessions.js';
import { createLocalStorage } from './index.js';

test('local storage round-trips and rejects escaping keys', async () => {
	const dir = await mkdtemp(join(tmpdir(), 'storage-'));
	const storage = createLocalStorage(dir);
	await storage.put('a/b.txt', 'hi');
	expect(String(await storage.get('a/b.txt'))).toBe('hi');
	await storage.delete('a/b.txt');
	expect(await storage.get('a/b.txt')).toBeNull();
	await expect(storage.put('../evil', 'x')).rejects.toThrow(/escapes root/);
	await expect(storage.get('/etc/passwd')).rejects.toThrow(/escapes root/);
	await rm(dir, { recursive: true });
});

test('parseCookie', () => {
	expect(parseCookie('a=1; session=tok%20en; b=2', 'session')).toBe('tok en');
	expect(parseCookie('xsession=1', 'session')).toBeNull();
	expect(parseCookie('session=%E0', 'session')).toBeNull();
	expect(parseCookie(undefined, 'session')).toBeNull();
});
