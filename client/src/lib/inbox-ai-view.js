const CAMPAIGN_FIELD_LABELS = {
  campaign_type: 'Campaign type',
  key_message: 'Key message',
  audience: 'Audience',
  tone_shift: 'Tone',
  content_goal: 'Content goal',
  cta_intent: 'CTA',
  publish_date: 'Publish date',
};

const BRAND_FIELD_LABELS = {
  voiceAdjectives: 'Voice',
  vocabulary: 'Vocabulary',
  restrictedWords: 'Restricted words',
  audienceType: 'Audience',
  toneShift: 'Tone shift',
  proofStyle: 'Proof style',
  channelRulesLinkedin: 'LinkedIn rules',
  channelRulesBlog: 'Blog rules',
};

export function buildInboxAiCard(card) {
  const needsRouting = card.routingStatus === 'needs_routing' || !card.brandId;
  const campaignFields = buildCampaignFields(card);
  const brandChanges = buildBrandChanges(card);
  const aiTitle = buildAiTitle(card, { needsRouting, campaignFields, brandChanges });
  const aiSummary = buildAiSummary(card, { needsRouting, campaignFields, brandChanges });
  const actions = buildActions(card, { needsRouting, brandChanges, campaignFields });

  return {
    id: card.id,
    brandId: card.brandId || '',
    brandName: card.brandName || 'Needs routing',
    emailSubject: card.emailSubject || 'Untitled thread',
    emailFrom: card.emailFrom || 'Unknown sender',
    createdAt: card.createdAt || '',
    status: card.status || 'pending',
    confidence: buildConfidenceView(card.overallScore),
    needsRouting,
    classification: card.classification || 'campaign',
    aiTitle,
    aiSummary,
    highlights: buildHighlights(card, { campaignFields, brandChanges, needsRouting }),
    campaign: {
      visible: !needsRouting && campaignFields.length > 0,
      fields: campaignFields,
    },
    brandUpdates: {
      visible: !needsRouting && brandChanges.length > 0,
      summary: card.brandUpdateProposal?.summary || '',
      changes: brandChanges,
    },
    actions,
    recommendedActionId: actions.find((action) => action.recommended)?.id || '',
    originalMail: {
      subject: card.emailSubject || 'Untitled thread',
      from: card.emailFrom || 'Unknown sender',
      createdAt: card.createdAt || '',
      body: cleanOriginalMailBody(card.emailBody || ''),
      messageId: card.providerMessageId || '',
      recipients: card.emailTo || [],
    },
    raw: card,
  };
}

export function cleanOriginalMailBody(value) {
  const lines = String(value || '').split(/\r?\n/);
  const trimmedLines = [...lines];

  while (trimmedLines.length > 0) {
    const line = trimmedLines[0].trim();
    if (!line) {
      trimmedLines.shift();
      continue;
    }

    if (
      /^[-_]{2,}\s*Forwarded message\s*[-_]{2,}$/i.test(line) ||
      /^(from|date|subject|to|cc|bcc):/i.test(line)
    ) {
      trimmedLines.shift();
      continue;
    }

    break;
  }

  return trimmedLines.join('\n').trim();
}

function buildCampaignFields(card) {
  const extracted = card.extractedFields || {};

  return Object.entries(CAMPAIGN_FIELD_LABELS)
    .map(([key, label]) => {
      const rawValue = extracted[key];
      if (!rawValue) return null;

      return {
        key,
        label,
        value: key === 'publish_date' ? formatDisplayDate(rawValue) : String(rawValue),
        rawValue,
      };
    })
    .filter(Boolean);
}

function buildBrandChanges(card) {
  const fields = card.brandUpdateProposal?.fields || {};

  return Object.entries(fields).map(([field, proposal]) => ({
    field,
    label: BRAND_FIELD_LABELS[field] || startCase(field),
    current: formatProposalValue(proposal.current),
    suggested: formatProposalValue(proposal.suggested),
    reason: proposal.reason || '',
    sourceQuote: proposal.sourceQuote || '',
  }));
}

