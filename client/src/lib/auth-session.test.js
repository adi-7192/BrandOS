import test from 'node:test';
import assert from 'node:assert/strict';

import { clearClientAuth, applyClientAuth } from './auth-session.js';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('applyClientAuth stores the token and updates the shared api header', () => {
  const storage = createStorage();
  const api = { defaults: { headers: { common: {} } } };

  applyClientAuth({ api, storage, token: 'abc123' });

  assert.equal(storage.getItem('token'), 'abc123');
  assert.equal(api.defaults.headers.common.Authorization, 'Bearer abc123');
});

test('clearClientAuth removes the token and clears the shared api header', () => {
  const storage = createStorage({ token: 'old-token' });
  const api = { defaults: { headers: { common: { Authorization: 'Bearer old-token' } } } };

  clearClientAuth({ api, storage });

  assert.equal(storage.getItem('token'), null);
  assert.equal('Authorization' in api.defaults.headers.common, false);
});
