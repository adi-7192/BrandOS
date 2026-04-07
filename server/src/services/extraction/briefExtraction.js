import anthropic, { MODEL } from '../ai/client.js';

const FIELD_WEIGHTS = {
  key_message: 0.25,
  campaign_type: 0.20,
  audience: 0.20,
  tone_shift: 0.15,
  content_goal: 0.15,
  cta_intent: 0.05,
};

/**
 * Extract campaign brief fields from a Gmail message.
 * Returns extracted fields with confidence scores and matched/unmatched arrays.
 * Confidence is stored in DB only — never exposed to the UI.
 */
export async function extractBriefFromEmail({ subject, body, threadMessages = [], brandName }) {
  const context = [
    body,
    ...threadMessages.slice(0, 3).map(m => m.body),
  ].filter(Boolean).join('\n\n---\n\n');

  const systemPrompt = `You are extracting campaign brief fields from a business email for the brand: ${brandName}.

For each field, extract:
1. The value (string or null if absent)
2. A confidence score 0–1
3. The exact source quote from the email (required — if no quote, cap confidence at 0.6)

Fields to extract:
- key_message: The core message this campaign needs to communicate
- campaign_type: Type of campaign (product launch, brand awareness, seasonal, thought leadership, PR, community)
- audience: Who this content is targeting
- tone_shift: Any tone direction (urgent, celebratory, intimate, authoritative, playful, or null for baseline)
- content_goal: What this content should achieve (lead generation, brand visibility, thought leadership, PR)
- cta_intent: What action the content should drive (or null)

Return ONLY a JSON object:
{
  "key_message": { "value": "...", "confidence": 0.9, "sourceQuote": "..." },
  "campaign_type": { "value": "...", "confidence": 0.8, "sourceQuote": "..." },
  "audience": { "value": "...", "confidence": 0.7, "sourceQuote": "..." },
  "tone_shift": { "value": "...", "confidence": 0.6, "sourceQuote": "..." },
  "content_goal": { "value": "...", "confidence": 0.5, "sourceQuote": "..." },
  "cta_intent": { "value": "...", "confidence": 0.4, "sourceQuote": "..." }
}`;

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Subject: ${subject}\n\n${context}` }],
  });

  let extracted;
  try {
    extracted = JSON.parse(msg.content[0].text.trim());
  } catch {
    extracted = {};
  }

  // Enforce: no source quote → cap at 0.6
  for (const field of Object.keys(extracted)) {
    if (!extracted[field].sourceQuote) {
      extracted[field].confidence = Math.min(extracted[field].confidence || 0, 0.6);
    }
  }

  // Weighted score
  const overallScore = Object.entries(FIELD_WEIGHTS).reduce((sum, [field, weight]) => {
    const conf = extracted[field]?.confidence || 0;
    return sum + conf * weight;
  }, 0);

  // Matched vs unmatched (for UI chips)
  const matchedFields = Object.entries(extracted)
    .filter(([, v]) => v.value && v.confidence >= 0.4)
    .map(([k]) => k);
  const unmatchedFields = Object.keys(FIELD_WEIGHTS).filter(f => !matchedFields.includes(f));

  // Flatten for storage
  const flatExtracted = {};
  for (const [field, data] of Object.entries(extracted)) {
    flatExtracted[field] = data.value;
    flatExtracted[`${field}_confidence`] = data.confidence;
    flatExtracted[`${field}_source`] = data.sourceQuote;
  }

  return {
    extractedFields: flatExtracted,
    matchedFields,
    unmatchedFields,
    overallScore: Math.round(overallScore * 1000) / 1000,
    excerpt: body?.slice(0, 200),
  };
}
