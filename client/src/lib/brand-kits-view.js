const SWATCH_GROUPS = [
  ['#1f2a44', '#ef476f', '#f6e7c1', '#203864'],
  ['#c1121f', '#f8f9fa', '#2b2d42', '#edf2f4'],
  ['#d4a373', '#fefae0', '#1f1f1f', '#9c8c6c'],
  ['#2251c2', '#ffffff', '#ef233c', '#111111'],
  ['#1f1f1f', '#e0b93b', '#f7f7f2', '#6b7280'],
];

export function buildBrandCardModel(brand) {
  const kit = brand?.kit || {};
  const voice = kit.voiceAdjectives || [];
  const vocabulary = kit.vocabulary || [];
  const restricted = kit.restrictedWords || [];

  return {
    title: brand?.name || 'Untitled brand',
    descriptor: [brand?.market, brand?.language].filter(Boolean).join(' · ') || 'Market profile pending',
    toneSummary: voice.slice(0, 2).join(', ') || 'Voice still being defined',
    audienceSummary: kit.audienceType || 'Audience profile pending',
    status: {
      label: voice.length > 0 || vocabulary.length > 0 ? 'active' : 'draft',
      meta: `Kit v${brand?.kitVersion || 1}`,
    },
    signals: [
      kit.contentGoal,
      vocabulary[0],
      restricted[0] ? `Avoid: ${restricted[0]}` : null,
    ].filter(Boolean).slice(0, 3),
    swatches: pickSwatches(brand?.id || brand?.name || 'brand'),
  };
}

export function buildBrandDetailSections(brand) {
  const kit = brand?.kit || {};

  return {
    summary: [
      { label: 'Market', value: brand?.market || 'Pending' },
      { label: 'Language', value: brand?.language || 'Pending' },
      { label: 'Audience', value: kit.audienceType || 'Pending' },
      { label: 'Kit Version', value: `v${brand?.kitVersion || 1}` },
    ],
    cards: [
      {
        title: 'Brand voice',
        tone: 'accent',
        items: kit.voiceAdjectives || [],
        empty: 'Voice guidance has not been defined yet.',
      },
      {
        title: 'Vocabulary to use',
        tone: 'success',
        items: kit.vocabulary || [],
        empty: 'Preferred vocabulary has not been added yet.',
      },
      {
        title: 'Restricted words',
        tone: 'warning',
        items: kit.restrictedWords || [],
        empty: 'No restricted words have been set yet.',
      },
      {
        title: 'Channel rules',
        tone: 'neutral',
        items: [
          kit.channelRulesLinkedin ? `LinkedIn: ${kit.channelRulesLinkedin}` : null,
          kit.channelRulesBlog ? `Blog: ${kit.channelRulesBlog}` : null,
        ].filter(Boolean),
        empty: 'Channel rules have not been added yet.',
      },
      {
        title: 'Content strategy',
        tone: 'neutral',
        items: [kit.contentGoal, kit.publishingFrequency].filter(Boolean),
        empty: 'Strategy details have not been added yet.',
      },
    ],
  };
}

function pickSwatches(seed) {
  return SWATCH_GROUPS[hashSeed(seed) % SWATCH_GROUPS.length];
}

function hashSeed(value) {
  return String(value).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
