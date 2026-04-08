import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_KIT_CARDS,
  normalizeKitCards,
  updateKitCardArrayField,
  updateKitCardChannelRule,
} from './kit-review.js';

test('normalizeKitCards fills missing kit card fields with safe defaults', () => {
  assert.deepEqual(
    normalizeKitCards({
      voiceAdjectives: ['Warm'],
    }),
    {
      voiceAdjectives: ['Warm'],
      vocabulary: DEFAULT_KIT_CARDS.vocabulary,
      restrictedWords: DEFAULT_KIT_CARDS.restrictedWords,
      channelRules: {
        linkedin: DEFAULT_KIT_CARDS.channelRules.linkedin,
        blog: DEFAULT_KIT_CARDS.channelRules.blog,
      },
    }
  );
});

test('updateKitCardArrayField trims and filters empty values', () => {
  assert.deepEqual(
    updateKitCardArrayField(
      {
        voiceAdjectives: ['Warm'],
        vocabulary: [],
        restrictedWords: [],
        channelRules: { linkedin: '', blog: '' },
      },
      'restrictedWords',
      ' cheap, free ,, guarantee '
    ),
    {
      voiceAdjectives: ['Warm'],
      vocabulary: [],
      restrictedWords: ['cheap', 'free', 'guarantee'],
      channelRules: {
        linkedin: DEFAULT_KIT_CARDS.channelRules.linkedin,
        blog: DEFAULT_KIT_CARDS.channelRules.blog,
      },
    }
  );
});

test('updateKitCardChannelRule updates one channel rule without losing the other', () => {
  assert.deepEqual(
    updateKitCardChannelRule(
      {
        voiceAdjectives: ['Warm'],
        vocabulary: ['craft'],
        restrictedWords: ['cheap'],
        channelRules: {
          linkedin: 'Short and direct',
          blog: 'Use subheadings',
        },
      },
      'blog',
      'Use subheadings and examples'
    ),
    {
      voiceAdjectives: ['Warm'],
      vocabulary: ['craft'],
      restrictedWords: ['cheap'],
      channelRules: {
        linkedin: 'Short and direct',
        blog: 'Use subheadings and examples',
      },
    }
  );
});
