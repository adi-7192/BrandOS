import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAttentionItems,
  buildDraftOutputState,
  buildFlowlineCards,
  buildRecentActivity,
  getDashboardStage,
  pickPrimaryTask,
} from './dashboard-flow.js';

test('pickPrimaryTask prioritises pending briefs over recent drafts and setup actions', () => {
  const task = pickPrimaryTask({
    pendingBriefs: [{ id: 'card-1', brandName: 'BHV Marais' }],
    recentDrafts: [{ id: 'draft-1' }],
    brands: [{ id: 'brand-1' }],
  });

  assert.deepEqual(task, {
    kind: 'pending-brief',
    label: 'Review pending briefs',
  });
});

test('pickPrimaryTask falls back to recent drafts and then add brand', () => {
  assert.deepEqual(
    pickPrimaryTask({
      pendingBriefs: [],
      recentDrafts: [{ id: 'draft-1' }],
      brands: [{ id: 'brand-1' }],
    }),
    {
      kind: 'recent-draft',
      label: 'Resume latest draft',
    }
  );

  assert.deepEqual(
    pickPrimaryTask({
      pendingBriefs: [],
      recentDrafts: [],
      brands: [],
    }),
    {
      kind: 'add-brand',
      label: 'Create your first brand',
    }
  );
});

test('buildDraftOutputState maps a saved draft into output route state', () => {
  const routeState = buildDraftOutputState({
    id: 'draft-1',
    brandId: 'brand-1',
    brandName: 'BHV Marais',
    language: 'French',
    format: 'linkedin',
    content: 'Saved LinkedIn draft',
  });

  assert.deepEqual(routeState, {
    activeTab: 'linkedin',
    output: {
      linkedin: 'Saved LinkedIn draft',
      blog: '',
    },
    brief: {
      brandId: 'brand-1',
      brandName: 'BHV Marais',
      language: 'French',
    },
    draftMeta: {
      id: 'draft-1',
      format: 'linkedin',
    },
  });
});

test('getDashboardStage reflects whether the workspace is in setup, warm-up, or active mode', () => {
  assert.equal(
    getDashboardStage({
      pendingBriefs: [],
      recentDrafts: [],
      brands: [],
    }),
    'setup'
  );

  assert.equal(
    getDashboardStage({
      pendingBriefs: [],
      recentDrafts: [{ id: 'draft-1' }],
      brands: [{ id: 'brand-1' }],
    }),
    'warming-up'
  );

  assert.equal(
    getDashboardStage({
      pendingBriefs: [{ id: 'brief-1' }],
      recentDrafts: [],
      brands: [{ id: 'brand-1' }],
    }),
    'active'
  );
});

test('buildFlowlineCards prioritises pending briefs and falls back to drafts or setup prompts', () => {
  assert.deepEqual(
    buildFlowlineCards({
      pendingBriefs: [
        {
          id: 'brief-1',
          brandName: 'Atlas',
          emailSubject: 'Spring campaign',
          excerpt: 'Launch briefing',
          matchedFields: ['goal', 'cta'],
        },
      ],
      recentDrafts: [{ id: 'draft-1', brandName: 'Atlas', format: 'linkedin' }],
      brands: [{ id: 'brand-1', name: 'Atlas' }],
    }),
    [
      {
        id: 'brief-1',
        kind: 'brief',
        title: 'Spring campaign',
        eyebrow: 'Atlas',
        description: 'Launch briefing',
        meta: '2 fields found',
        ctaLabel: 'Open brief',
      },
    ]
  );

  assert.deepEqual(
    buildFlowlineCards({
      pendingBriefs: [],
      recentDrafts: [
        {
          id: 'draft-1',
          brandName: 'Atlas',
          format: 'linkedin',
          content: 'Saved post draft',
          versionNumber: 2,
        },
      ],
      brands: [{ id: 'brand-1', name: 'Atlas' }],
    }),
    [
      {
        id: 'draft-1',
        kind: 'draft',
        title: 'Resume LinkedIn draft',
        eyebrow: 'Atlas',
        description: 'Saved post draft',
        meta: 'Version 2',
        ctaLabel: 'Resume draft',
      },
    ]
  );

  assert.deepEqual(
    buildFlowlineCards({
      pendingBriefs: [],
      recentDrafts: [],
      brands: [],
    }),
    [
      {
        id: 'setup-brand',
        kind: 'setup',
        title: 'Create your first brand',
        eyebrow: 'Setup',
        description: 'Capture voice, audience, and channel rules before you generate.',
        meta: '5 minute setup',
        ctaLabel: 'Start setup',
      },
    ]
  );
});

