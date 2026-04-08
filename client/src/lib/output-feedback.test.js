import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGlobalFeedbackInstruction,
  buildSelectionRewriteInstruction,
  canApplyGlobalFeedback,
  getSelectionState,
  replaceSelection,
} from './output-feedback.js';

test('buildGlobalFeedbackInstruction combines reaction, chips, and note into one clear instruction', () => {
  const instruction = buildGlobalFeedbackInstruction({
    reaction: 'needs_changes',
    chips: ['Too long', 'Add CTA'],
    note: 'Make it sound more premium.',
  });

  assert.equal(
    instruction,
    'The draft needs improvement. Feedback to address: Too long, Add CTA. Additional guidance: Make it sound more premium.'
  );
});

test('canApplyGlobalFeedback requires meaningful feedback and blocks while loading', () => {
  assert.equal(canApplyGlobalFeedback({ chips: [], note: '   ', reaction: '', loading: false }), false);
  assert.equal(canApplyGlobalFeedback({ chips: ['Too generic'], note: '', reaction: '', loading: false }), true);
  assert.equal(canApplyGlobalFeedback({ chips: [], note: '', reaction: 'needs_changes', loading: false }), true);
  assert.equal(canApplyGlobalFeedback({ chips: ['Too generic'], note: '', reaction: '', loading: true }), false);
});

test('buildSelectionRewriteInstruction combines chips and note for targeted rewrites', () => {
  const instruction = buildSelectionRewriteInstruction({
    chips: ['Shorter', 'More punchy'],
    note: 'Keep the same meaning.',
  });

  assert.equal(
    instruction,
    'Rewrite goals: Shorter, More punchy. Specific instruction: Keep the same meaning.'
  );
});

test('getSelectionState returns meaningful selection metadata', () => {
  assert.deepEqual(
    getSelectionState('Hello world', 0, 5),
    {
      start: 0,
      end: 5,
      text: 'Hello',
      hasSelection: true,
    }
  );
});

test('replaceSelection swaps only the selected part of the draft', () => {
  const result = replaceSelection(
    'Hello world',
    { start: 6, end: 11 },
    'BrandOS'
  );

  assert.equal(result, 'Hello BrandOS');
});
