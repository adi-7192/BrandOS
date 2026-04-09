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

export function resolveProofStyle({ proofStyle, proofStyleOther }) {
  const selected = String(proofStyle || '').trim();
  if (selected === 'Other') {
    return String(proofStyleOther || '').trim();
  }

  return selected;
}
