export const FUNNEL_STAGE_OPTIONS = [
  'Top of funnel — awareness (reaching new audiences)',
  'Mid funnel — consideration (nurturing interest)',
  'Bottom of funnel — decision (driving a specific action)',
];

export const PROOF_STYLE_OPTIONS = [
  'Data-led — statistics and research',
  'Case study-led — client stories and results',
  'Opinion-led — strong point of view',
  'Quote-led — testimonials and endorsements',
  'Comparison-led — before/after or versus competitor',
  'Other',
];

export const AUDIENCE_TYPE_OPTIONS = [
  'B2B decision makers',
  'Young professionals',
  'General consumers',
  'Parents and families',
  "Custom — I'll describe my audience",
];

export const BUYER_SENIORITY_OPTIONS = [
  'C-suite (CEO, CFO, CMO)',
  'Director',
  'VP',
  'Manager',
  'Practitioner',
  'Individual contributor',
  'Mixed — multiple levels',
  'Not applicable',
  'Other',
];

export const AGE_RANGE_OPTIONS = [
  '18–24',
  '25–34',
  '35–44',
  '45–54',
  '55+',
  'All ages',
];

export const INDUSTRY_TARGET_OPTIONS = [
  'Retail and e-commerce',
  'Financial services',
  'Technology and SaaS',
  'Healthcare and pharma',
  'Manufacturing and logistics',
  'Media and entertainment',
  'Professional services',
  'Education',
  'Public sector',
  'NGO',
  'Hospitality and travel',
  'Agriculture',
  'Energy and utilities',
  'Legal',
  'Real estate',
  "Other — I'll describe it",
];

export const CAMPAIGN_TYPE_OPTIONS = [
  'Product launch',
  'Brand awareness',
  'Seasonal',
  'Thought leadership',
  'PR and press',
  'Community',
  'Event promotion',
  'Partnership or co-brand announcement',
  'CSR / ESG',
  'Recruitment / employer brand',
  'Product update or feature release',
  'Other',
];

export const CONTENT_GOAL_OPTIONS = [
  'Lead generation',
  'Brand visibility',
  'Customer education',
  'Community growth',
  'Customer retention',
  'Drive direct action (booking, demo, download)',
  'Other',
];

export const TONE_SHIFT_OPTIONS = [
  'More urgent',
  'More celebratory',
  'More intimate',
  'More authoritative',
  'More playful',
  'More empathetic',
  'More educational',
  'Keep baseline — no shift',
  'Other',
];

export const CTA_STYLE_OPTIONS = [
  'Book a demo or schedule a call',
  'Visit our website or read more',
  'Download a resource',
  'Comment or share your thoughts',
  'Follow for more',
  'Contact us',
  'No explicit CTA',
  'Other',
];

export const EMOJI_USAGE_OPTIONS = [
  'Never — keep content emoji-free',
  'Sparingly — 1–2 per post maximum',
  'Freely — wherever they add energy',
];

export const PUBLISHING_FREQUENCY_OPTIONS = [
  'Daily',
  '2–3 times per week',
  'Weekly',
  'Bi-weekly',
  'Monthly or less',
  'Ad hoc / campaign-based',
];

// B2C audience types: buyer seniority is not applicable for these
export const B2C_AUDIENCE_TYPES = new Set(['General consumers', 'Parents and families']);

// Young audience types: age ranges above 34 are logically inconsistent
export const YOUNG_AUDIENCE_TYPES = new Set(['Young professionals']);
export const OLDER_AGE_RANGES = new Set(['35–44', '45–54', '55+']);

export function normalizeFunnelStages(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => String(entry || '').trim()).filter(Boolean))];
  }
  const singleValue = String(value || '').trim();
  return singleValue ? [singleValue] : [];
}

export function formatFunnelStages(value, separator = ' · ') {
  return normalizeFunnelStages(value).join(separator);
}

function resolveOtherField(selected, customTriggers, other) {
  const s = String(selected || '').trim();
  const o = String(other || '').trim();
  return customTriggers.includes(s) && o ? o : s;
}

export function resolveProofStyle({ proofStyle, proofStyleOther }) {
  return resolveOtherField(proofStyle, ['Other'], proofStyleOther);
}

export function resolveAudienceType({ audienceType, audienceTypeOther }) {
  return resolveOtherField(audienceType, ["Custom — I'll describe my audience"], audienceTypeOther);
}

export function resolveIndustryTarget({ industryTarget, industryTargetOther }) {
  return resolveOtherField(industryTarget, ["Other — I'll describe it"], industryTargetOther);
}

export function resolveCampaignType({ campaignType, campaignTypeOther }) {
  return resolveOtherField(campaignType, ['Other'], campaignTypeOther);
}

export function resolveToneShift({ toneShift, toneShiftOther }) {
  return resolveOtherField(toneShift, ['Other'], toneShiftOther);
}

export function resolveContentGoal({ contentGoal, contentGoalOther }) {
  return resolveOtherField(contentGoal, ['Other'], contentGoalOther);
}

export function resolveCtaStyle({ ctaStyle, ctaStyleOther }) {
  return resolveOtherField(ctaStyle, ['Other'], ctaStyleOther);
}
