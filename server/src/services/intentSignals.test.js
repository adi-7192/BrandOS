import test from 'node:test';
import assert from 'node:assert/strict';

import pool from '../db/pool.js';
import {
  dismissIntentPrompt,
  getIntentState,
  recordIntentSignal,
} from './intentSignals.js';

function missingRelationError(tableName) {
  const err = new Error(`relation "${tableName}" does not exist`);
  err.code = '42P01';
  return err;
}

test('getIntentState returns default values when intent tables are missing', async () => {
  const originalQuery = pool.query;

  pool.query = async (sql) => {
    const text = String(sql);

    if (text.includes('FROM intent_signals')) {
      throw missingRelationError('intent_signals');
    }

    if (text.includes('FROM intent_prompt_dismissals')) {
      throw missingRelationError('intent_prompt_dismissals');
    }

    if (text.includes('COUNT(d.id) AS draft_count')) {
      return { rows: [{ draft_count: '0' }] };
    }

    throw new Error(`Unexpected query: ${text}`);
  };

  try {
    const state = await getIntentState('user-1');

    assert.deepEqual(state, {
      answeredQuestionKeys: [],
      dismissedQuestionKeys: [],
      generationSessionCount: 0,
      nextOutputPromptKey: null,
    });
  } finally {
    pool.query = originalQuery;
  }
});

test('recordIntentSignal ignores missing intent tables', async () => {
  const originalQuery = pool.query;

  pool.query = async () => {
    throw missingRelationError('intent_signals');
  };

  try {
    await assert.doesNotReject(() => recordIntentSignal({
      userId: 'user-1',
      moment: 'signup',
      questionKey: 'expansion_intent',
      answer: 'Testing',
      contentPieceCount: 1,
    }));
  } finally {
    pool.query = originalQuery;
  }
});

test('dismissIntentPrompt ignores missing intent tables', async () => {
  const originalQuery = pool.query;

  pool.query = async () => {
    throw missingRelationError('intent_prompt_dismissals');
  };

  try {
    await assert.doesNotReject(() => dismissIntentPrompt({
      userId: 'user-1',
      moment: 'output',
      questionKey: 'top_improvement',
      contentPieceCount: 3,
    }));
  } finally {
    pool.query = originalQuery;
  }
});
