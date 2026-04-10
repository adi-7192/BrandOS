import test from 'node:test';
import assert from 'node:assert/strict';

import { buildKitLiveNextSteps } from './kit-live-flow.js';

test('buildKitLiveNextSteps returns simple actionable next steps in plain english', () => {
  assert.deepEqual(buildKitLiveNextSteps(), [
    {
      title: 'Connect your inbox',
      description: 'Bring campaign briefs into BrandOS automatically so you can review new requests without copying them over by hand.',
    },
    {
      title: 'Connect LinkedIn',
      description: 'Set up direct personal posting once so approved LinkedIn drafts can be published from BrandOS.',
    },
    {
      title: 'Create your first campaign',
      description: 'Start from the dashboard when you are ready to turn a campaign brief into review-ready content.',
    },
  ]);
});
