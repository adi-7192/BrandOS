import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInboxAiCard,
  cleanOriginalMailBody,
} from './inbox-ai-view.js';

const matchedCard = {
  id: 'card-1',
  brandId: 'brand-1',
  brandName: 'Nike',
  emailSubject: 'Fwd: Nike 123 launch campaign',
  emailFrom: 'dianarosedino24@gmail.com',
  emailBody: `---------- Forwarded message ---------
From: Diana Rose Dino <dianarosedino24@gmail.com>
Date: Thu, Apr 9, 2026 at 4:22 PM
Subject: Re: Nike 123 launch campaign
To: Jillian Rodrigues <jillianrodrigues91@gmail.com>

Hi Jillian,

We are launching Nike 123 next Friday.
We need a LinkedIn post and a blog.
Please keep the tone sharper and less hype-driven than previous launches.
Audience is urban Gen Z runners.
Avoid "disruptive" going forward.`,
  classification: 'mixed',
  routingStatus: 'matched',
  campaignActionStatus: 'pending',
  brandUpdateActionStatus: 'pending',
  interpretationSummary: 'BrandOS detected a launch brief and a likely lasting tone adjustment.',
  overallScore: 0.86,
  publishDate: '2026-04-18',
  extractedFields: {
    key_message: 'Launch Nike 123 with a sharper, less hype-driven voice.',
    campaign_type: 'product launch',
    audience: 'Urban Gen Z runners',
    tone_shift: 'Sharper, less hype-driven',
    content_goal: 'Brand visibility',
    cta_intent: 'Drive launch awareness',
    publish_date: '2026-04-18',
  },
  matchedFields: ['key_message', 'campaign_type', 'audience', 'tone_shift', 'content_goal', 'publish_date'],
  brandUpdateProposal: {
    summary: 'Tone and vocabulary updates look like lasting brand guidance.',
    fields: {
      toneShift: {
        current: 'Bold and energetic',
        suggested: 'Sharper and less hype-driven',
        reason: 'The stakeholder explicitly asked for a more restrained launch tone.',
        sourceQuote: 'Please keep the tone sharper and less hype-driven than previous launches.',
      },
      restrictedWords: {
        current: ['disruptive'],
        suggested: ['disruptive', 'revolutionary'],
        reason: 'The email suggests steering away from overblown launch language.',
        sourceQuote: 'Avoid "disruptive" going forward.',
      },
    },
  },
  status: 'pending',
  createdAt: '2026-04-09T14:22:00.000Z',
  providerMessageId: '<message-id>',
};

const unmatchedCard = {
  id: 'card-2',
  brandId: '',
  brandName: 'Needs routing',
  emailSubject: 'Fwd: Summer content direction',
  emailFrom: 'someone@example.com',
  emailBody: 'We need content for the summer push and maybe a tone update.',
  classification: 'needs_routing',
  routingStatus: 'needs_routing',
  campaignActionStatus: 'not_applicable',
  brandUpdateActionStatus: 'not_applicable',
  interpretationSummary: 'BrandOS could not confidently match this thread to a brand yet.',
  overallScore: 0.1,
  extractedFields: {},
  matchedFields: [],
  brandUpdateProposal: { summary: '', fields: {} },
  status: 'pending',
  createdAt: '2026-04-09T14:28:00.000Z',
};

test('buildInboxAiCard creates a concise AI-first model for matched mixed updates', () => {
  const card = buildInboxAiCard(matchedCard);

  assert.equal(card.aiTitle, 'Campaign brief and brand updates detected');
  assert.match(card.aiSummary, /launch brief/i);
  assert.match(card.aiSummary, /lasting tone adjustment/i);
  assert.deepEqual(card.highlights, [
    'Audience: Urban Gen Z runners',
    'Publish date: Apr 18, 2026',
    'Brand changes suggested: Tone shift, Restricted words',
  ]);
  assert.equal(card.campaign.visible, true);
  assert.equal(card.brandUpdates.visible, true);
  assert.deepEqual(card.actions.map((action) => action.id), [
    'generate-brief',
    'generate-content',
    'update-brand-kit',
    'dismiss',
    'view-original',
  ]);
  assert.equal(card.recommendedActionId, 'generate-content');
  assert.equal(card.originalMail.subject, matchedCard.emailSubject);
  assert.ok(!card.originalMail.body.includes('Forwarded message'));
  assert.ok(!card.originalMail.body.includes('Subject: Re: Nike 123 launch campaign'));
});

test('buildInboxAiCard keeps unmatched items focused on routing help', () => {
  const card = buildInboxAiCard(unmatchedCard);

  assert.equal(card.aiTitle, 'Needs routing before BrandOS can act');
  assert.match(card.aiSummary, /could not confidently match/i);
  assert.equal(card.campaign.visible, false);
  assert.equal(card.brandUpdates.visible, false);
  assert.deepEqual(card.actions.map((action) => action.id), [
    'route-thread',
    'dismiss',
    'view-original',
  ]);
  assert.equal(card.recommendedActionId, 'route-thread');
});

test('cleanOriginalMailBody removes forwarded header noise while keeping the real message', () => {
  const cleaned = cleanOriginalMailBody(matchedCard.emailBody);

  assert.ok(!cleaned.includes('Forwarded message'));
  assert.ok(!cleaned.includes('From: Diana Rose Dino'));
  assert.ok(cleaned.includes('Hi Jillian'));
  assert.ok(cleaned.includes('We need a LinkedIn post and a blog.'));
});
