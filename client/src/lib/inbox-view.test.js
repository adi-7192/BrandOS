import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInboxCounts,
  groupInboxThreads,
  pickThreadSource,
} from './inbox-view.js';

const cards = [
  {
    id: 'card-1',
    threadId: 'thread-1',
    brandName: 'BHV Marais',
    emailSubject: 'Summer workshop series',
    emailFrom: 'Sarah Chen',
    emailBody: 'Full thread body A',
    excerpt: 'Need content by Friday',
    matchedFields: ['campaign', 'tone'],
    status: 'pending',
    createdAt: '2026-04-07T10:00:00.000Z',
  },
  {
    id: 'card-2',
    threadId: 'thread-1',
    brandName: 'BHV Marais',
    emailSubject: 'Summer workshop series',
    emailFrom: 'Sarah Chen',
    emailBody: 'Full thread body A',
    excerpt: 'Voice should feel intimate',
    matchedFields: ['tone'],
    status: 'pending',
    createdAt: '2026-04-07T09:00:00.000Z',
  },
  {
    id: 'card-3',
    threadId: 'thread-2',
    brandName: 'Sezane',
    emailSubject: 'Autumn collection update',
    emailFrom: 'Brand Team',
    emailBody: 'Full thread body B',
    excerpt: 'More restrained tone',
    matchedFields: ['tone'],
    status: 'used',
    createdAt: '2026-04-06T10:00:00.000Z',
  },
];

test('buildInboxCounts returns counts across statuses for tabs', () => {
  assert.deepEqual(buildInboxCounts(cards), {
    pending: 2,
    used: 1,
    dismissed: 0,
  });
});

test('groupInboxThreads groups extracted updates under one thread and sorts newest first', () => {
  const threads = groupInboxThreads(cards);

  assert.equal(threads.length, 2);
  assert.deepEqual(threads[0], {
    id: 'thread-1',
    subject: 'Summer workshop series',
    brandName: 'BHV Marais',
    sourceLabel: 'Sarah Chen',
    createdAt: '2026-04-07T10:00:00.000Z',
    updateCount: 2,
    statuses: ['pending'],
    cards: [cards[0], cards[1]],
  });
});

test('pickThreadSource returns the full source mail and related updates for a selected card', () => {
  assert.deepEqual(pickThreadSource(cards, 'card-2'), {
    threadId: 'thread-1',
    subject: 'Summer workshop series',
    sourceLabel: 'Sarah Chen',
    emailBody: 'Full thread body A',
    createdAt: '2026-04-07T10:00:00.000Z',
    cards: [cards[0], cards[1]],
  });
});
