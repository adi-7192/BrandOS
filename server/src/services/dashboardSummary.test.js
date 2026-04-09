import test from 'node:test';
import assert from 'node:assert/strict';

import { buildUpcomingDeadlineItems } from './dashboardSummary.js';

test('buildUpcomingDeadlineItems prefers active sessions over their source pending briefs', () => {
  const items = buildUpcomingDeadlineItems([
    {
      kind: 'brief',
      source_id: 'brief-1',
      brand_name: 'Atlas',
      title: 'Summer workshop content',
      publish_date: '2026-04-12',
      state_label: 'Pending brief',
      updated_at: '2026-04-08T09:00:00.000Z',
      source_card_ids: [],
      current_step: null,
    },
    {
      kind: 'session',
      source_id: 'session-1',
      brand_name: 'Atlas',
      title: 'Summer workshop content',
      publish_date: '2026-04-12',
      state_label: 'In progress',
      updated_at: '2026-04-08T10:00:00.000Z',
      source_card_ids: ['brief-1'],
      current_step: 'preview',
    },
  ]);

  assert.deepEqual(items, [
    {
      id: 'session-1',
      kind: 'session',
      title: 'Summer workshop content',
      brandName: 'Atlas',
      publishDate: '2026-04-12',
      stateLabel: 'In progress',
      sourceCardIds: ['brief-1'],
      currentStep: 'preview',
      updatedAt: '2026-04-08T10:00:00.000Z',
    },
  ]);
});
