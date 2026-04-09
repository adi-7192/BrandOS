import { callAI } from '../ai/client.js';
import { parseStructuredJson } from '../ai/structuredOutput.js';

export async function classifyInboundEmail({ subject, body, brandName = '' }) {
  const systemPrompt = `You are classifying a forwarded stakeholder email thread for a content marketing workspace.

Choose one classification:
- campaign
- brand_update
- mixed
- needs_routing

Return ONLY JSON:
{
  "classification": "campaign|brand_update|mixed|needs_routing",
  "summary": "one short sentence"
}`;

  const raw = await callAI(
    systemPrompt,
    `Brand context: ${brandName || 'Unknown brand'}\nSubject: ${subject || ''}\n\nEmail thread:\n${body || ''}`,
    300
  );

  const { data } = parseStructuredJson(raw, {
    fallback: {
      classification: brandName ? 'campaign' : 'needs_routing',
      summary: brandName
        ? 'I found campaign details that should be reviewed in the inbox.'
        : 'I could not confidently match this thread to a brand yet.',
    },
    validate: (value) => value && typeof value.classification === 'string',
  });

  return {
    classification: ['campaign', 'brand_update', 'mixed', 'needs_routing'].includes(data.classification)
      ? data.classification
      : (brandName ? 'campaign' : 'needs_routing'),
    summary: data.summary || '',
  };
}