test('buildRecentActivity merges briefs, drafts, and brand updates in reverse chronological order', () => {
  const items = buildRecentActivity({
    pendingBriefs: [
      {
        id: 'brief-1',
        brandId: 'brand-1',
        brandName: 'Atlas',
        emailSubject: 'Summer launch brief',
        createdAt: '2026-04-07T09:00:00.000Z',
      },
    ],
    recentDrafts: [
      {
        id: 'draft-1',
        brandId: 'brand-1',
        brandName: 'Atlas',
        format: 'blog',
        createdAt: '2026-04-07T10:00:00.000Z',
      },
    ],
    brands: [
      {
        id: 'brand-2',
        name: 'Northstar',
        updatedAt: '2026-04-06T10:00:00.000Z',
      },
    ],
  });

  assert.deepEqual(items, [
    {
      id: 'draft-draft-1',
      kind: 'draft',
      title: 'Draft saved',
      subject: 'Atlas blog draft',
      when: '2026-04-07T10:00:00.000Z',
      href: '/generate/output',
    },
    {
      id: 'brief-brief-1',
      kind: 'brief',
      title: 'New brief received',
      subject: 'Summer launch brief',
      when: '2026-04-07T09:00:00.000Z',
      href: '/generate/brief',
    },
    {
      id: 'brand-brand-2',
      kind: 'brand',
      title: 'Brand kit updated',
      subject: 'Northstar',
      when: '2026-04-06T10:00:00.000Z',
      href: '/settings/brands/brand-2',
    },
  ]);
});

test('buildAttentionItems prioritises pending briefs, then drafts, then setup gaps', () => {
  assert.deepEqual(
    buildAttentionItems({
      pendingBriefs: [
        {
          id: 'brief-1',
          brandName: 'Atlas',
          emailSubject: 'Summer launch brief',
        },
      ],
      recentDrafts: [
        {
          id: 'draft-1',
          brandName: 'Atlas',
          format: 'linkedin',
        },
      ],
      setup: {
        hasBrands: true,
        gmailAvailable: true,
      },
    }),
    [
      {
        id: 'brief-1',
        kind: 'brief',
        title: 'Summer launch brief',
        subtitle: 'Atlas',
        status: 'brief',
        actionLabel: 'Use brief',
      },
      {
        id: 'draft-1',
        kind: 'draft',
        title: 'Review LinkedIn draft',
        subtitle: 'Atlas',
        status: 'draft',
        actionLabel: 'Open draft',
      },
    ]
  );

  assert.deepEqual(
    buildAttentionItems({
      pendingBriefs: [],
      recentDrafts: [],
      setup: {
        hasBrands: false,
        gmailAvailable: false,
      },
    }),
    [
      {
        id: 'setup-brand',
        kind: 'setup',
        title: 'Create your first brand kit',
        subtitle: 'Brand memory starts here',
        status: 'setup',
        actionLabel: 'Start setup',
      },
      {
        id: 'setup-gmail',
        kind: 'settings',
        title: 'Finish Gmail configuration',
        subtitle: 'Enable tagged briefs to land in the inbox',
        status: 'setup',
        actionLabel: 'Open settings',
      },
    ]
  );
});
