import test from 'node:test';
import assert from 'node:assert/strict';

import { decryptSecret, encryptSecret } from './crypto.js';

const KEY = '12345678901234567890123456789012';

test('encryptSecret and decryptSecret round-trip a token value', () => {
  const encrypted = encryptSecret('token-value', { key: KEY });

  assert.notEqual(encrypted, 'token-value');
  assert.equal(decryptSecret(encrypted, { key: KEY }), 'token-value');
});

test('encryptSecret rejects empty secrets', () => {
  assert.throws(
    () => encryptSecret('', { key: KEY }),
    /required/i
  );
});
