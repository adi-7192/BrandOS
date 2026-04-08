import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGenerationSessionPayload,
  buildSessionRoute,
  buildResumeSessionItem,
  buildSessionQuery,
} from './generation-session.js';

test('buildGenerationSessionPayload captures in-progress workflow state from the first field change', () => {
  const payload = buildGenerationSessionPayload({
    brief: {
      brandId: 'brand-1',
      brandName: 'Apple',
      campaignName: 'Spring launch',
      mode: 'manual',
      sourceCardIds: [],
    },
    sections: {
      linkedin: { hook: 'Big launch', body: '', closing: '', hashtags: '' },
      blog: { headline: '', opening: '', body: '', closing: '' },
    },
    output: {
      linkedin: '',
      blog: '',
    },
    currentStep: 'preview',
    activeTab: 'linkedin',
    lastInstruction: '',
  });

  assert.deepEqual(payload, {
    brandId: 'brand-1',
    sessionTitle: 'Spring launch',
    source: 'manual',
    sourceCardIds: [],
    currentStep: 'preview',
    status: 'in_progress',
    activeTab: 'linkedin',
    lastInstruction: '',
    briefPayload: {
      brandId: 'brand-1',
      brandName: 'Apple',
      campaignName: 'Spring launch',
      mode: 'manual',
      sourceCardIds: [],
    },
    previewPayload: {
      linkedin: { hook: 'Big launch', body: '', closing: '', hashtags: '' },
      blog: { headline: '', opening: '', body: '', closing: '' },
    },
    outputPayload: {
      linkedin: '',
      blog: '',
    },
  });
});

test('buildResumeSessionItem creates a concise picker item for resumable sessions', () => {
  const item = buildResumeSessionItem({
    id: 'session-1',
    sessionTitle: 'Spring launch',
    currentStep: 'output',
    source: 'manual',
    updatedAt: '2026-04-08T18:00:00.000Z',
  });

  assert.deepEqual(item, {
    id: 'session-1',
    title: 'Spring launch',
    subtitle: 'Manual brief · Output',
    updatedAt: '2026-04-08T18:00:00.000Z',
  });
});

test('buildSessionQuery appends the generation session id to the route', () => {
  assert.equal(buildSessionQuery('session-1'), '?sessionId=session-1');
  assert.equal(buildSessionQuery(''), '');
});

test('buildSessionRoute reopens the exact saved stage for a generation session', () => {
  assert.equal(
    buildSessionRoute({ id: 'session-1', currentStep: 'preview' }),
    '/generate/preview?sessionId=session-1'
  );
  assert.equal(
    buildSessionRoute({ id: 'session-2', currentStep: 'output' }),
    '/generate/output?sessionId=session-2'
  );
});
