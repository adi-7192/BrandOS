function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function matchBrandFromEmail({ brands = [], subject = '', text = '', from = '' }) {
  const haystack = normalizeText(`${subject}\n${text}\n${from}`);
  if (!haystack) return null;

  let bestMatch = null;

  for (const brand of brands) {
    const brandName = normalizeText(brand.name);
    if (!brandName) continue;

    const exact = haystack.includes(brandName);
    const compact = brandName.replace(/\s+/g, '');
    const compactMatch = compact.length >= 4 && haystack.replace(/\s+/g, '').includes(compact);
    if (!exact && !compactMatch) continue;

    const score = exact ? brandName.length + 10 : brandName.length;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { brand, score };
    }
  }

  return bestMatch?.brand || null;
}
