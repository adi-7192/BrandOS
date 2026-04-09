const MAX_EMAIL_CONTEXT_LENGTH = 12000;

export function normalizeInboundEmailContent({ text = '', html = '' }) {
  const preferred = String(text || '').trim() || stripHtmlToText(html);

  if (!preferred) {
    return '';
  }

  return preferred.length > MAX_EMAIL_CONTEXT_LENGTH
    ? `${preferred.slice(0, MAX_EMAIL_CONTEXT_LENGTH)}...`
    : preferred;
}

function stripHtmlToText(html = '') {
  const source = String(html || '');
  if (!source.trim()) return '';

  return source
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
