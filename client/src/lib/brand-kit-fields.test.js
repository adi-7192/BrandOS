import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAgeRangeDropdownLabel,
  formatAgeRanges,
  normalizeAgeRanges,
} from './brand-kit-fields.js';

test('normalizeAgeRanges preserves multiple selected age ranges without duplicates', () => {
  assert.deepEqual(
    normalizeAgeRanges(['18–24', '25–34', '18–24', ' 35–44 ']),
    ['18–24', '25–34', '35–44']
  );
});

test('normalizeAgeRanges can read the saved joined age range format', () => {
  assert.deepEqual(
    normalizeAgeRanges('18–24 · 25–34 · 35–44'),
    ['18–24', '25–34', '35–44']
  );
});

test('formatAgeRanges stores multi-select age ranges as one readable brand-kit field', () => {
  assert.equal(formatAgeRanges(['18–24', '25–34']), '18–24 · 25–34');
});

test('buildAgeRangeDropdownLabel summarizes checkbox dropdown selections', () => {
  assert.equal(buildAgeRangeDropdownLabel([]), 'Select age ranges...');
  assert.equal(buildAgeRangeDropdownLabel(['18–24', '25–34']), '18–24 · 25–34');
});
