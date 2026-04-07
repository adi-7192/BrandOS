import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PROVIDER = process.env.AI_PROVIDER || 'anthropic';

const MODELS = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
};

export const MODEL = MODELS[PROVIDER] || MODELS.anthropic;

let anthropicClient, openaiClient, geminiClient;

if (PROVIDER === 'anthropic') {
  anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} else if (PROVIDER === 'openai') {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (PROVIDER === 'gemini') {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Unified AI call across providers.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} maxTokens
 * @returns {Promise<string>}
 */
export async function callAI(systemPrompt, userMessage, maxTokens = 1000) {
  if (PROVIDER === 'anthropic') {
    const msg = await anthropicClient.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    return msg.content[0].text.trim();
  }

  if (PROVIDER === 'openai') {
    const resp = await openaiClient.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return resp.choices[0].message.content.trim();
  }

  if (PROVIDER === 'gemini') {
    const model = geminiClient.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text().trim();
  }

  throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}. Valid values: anthropic | openai | gemini`);
}

export default anthropicClient;
