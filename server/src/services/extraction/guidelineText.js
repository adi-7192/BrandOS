import mammoth from 'mammoth';

export function normalizeGuidelineText(raw) {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function buildGuidelineExcerpt(text, maxChars = 1200) {
  const normalized = normalizeGuidelineText(text);
  return normalized.slice(0, maxChars);
}

async function defaultExtractDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function defaultExtractPdf(buffer) {
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = pdfParseModule.default || pdfParseModule;
  const result = await pdfParse(buffer);
  return result.text;
}

export async function extractGuidelineText({
  buffer,
  filename,
  mimetype,
  dependencies = {},
}) {
  const extractDocx = dependencies.extractDocx || defaultExtractDocx;
  const extractPdf = dependencies.extractPdf || defaultExtractPdf;
  const lowerName = String(filename || '').toLowerCase();

  let rawText = '';

  if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
    rawText = await extractPdf(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || lowerName.endsWith('.docx')
  ) {
    rawText = await extractDocx(buffer);
  } else {
    throw new Error('Unsupported guideline file type. Please upload a PDF or DOCX.');
  }

  const text = normalizeGuidelineText(rawText);
  return {
    text,
    excerpt: buildGuidelineExcerpt(text),
  };
}
