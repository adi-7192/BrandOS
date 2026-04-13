export function normalizeFunnelStages(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => String(entry || '').trim()).filter(Boolean))];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        return normalizeFunnelStages(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  }

  return [];
}

export function formatFunnelStages(value, separator = ' · ') {
  return normalizeFunnelStages(value).join(separator);
}

export function normalizeAgeRanges(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => String(entry || '').trim()).filter(Boolean))];
  }

  return String(value || '')
    .split(/\s*·\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function formatAgeRanges(value, separator = ' · ') {
  return normalizeAgeRanges(value).join(separator);
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
