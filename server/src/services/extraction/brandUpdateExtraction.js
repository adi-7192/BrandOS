import { callAI } from '../ai/client.js';
import { parseStructuredJson } from '../ai/structuredOutput.js';

const FIELDS = [
  'voiceAdjectives',
  'vocabulary',
  'restrictedWords',
  'audienceType',
  'toneShift',
  'proofStyle',
  'channelRulesLinkedin',
  'channelRulesBlog',
];

export async function extractBrandUpdateProposal({ brandName, body, currentKit = {} }) {
  const systemPrompt = `You extract possible brand memory changes from stakeholder email threads.

Only include fields when the thread clearly suggests a lasting brand-level change.
Do NOT include one-off campaign instructions.

Return ONLY JSON:
{
  "summary": "short sentence",
  "fields": {
    "voiceAdjectives": { "suggested": ["..."], "reason": "...", "sourceQuote": "..." },
    "vocabulary": { "suggested": ["..."], "reason": "...", "sourceQuote": "..." },
    "restrictedWords": { "suggested": ["..."], "reason": "...", "sourceQuote": "..." },
    "audienceType": { "suggested": "...", "reason": "...", "sourceQuote": "..." },
    "toneShift": { "suggested": "...", "reason": "...", "sourceQuote": "..." },
    "proofStyle": { "suggested": "...", "reason": "...", "sourceQuote": "..." },
    "channelRulesLinkedin": { "suggested": "...", "reason": "...", "sourceQuote": "..." },
    "channelRulesBlog": { "suggested": "...", "reason": "...", "sourceQuote": "..." }
  }
}`;

  const raw = await callAI(
    systemPrompt,
    `Brand: ${brandName}\nCurrent kit:\n${JSON.stringify(currentKit, null, 2)}\n\nThread:\n${body || ''}`,
    700
  );

  const { data } = parseStructuredJson(raw, {
    fallback: { summary: '', fields: {} },
    validate: (value) => value && typeof value === 'object' && !Array.isArray(value),
  });

  const fields = {};
  for (const key of FIELDS) {
    const proposal = data.fields?.[key];
    if (!proposal || proposal.suggested === undefined || proposal.suggested === null || proposal.suggested === '') {
      continue;
    }
    fields[key] = {
      current: currentKit[key] ?? (Array.isArray(proposal.suggested) ? [] : ''),
      suggested: proposal.suggested,
      reason: proposal.reason || '',
      sourceQuote: proposal.sourceQuote || '',
    };
  }

  return {
    summary: data.summary || '',
    fields,
  };
}
