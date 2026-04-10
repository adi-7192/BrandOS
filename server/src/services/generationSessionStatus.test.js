import test from 'node:test';
import assert from 'node:assert/strict';

import {
  hasMeaningfulSessionOutput,
  validateGenerationSessionPayload,
} from './generationSessionStatus.js';

test('hasMeaningfulSessionOutput detects generated content across supported output formats', () => {
  assert.equal(hasMeaningfulSessionOutput({ linkedin: '', blog: '' }), false);
  assert.equal(hasMeaningfulSessionOutput({ linkedin: 'Ready LinkedIn post', blog: '' }), true);
  assert.equal(hasMeaningfulSessionOutput({ linkedin: '', blog: 'Ready blog post' }), true);
});

test('validateGenerationSessionPayload keeps new campaigns in progress when they are created', () => {
  assert.equal(
    validateGenerationSessionPayload({
      status: 'in_progress',
      currentStep: 'brief',
      outputPayload: {},
    }, { mode: 'create' }),
    null
  );

  assert.equal(
    validateGenerationSessionPayload({
      status: 'completed',
      currentStep: 'output',
      outputPayload: { linkedin: 'Ready LinkedIn post' },
    }, { mode: 'create' }),
    'New campaigns must start in progress.'
  );
});

test('validateGenerationSessionPayload requires output content before a campaign can be saved or completed', () => {
  assert.equal(
    validateGenerationSessionPayload({
      status: 'saved',
      currentStep: 'output',
      outputPayload: {},
    }),
    'Campaigns can only be saved as draft after output has been generated.'
  );

  assert.equal(
    validateGenerationSessionPayload({
      status: 'completed',
      currentStep: 'preview',
      outputPayload: { linkedin: 'Ready LinkedIn post' },
    }),
    'Completed campaigns must remain on the output step.'
  );

  assert.equal(
    validateGenerationSessionPayload({
      status: 'completed',
      currentStep: 'output',
      outputPayload: { linkedin: 'Ready LinkedIn post' },
    }),
    null
  );
});

test('validateGenerationSessionPayload reserves abandoned for the delete flow', () => {
  assert.equal(
    validateGenerationSessionPayload({
      status: 'abandoned',
      currentStep: 'output',
      outputPayload: { linkedin: 'Ready LinkedIn post' },
    }),
    'Use the delete flow to abandon a campaign.'
  );

  assert.equal(
    validateGenerationSessionPayload({
      status: 'abandoned',
      currentStep: 'output',
      outputPayload: { linkedin: 'Ready LinkedIn post' },
    }, { allowAbandoned: true }),
    null
  );
});
