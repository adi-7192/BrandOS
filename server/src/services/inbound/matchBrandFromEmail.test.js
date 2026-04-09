import test from 'node:test';
import assert from 'node:assert/strict';

import { matchBrandFromEmail } from './matchBrandFromEmail.js';

const brands = [
  { id: 'brand-1', name: 'BHV Marais' },
  { id: 'brand-2', name: 'Maison Kinsoud' },
];

test('matchBrandFromEmail prefers the brand explicitly named in the forwarded thread', () => {
  const match = matchBrandFromEmail({
    brands,
    subject: 'BHV Marais summer workshop campaign',
    text: 'Please keep the BHV Marais tone warm and neighbourhood-first.',
    from: 'sarah@example.com',
  });

  assert.deepEqual(match, brands[0]);
});

test('matchBrandFromEmail returns null when no brand is confidently mentioned', () => {
  const match = matchBrandFromEmail({
    brands,
    subject: 'Weekly stakeholder updates',
    text: 'Need help with a new campaign direction.',
    from: 'sarah@example.com',
  });

  assert.equal(match, null);
});
