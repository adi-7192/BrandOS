import test from 'node:test';
import assert from 'node:assert/strict';

import { clearClientAuth, applyClientAuth, getClientAuthToken } from './auth-session.js';

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

test('getClientAuthToken reads the active browser-session token only', () => {
  const storage = createStorage({ token: 'session-token' });

  assert.equal(getClientAuthToken({ storage }), 'session-token');
});

test('applyClientAuth clears legacy local storage tokens so requests use the active session token', () => {
  const storage = createStorage();
  const legacyStorage = createStorage({ token: 'old-local-token' });
  const api = { defaults: { headers: { common: {} } } };

  applyClientAuth({ api, storage, legacyStorage, token: 'session-token' });

  assert.equal(storage.getItem('token'), 'session-token');
  assert.equal(legacyStorage.getItem('token'), null);
  assert.equal(api.defaults.headers.common.Authorization, 'Bearer session-token');
});

test('clearClientAuth removes the token and clears the shared api header', () => {
  const storage = createStorage({ token: 'old-token' });
  const legacyStorage = createStorage({ token: 'legacy-token' });
  const api = { defaults: { headers: { common: { Authorization: 'Bearer old-token' } } } };

  clearClientAuth({ api, storage, legacyStorage });

  assert.equal(storage.getItem('token'), null);
  assert.equal(legacyStorage.getItem('token'), null);
  assert.equal('Authorization' in api.defaults.headers.common, false);
});
