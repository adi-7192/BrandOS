import test from 'node:test';
import assert from 'node:assert/strict';

import { parseStructuredJson } from './structuredOutput.js';

test('parseStructuredJson parses plain JSON objects', () => {
  const result = parseStructuredJson('{"linkedin":"Hello","blog":"World"}', {
    fallback: { linkedin: '', blog: '' },
    validate: (value) => typeof value?.linkedin === 'string' && typeof value?.blog === 'string',
  });

  assert.deepEqual(result, {
    data: { linkedin: 'Hello', blog: 'World' },
    usedFallback: false,
  });
});

test('parseStructuredJson strips markdown fences before parsing', () => {
  const result = parseStructuredJson('```json\n{"voiceAdjectives":["Bold","Calm","Precise"]}\n```', {
    fallback: { voiceAdjectives: [] },
    validate: (value) => Array.isArray(value?.voiceAdjectives),
  });

  assert.deepEqual(result, {
    data: { voiceAdjectives: ['Bold', 'Calm', 'Precise'] },
    usedFallback: false,
  });
});

test('parseStructuredJson returns fallback when validation fails', () => {
  const result = parseStructuredJson('{"linkedin":42}', {
    fallback: { linkedin: '', blog: '' },
    validate: (value) => typeof value?.linkedin === 'string' && typeof value?.blog === 'string',
  });

  assert.deepEqual(result, {
    data: { linkedin: '', blog: '' },
    usedFallback: true,
  });
});
