import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeInboundEmailContent } from './normalizeInboundEmail.js';

test('normalizeInboundEmailContent prefers plain text when available', () => {
  assert.equal(
    normalizeInboundEmailContent({ text: 'Hello team', html: '<p>Ignored</p>' }),
    'Hello team'
  );
});

test('normalizeInboundEmailContent falls back to stripped html', () => {
  assert.equal(
    normalizeInboundEmailContent({ html: '<p>Hello <strong>team</strong><br/>Need this by Friday</p>' }),
    'Hello team\nNeed this by Friday'
  );
});

test('normalizeInboundEmailContent trims extremely long email content', () => {
  const source = 'a'.repeat(13000);
  const result = normalizeInboundEmailContent({ text: source });

  assert.equal(result.length, 12003);
  assert.equal(result.endsWith('...'), true);
});
