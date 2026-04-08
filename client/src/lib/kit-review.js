export const DEFAULT_KIT_CARDS = {
  voiceAdjectives: ['Authentic', 'Confident', 'Approachable'],
  vocabulary: ['innovation', 'community', 'experience', 'craft', 'quality'],
  restrictedWords: ['cheap', 'free', 'guarantee', 'best'],
  channelRules: {
    linkedin: 'Max 220 words · Hook in line 1 · Max 3 hashtags · No em dashes',
    blog: '700–900 words · Subheadings required · End with a question or call to action',
  },
};

export function normalizeKitCards(kitCards = {}) {
  return {
    voiceAdjectives: Array.isArray(kitCards.voiceAdjectives) ? kitCards.voiceAdjectives : [...DEFAULT_KIT_CARDS.voiceAdjectives],
    vocabulary: Array.isArray(kitCards.vocabulary) ? kitCards.vocabulary : [...DEFAULT_KIT_CARDS.vocabulary],
    restrictedWords: Array.isArray(kitCards.restrictedWords) ? kitCards.restrictedWords : [...DEFAULT_KIT_CARDS.restrictedWords],
    channelRules: {
      linkedin: kitCards.channelRules?.linkedin || DEFAULT_KIT_CARDS.channelRules.linkedin,
      blog: kitCards.channelRules?.blog || DEFAULT_KIT_CARDS.channelRules.blog,
    },
  };
}

export function updateKitCardArrayField(kitCards, field, rawValue) {
  return {
    ...normalizeKitCards(kitCards),
    [field]: String(rawValue || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  };
}

export function updateKitCardChannelRule(kitCards, channel, value) {
  const normalized = normalizeKitCards(kitCards);

  return {
    ...normalized,
    channelRules: {
      ...normalized.channelRules,
      [channel]: value,
    },
  };
}
