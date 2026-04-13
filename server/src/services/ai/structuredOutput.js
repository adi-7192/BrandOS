function extractJson(raw) {
  let text = String(raw || '').trim();

  // 1. Try to find a markdown block
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  } else {
    // 2. Try to find {} boundaries if there's preamble
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    } else {
      // 3. Try to find [] boundaries just in case
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        text = text.slice(firstBracket, lastBracket + 1);
      }
    }
  }

  return text.trim();
}

export function parseStructuredJson(raw, { fallback, validate = () => true } = {}) {
  try {
    const parsed = JSON.parse(extractJson(raw));

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !validate(parsed)) {
      return { data: fallback, usedFallback: true };
    }

    return { data: parsed, usedFallback: false };
  } catch {
    return { data: fallback, usedFallback: true };
  }
}
