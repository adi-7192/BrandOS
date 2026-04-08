import pool from '../db/pool.js';

const OUTPUT_PROMPTS = [
  { questionKey: 'output_comparison', threshold: 3 },
  { questionKey: 'top_improvement', threshold: 5 },
  { questionKey: 'expansion_intent', threshold: 8 },
];

function isMissingRelationError(err) {
  return err?.code === '42P01';
}

async function safeIntentQuery(query, fallbackRows = []) {
  try {
    return await pool.query(query.text, query.values);
  } catch (err) {
    if (isMissingRelationError(err)) {
      return { rows: fallbackRows };
    }
    throw err;
  }
}

export async function getIntentState(userId) {
  const [signals, dismissals, countResult] = await Promise.all([
    safeIntentQuery({
      text: 'SELECT moment, question_key FROM intent_signals WHERE user_id = $1',
      values: [userId],
    }),
    safeIntentQuery({
      text: 'SELECT moment, question_key FROM intent_prompt_dismissals WHERE user_id = $1',
      values: [userId],
    }),
    pool.query(
      `SELECT COUNT(d.id) AS draft_count
       FROM drafts d
       JOIN brands b ON b.id = d.brand_id
       JOIN workspaces w ON w.id = b.workspace_id
       WHERE w.user_id = $1`,
      [userId]
    ),
  ]);

  const answeredQuestionKeys = signals.rows.map((row) => row.question_key);
  const dismissedQuestionKeys = dismissals.rows.map((row) => row.question_key);
  const generationSessionCount = Number(countResult.rows[0]?.draft_count || 0);
  const nextOutputPromptKey = generationSessionCount > 8
    ? null
    : OUTPUT_PROMPTS.find((prompt) => (
        generationSessionCount >= prompt.threshold
        && !answeredQuestionKeys.includes(prompt.questionKey)
        && !dismissedQuestionKeys.includes(prompt.questionKey)
      ))?.questionKey || null;

  return {
    answeredQuestionKeys,
    dismissedQuestionKeys,
    generationSessionCount,
    nextOutputPromptKey,
  };
}

export async function recordIntentSignal({ userId, moment, questionKey, answer, contentPieceCount }) {
  try {
    await pool.query(
      `INSERT INTO intent_signals (user_id, moment, question_key, answer, content_piece_count)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, moment, question_key) DO UPDATE
         SET answer = EXCLUDED.answer,
             content_piece_count = EXCLUDED.content_piece_count,
             created_at = NOW()`,
      [userId, moment, questionKey, answer, contentPieceCount || null]
    );

    if (questionKey === 'expansion_intent' && answer === 'Enterprise-wide rollout consideration') {
      await pool.query(
        `INSERT INTO expansion_leads (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
    }
  } catch (err) {
    if (!isMissingRelationError(err)) {
      throw err;
    }
  }
}

export async function dismissIntentPrompt({ userId, moment, questionKey, contentPieceCount }) {
  try {
    await pool.query(
      `INSERT INTO intent_prompt_dismissals (user_id, moment, question_key, content_piece_count)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, moment, question_key) DO NOTHING`,
      [userId, moment, questionKey, contentPieceCount || null]
    );
  } catch (err) {
    if (!isMissingRelationError(err)) {
      throw err;
    }
  }
}
