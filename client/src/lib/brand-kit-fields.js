export const FUNNEL_STAGE_OPTIONS = [
  'Top of funnel — awareness (reaching new audiences)',
  'Mid funnel — consideration (nurturing interest)',
  'Bottom of funnel — decision (driving a specific action)',
];

export const PROOF_STYLE_OPTIONS = [
  'Data-led — statistics and research',
  'Case study-led — client stories and results',
  'Opinion-led — strong point of view',
  'Other',
];

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

export function resolveProofStyle({ proofStyle, proofStyleOther }) {
  const selected = String(proofStyle || '').trim();
  if (selected === 'Other') {
    return String(proofStyleOther || '').trim();
  }

  return selected;
}
