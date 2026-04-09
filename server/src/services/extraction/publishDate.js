const MONTH_LOOKUP = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export function normalizePublishDateValue(value, referenceDate = new Date()) {
  const input = String(value || '').trim();
  if (!input) {
    return '';
  }

  const normalizedInput = input.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1');

  const exactIsoMatch = normalizedInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (exactIsoMatch) {
    return buildIsoDate(
      Number(exactIsoMatch[1]),
      Number(exactIsoMatch[2]),
      Number(exactIsoMatch[3]),
    );
  }

  const slashMatch = normalizedInput.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = resolveOptionalYear(slashMatch[3], month, day, referenceDate);
    return buildIsoDate(year, month, day);
  }

  const monthFirstMatch = normalizedInput.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/);
  if (monthFirstMatch) {
    const month = MONTH_LOOKUP[monthFirstMatch[1].toLowerCase()];
    const day = Number(monthFirstMatch[2]);
    const year = resolveOptionalYear(monthFirstMatch[3], month, day, referenceDate);
    return buildIsoDate(year, month, day);
  }

  const dayFirstMatch = normalizedInput.match(/^(\d{1,2})\s+([A-Za-z]+)(?:,?\s+(\d{4}))?$/);
  if (dayFirstMatch) {
    const day = Number(dayFirstMatch[1]);
    const month = MONTH_LOOKUP[dayFirstMatch[2].toLowerCase()];
    const year = resolveOptionalYear(dayFirstMatch[3], month, day, referenceDate);
    return buildIsoDate(year, month, day);
  }

  return '';
}

function resolveOptionalYear(rawYear, month, day, referenceDate) {
  if (rawYear) {
    const parsed = Number(rawYear.length === 2 ? `20${rawYear}` : rawYear);
    return Number.isFinite(parsed) ? parsed : referenceDate.getUTCFullYear();
  }

  const referenceYear = referenceDate.getUTCFullYear();
  const currentYearIso = buildIsoDate(referenceYear, month, day);
  if (!currentYearIso) {
    return referenceYear;
  }

  const referenceIso = toUtcIsoDate(referenceDate);
  return currentYearIso < referenceIso ? referenceYear + 1 : referenceYear;
}

function buildIsoDate(year, month, day) {
  if (!year || !month || !day) {
    return '';
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return '';
  }

  return toUtcIsoDate(candidate);
}

function toUtcIsoDate(value) {
  return new Date(Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  )).toISOString().slice(0, 10);
}
