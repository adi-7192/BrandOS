import test from 'node:test';
import assert from 'node:assert/strict';

import {
  captureKitCardSnapshot,
  shouldResetApprovedCard,
  updateKitCardArrayField,
} from './kit-review.js';

test('updateKitCardArrayField supports comma-separated and newline-separated tag edits', () => {
  const next = updateKitCardArrayField(
    {
      voiceAdjectives: ['Warm'],
      vocabulary: ['community'],
      restrictedWords: ['cheap'],
      channelRules: {
        linkedin: 'Keep it short',
        blog: 'Use subheadings',
      },
    },
    'vocabulary',
    'founder story, proof-led insight\n customer quote , founder story'
  );

  assert.deepEqual(next.vocabulary, [
    'founder story',
    'proof-led insight',
    'customer quote',
  ]);
});

test('shouldResetApprovedCard only resets the edited card when its approved snapshot changes', () => {
  const originalCards = {
    voiceAdjectives: ['Warm', 'Intimate'],
    vocabulary: ['craft', 'community'],
    restrictedWords: ['cheap'],
    channelRules: {
      linkedin: 'Hook in line 1',
      blog: 'Use subheadings',
    },
  };

  const approvedSnapshots = {
    voice: captureKitCardSnapshot(originalCards, 'voice'),
    vocab: captureKitCardSnapshot(originalCards, 'vocab'),
  };

  const editedCards = updateKitCardArrayField(originalCards, 'vocabulary', 'craft, community, editorial retail');

  assert.equal(
    shouldResetApprovedCard({
      cardKey: 'voice',
      approved: true,
      approvedSnapshots,
      currentCards: editedCards,
    }),
    false
  );

  assert.equal(
    shouldResetApprovedCard({
      cardKey: 'vocab',
      approved: true,
      approvedSnapshots,
      currentCards: editedCards,
    }),
    true
  );
});
