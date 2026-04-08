function stripMarkdownFence(raw) {
  const text = String(raw || '').trim();

  if (!text.startsWith('```')) {
    return text;
  }

  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export function parseStructuredJson(raw, { fallback, validate = () => true } = {}) {
  try {
    const parsed = JSON.parse(stripMarkdownFence(raw));

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !validate(parsed)) {
      return { data: fallback, usedFallback: true };
    }

    return { data: parsed, usedFallback: false };
  } catch {
    return { data: fallback, usedFallback: true };
  }
}
