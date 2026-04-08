import test from 'node:test';
import assert from 'node:assert/strict';

import { buildConfirmedBrief, buildGeneratingContext } from './generation-flow.js';

test('buildConfirmedBrief keeps canonical brief context while applying manual overrides', () => {
  const brief = buildConfirmedBrief(
    {
      brandName: 'BHV Marais',
      audienceType: '28-40 urban creatives',
      contentGoal: 'Brand visibility',
      kit: { restrictedWords: ['cheap'] },
    },
    {
      audienceType: 'Design-conscious travellers',
      contentGoal: '',
    }
  );

  assert.deepEqual(brief, {
    brandName: 'BHV Marais',
    audienceType: 'Design-conscious travellers',
    contentGoal: 'Brand visibility',
    kit: { restrictedWords: ['cheap'] },
  });
});

test('buildGeneratingContext exposes the real kit-backed context summary', () => {
  const context = buildGeneratingContext({
    language: 'French',
    toneShift: 'More editorial',
    audienceType: 'Design-conscious travellers',
    contentGoal: 'Brand visibility',
    keyMessage: 'Craft-led summer series',
    kit: {
      voiceAdjectives: ['Warm', 'Intimate'],
      restrictedWords: ['cheap', 'free'],
    },
  });

  assert.deepEqual(context, {
    voice: 'Warm, Intimate',
    language: 'French',
    toneShift: 'More editorial',
    audience: 'Design-conscious travellers',
    guardrailCount: 2,
    goal: 'Brand visibility',
    keyMessage: 'Craft-led summer series',
  });
});
