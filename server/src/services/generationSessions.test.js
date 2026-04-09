import test from 'node:test';
import assert from 'node:assert/strict';

import { mapGenerationSessionRow } from './generationSessions.js';

test('mapGenerationSessionRow normalizes a persisted session row for API responses', () => {
  const session = mapGenerationSessionRow({
    id: 'session-1',
    user_id: 'user-1',
    brand_id: 'brand-1',
    brand_name: 'Apple',
    brand_language: 'English',
    session_title: 'Spring launch',
    source: 'manual',
    source_card_ids: ['card-1'],
    status: 'in_progress',
    current_step: 'preview',
    publish_date: '2026-06-10',
    brief_payload: { campaignName: 'Spring launch' },
    preview_payload: { linkedin: { hook: 'Hello' } },
    output_payload: { linkedin: 'Draft text' },
    active_tab: 'linkedin',
    last_instruction: 'Make it shorter',
    created_at: '2026-04-08T10:00:00.000Z',
    updated_at: '2026-04-08T10:10:00.000Z',
  });

  assert.deepEqual(session, {
    id: 'session-1',
    userId: 'user-1',
    brandId: 'brand-1',
    brandName: 'Apple',
    language: 'English',
    sessionTitle: 'Spring launch',
    source: 'manual',
    sourceCardIds: ['card-1'],
    status: 'in_progress',
    currentStep: 'preview',
    publishDate: '2026-06-10',
    briefPayload: { campaignName: 'Spring launch' },
    previewPayload: { linkedin: { hook: 'Hello' } },
    outputPayload: { linkedin: 'Draft text' },
    activeTab: 'linkedin',
    lastInstruction: 'Make it shorter',
    createdAt: '2026-04-08T10:00:00.000Z',
    updatedAt: '2026-04-08T10:10:00.000Z',
  });
});
