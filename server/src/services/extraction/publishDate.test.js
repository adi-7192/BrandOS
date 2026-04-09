import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePublishDateValue } from './publishDate.js';

test('normalizePublishDateValue keeps valid ISO dates', () => {
  assert.equal(normalizePublishDateValue('2026-06-10', new Date('2026-04-09T00:00:00.000Z')), '2026-06-10');
});

test('normalizePublishDateValue resolves month-name dates against the next likely calendar date', () => {
  assert.equal(normalizePublishDateValue('June 10', new Date('2026-04-09T00:00:00.000Z')), '2026-06-10');
  assert.equal(normalizePublishDateValue('January 10', new Date('2026-04-09T00:00:00.000Z')), '2027-01-10');
});

test('normalizePublishDateValue supports US slash dates and rejects invalid input', () => {
  assert.equal(normalizePublishDateValue('6/10/2026', new Date('2026-04-09T00:00:00.000Z')), '2026-06-10');
  assert.equal(normalizePublishDateValue('not a date', new Date('2026-04-09T00:00:00.000Z')), '');
});
