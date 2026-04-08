import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveDropdownState, isCustomOptionLabel } from './dropdown-flow.js';

test('isCustomOptionLabel detects Other and Custom options', () => {
  assert.equal(isCustomOptionLabel('Other'), true);
  assert.equal(isCustomOptionLabel("Custom — I'll describe my audience"), true);
  assert.equal(isCustomOptionLabel('France'), false);
});

test('resolveDropdownState keeps standard options selected directly', () => {
  assert.deepEqual(
    resolveDropdownState({
      value: 'France',
      options: ['France', 'Germany', 'Other'],
    }),
    {
      hasCustomOption: true,
      selectValue: 'France',
      customValue: '',
      customOptionLabel: 'Other',
      isCustomSelected: false,
    }
  );
});

test('resolveDropdownState treats non-option values as custom when custom option exists', () => {
  assert.deepEqual(
    resolveDropdownState({
      value: 'Benelux market',
      options: ['France', 'Germany', 'Other'],
    }),
    {
      hasCustomOption: true,
      selectValue: 'Other',
      customValue: 'Benelux market',
      customOptionLabel: 'Other',
      isCustomSelected: true,
    }
  );
});
