import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getNextOutputIntentQuestion,
  upsertPendingSignupIntent,
} from './intent-capture.js';

test('getNextOutputIntentQuestion returns the first eligible unanswered output prompt', () => {
  assert.equal(
    getNextOutputIntentQuestion({
      generationSessionCount: 2,
      answeredQuestionKeys: [],
      dismissedQuestionKeys: [],
    }),
    null
  );

  assert.deepEqual(
    getNextOutputIntentQuestion({
      generationSessionCount: 3,
      answeredQuestionKeys: [],
      dismissedQuestionKeys: [],
    }),
    {
      questionKey: 'output_comparison',
      label: 'How does BrandOS output compare to what you were producing before?',
      options: [
        'Significantly better',
        'Slightly better',
        'About the same',
        'Still needs too much editing',
        'Not what I expected',
      ],
    }
  );

  assert.deepEqual(
    getNextOutputIntentQuestion({
      generationSessionCount: 5,
      answeredQuestionKeys: ['output_comparison'],
      dismissedQuestionKeys: [],
    }),
    {
      questionKey: 'top_improvement',
      label: 'What would you improve first?',
      options: [
        'Brand voice accuracy',
        'The inbox integration',
        'How much editing the output needs',
        'Speed of generation',
        'Managing multiple brands',
      ],
    }
  );

  assert.equal(
    getNextOutputIntentQuestion({
      generationSessionCount: 9,
      answeredQuestionKeys: [],
      dismissedQuestionKeys: [],
    }),
    null
  );
});

test('upsertPendingSignupIntent replaces previous answers for the same signup question', () => {
  assert.deepEqual(
    upsertPendingSignupIntent([], {
      questionKey: 'signup_trigger',
      answer: 'Exploring what\'s available',
    }),
    [
      {
        moment: 'signup',
        questionKey: 'signup_trigger',
        answer: 'Exploring what\'s available',
      },
    ]
  );

  assert.deepEqual(
    upsertPendingSignupIntent(
      [
        {
          moment: 'signup',
          questionKey: 'signup_trigger',
          answer: 'Exploring what\'s available',
        },
      ],
      {
        questionKey: 'signup_trigger',
        answer: 'Evaluating tools for my team',
      }
    ),
    [
      {
        moment: 'signup',
        questionKey: 'signup_trigger',
        answer: 'Evaluating tools for my team',
      },
    ]
  );
});
