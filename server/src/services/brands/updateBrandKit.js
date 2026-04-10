import { normalizeFunnelStages } from '../../lib/brandKitFields.js';

const ARRAY_FIELDS = new Set([
  'voiceAdjectives',
  'vocabulary',
  'restrictedWords',
  'websiteUrls',
]);

const TEXT_FIELDS = [
  'channelRulesLinkedin',
  'channelRulesBlog',
  'contentGoal',
  'publishingFrequency',
  'audienceType',
  'buyerSeniority',
  'ageRange',
  'industrySector',
  'industryTarget',
  'toneShift',
  'proofStyle',
  'campaignCoreWhy',
  'pastContentExamples',
  'websiteUrl',
  'websiteSummary',
];

export function normalizeEditableBrandKitPatch(input = {}) {
  const patch = {};

  for (const field of ARRAY_FIELDS) {
    if (field in input) {
      patch[field] = normalizeListField(input[field]);
    }
  }

  if ('funnelStages' in input) {
    patch.funnelStages = normalizeFunnelStagePatch(input.funnelStages);
  }

  for (const field of TEXT_FIELDS) {
    if (field in input) {
      patch[field] = normalizeTextField(input[field]);
    }
  }

  if ('voiceFormality' in input) {
    patch.voiceFormality = normalizeNumericField(input.voiceFormality);
  }

  return patch;
}

function normalizeListField(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => normalizeTextField(entry)).filter(Boolean))];
  }

  return [...new Set(
    String(value || '')
      .split(',')
      .map((entry) => normalizeTextField(entry))
      .filter(Boolean)
  )];
}

function normalizeFunnelStagePatch(value) {
  if (Array.isArray(value)) {
    return normalizeFunnelStages(value);
  }

  const normalized = String(value || '')
    .split(',')
    .map((entry) => normalizeTextField(entry))
    .filter(Boolean);

  return normalizeFunnelStages(normalized);
}

function normalizeTextField(value) {
  return String(value ?? '').trim();
}

function normalizeNumericField(value) {
  const normalized = normalizeTextField(value);
  if (!normalized) return null;

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
