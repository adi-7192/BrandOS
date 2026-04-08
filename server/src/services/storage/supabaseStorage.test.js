import test from 'node:test';
import assert from 'node:assert/strict';

import { getSupabaseStorageClient } from './supabaseStorage.js';

test('getSupabaseStorageClient throws a clear error when SUPABASE_URL is missing', () => {
  assert.throws(
    () => getSupabaseStorageClient({ supabaseUrl: '', serviceRoleKey: 'service-role-key' }),
    /Missing SUPABASE_URL/
  );
});

test('getSupabaseStorageClient throws a clear error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
  assert.throws(
    () => getSupabaseStorageClient({ supabaseUrl: 'https://project.supabase.co', serviceRoleKey: '' }),
    /Missing SUPABASE_SERVICE_ROLE_KEY/
  );
});

test('getSupabaseStorageClient creates a client only when config is present', () => {
  let received = null;

  const client = getSupabaseStorageClient({
    supabaseUrl: 'https://project.supabase.co',
    serviceRoleKey: 'service-role-key',
    create: (url, key) => {
      received = { url, key };
      return { ok: true };
    },
  });

  assert.deepEqual(received, {
    url: 'https://project.supabase.co',
    key: 'service-role-key',
  });
  assert.deepEqual(client, { ok: true });
});