function buildAiTitle(card, { needsRouting, campaignFields, brandChanges }) {
  if (needsRouting) {
    return 'Needs routing before BrandOS can act';
  }

  if (campaignFields.length > 0 && brandChanges.length > 0) {
    return 'Campaign brief and brand updates detected';
  }

  if (brandChanges.length > 0) {
    return 'Brand updates detected';
  }

  if (campaignFields.length > 0) {
    return 'Campaign brief detected';
  }

  return 'Thread ready for review';
}

function buildAiSummary(card, { needsRouting, campaignFields, brandChanges }) {
  const summary = String(card.interpretationSummary || '').trim();

  if (needsRouting) {
    return summary || 'BrandOS needs a quick routing instruction before it can create a campaign or review lasting brand updates.';
  }

  const parts = [];
  if (summary) {
    parts.push(summary);
  }

  if (campaignFields.length > 0 && brandChanges.length > 0) {
    parts.push('You can turn this into a campaign, review the lasting brand changes, or do both one at a time.');
  } else if (campaignFields.length > 0) {
    parts.push('BrandOS pulled the campaign details into a ready-to-review brief so you can move into planning or generation quickly.');
  } else if (brandChanges.length > 0) {
    parts.push('BrandOS isolated the likely lasting kit changes so you can review them without pulling one-off campaign notes into the brand memory.');
  }

  return parts.filter(Boolean).join(' ');
}

function buildHighlights(card, { campaignFields, brandChanges, needsRouting }) {
  if (needsRouting) {
    return ['Tell BrandOS which brand this belongs to and whether it should create a campaign, update the brand kit, or both.'];
  }

  const highlights = [];
  const audience = campaignFields.find((field) => field.key === 'audience');
  const publishDate = campaignFields.find((field) => field.key === 'publish_date');

  if (audience) {
    highlights.push(`${audience.label}: ${audience.value}`);
  }

  if (publishDate) {
    highlights.push(`${publishDate.label}: ${publishDate.value}`);
  }

  if (brandChanges.length > 0) {
    highlights.push(`Brand changes suggested: ${brandChanges.slice(0, 2).map((change) => change.label).join(', ')}`);
  }

  return highlights.slice(0, 3);
}

function buildActions(card, { needsRouting, brandChanges, campaignFields }) {
  if (needsRouting) {
    return [
      { id: 'route-thread', label: 'Route thread', recommended: true },
      ...(card.status === 'pending' ? [{ id: 'dismiss', label: 'Dismiss', tone: 'subtle' }] : []),
      { id: 'view-original', label: 'View original email', tone: 'link' },
    ];
  }

  const campaignReadyForDirectGeneration = campaignFields.length >= 4 && Number(card.overallScore || 0) >= 0.75;
  const actions = [];

  if (card.campaignActionStatus !== 'not_applicable') {
    actions.push({
      id: 'generate-brief',
      label: card.campaignActionStatus === 'done' ? 'Campaign done' : 'Generate brief',
      disabled: card.campaignActionStatus === 'done',
      recommended: !campaignReadyForDirectGeneration,
    });
    actions.push({
      id: 'generate-content',
      label: 'Generate content',
      disabled: card.campaignActionStatus === 'done',
      recommended: campaignReadyForDirectGeneration,
    });
  }

  if (brandChanges.length > 0) {
    actions.push({
      id: 'update-brand-kit',
      label: card.brandUpdateActionStatus === 'done' ? 'Brand updates done' : 'Update brand kit',
      disabled: card.brandUpdateActionStatus === 'done',
      recommended: card.campaignActionStatus === 'not_applicable',
    });
  }

  if (card.status === 'pending') {
    actions.push({ id: 'dismiss', label: 'Dismiss', tone: 'subtle' });
  }

  actions.push({ id: 'view-original', label: 'View original email', tone: 'link' });

  if (!actions.some((action) => action.recommended) && actions[0]) {
    actions[0].recommended = true;
  }

  return actions;
}

function buildConfidenceView(score) {
  const value = Number(score || 0);

  if (value >= 0.75) {
    return { label: 'High confidence', tone: 'positive' };
  }

  if (value >= 0.45) {
    return { label: 'Partial confidence', tone: 'warning' };
  }

  return { label: 'Low confidence', tone: 'neutral' };
}

function formatProposalValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None set';
  }

  return value || 'None set';
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return String(value || '');

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function startCase(value) {
  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}
