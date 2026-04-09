import test from 'node:test';
import assert from 'node:assert/strict';

import { buildKitLiveNextSteps } from './kit-live-flow.js';

test('buildKitLiveNextSteps returns simple actionable next steps in plain english', () => {
  assert.deepEqual(buildKitLiveNextSteps(), [
    {
      title: 'Connect Gmail',
      description: 'Bring campaign briefs into BrandOS automatically so you can review new requests without copying them over by hand.',
    },
    {
      title: 'Go to your dashboard',
      description: 'See what needs attention next, track deadlines, and jump back into active work in one place.',
    },
    {
      title: 'Add another brand',
      description: 'Set up the next brand now so every team or market has its own kit before new work starts coming in.',
    },
  ]);
});
