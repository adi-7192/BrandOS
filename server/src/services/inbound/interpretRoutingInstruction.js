import { callAI } from '../ai/client.js';
import { parseStructuredJson } from '../ai/structuredOutput.js';

export async function interpretRoutingInstruction({ instruction, brands = [], subject = '', body = '' }) {
  const systemPrompt = `You interpret a user's routing instruction for a forwarded stakeholder email.

Return ONLY JSON:
{
  "brandName": "best matching brand name",
  "createCampaign": true,
  "reviewBrandUpdates": false,
  "summary": "I understood this as: update Brand X + create campaign Y"
}`;

  const raw = await callAI(
    systemPrompt,
    `Available brands: ${brands.map((brand) => brand.name).join(', ')}\nInstruction: ${instruction}\nSubject: ${subject}\n\nThread:\n${body}`,
    400
  );

  const { data } = parseStructuredJson(raw, {
    fallback: {
      brandName: '',
      createCampaign: true,
      reviewBrandUpdates: false,
      summary: 'I could not confidently interpret that yet.',
    },
    validate: (value) => value && typeof value === 'object' && !Array.isArray(value),
  });

  return {
    brandName: data.brandName || '',
    createCampaign: data.createCampaign !== false,
    reviewBrandUpdates: Boolean(data.reviewBrandUpdates),
    summary: data.summary || 'I could not confidently interpret that yet.',
  };
}
