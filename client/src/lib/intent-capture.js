export const SIGNUP_INTENT_QUESTIONS = [
  {
    questionKey: 'signup_trigger',
    label: 'What brought you to BrandOS today?',
    options: [
      'Struggling with brand consistency across AI tools',
      'Managing too many brands manually',
      'Evaluating tools for my team',
      "Exploring what's available",
      'Other',
    ],
  },
  {
    questionKey: 'current_method',
    label: 'How are you currently creating brand content?',
    options: [
      'ChatGPT or Claude directly',
      'Jasper or similar tool',
      'Manually without AI',
      'Mixed approach',
      'First time using AI for this',
    ],
  },
];

export const KIT_LIVE_INTENT_QUESTION = {
  questionKey: 'success_criteria',
  label: 'One quick thing — what would make BrandOS essential to your workflow?',
  options: [
    'Saving time on content production',
    'Consistent brand voice across the team',
    'Reducing back-and-forth with brand managers',
    'Replacing a more expensive tool',
    'Making AI output actually usable',
  ],
};

const OUTPUT_INTENT_QUESTIONS = [
  {
    threshold: 3,
    questionKey: 'output_comparison',
    label: 'How does BrandOS output compare to what you were producing before?',
    options: [
      'Significantly better',
      'Slightly better',
      'About the same',
      'Still needs too much editing',
      'Not what I expected',
    ],
  },
  {
    threshold: 5,
    questionKey: 'top_improvement',
    label: 'What would you improve first?',
    options: [
      'Brand voice accuracy',
      'The inbox integration',
      'How much editing the output needs',
      'Speed of generation',
      'Managing multiple brands',
    ],
  },
  {
    threshold: 8,
    questionKey: 'expansion_intent',
    label: 'Are you evaluating BrandOS for just yourself or your wider team?',
    options: [
      'Just myself',
      'My immediate team (2–5 people)',
      'Wider marketing department',
      'Enterprise-wide rollout consideration',
    ],
  },
];

const SIGNUP_INTENT_STORAGE_KEY = 'brandos.signup-intent';
const SIGNUP_INTENT_ARMED_KEY = 'brandos.signup-intent-armed';

export function getNextOutputIntentQuestion(intentState) {
  const answered = new Set(intentState?.answeredQuestionKeys || []);
  const dismissed = new Set(intentState?.dismissedQuestionKeys || []);
  const count = Number(intentState?.generationSessionCount || 0);

  if (count > 8) {
    return null;
  }

  const question = OUTPUT_INTENT_QUESTIONS.find((entry) => (
    count >= entry.threshold
    && !answered.has(entry.questionKey)
    && !dismissed.has(entry.questionKey)
  ));

  if (!question) {
    return null;
  }

  return {
    questionKey: question.questionKey,
    label: question.label,
    options: question.options,
  };
}

export function upsertPendingSignupIntent(currentEntries, { questionKey, answer }) {
  const next = (currentEntries || []).filter((entry) => entry.questionKey !== questionKey);
  next.push({
    moment: 'signup',
    questionKey,
    answer,
  });
  return next;
}

export function loadPendingSignupIntent() {
  try {
    return JSON.parse(sessionStorage.getItem(SIGNUP_INTENT_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function savePendingSignupIntent(entries) {
  sessionStorage.setItem(SIGNUP_INTENT_STORAGE_KEY, JSON.stringify(entries));
}

export function clearPendingSignupIntent() {
  sessionStorage.removeItem(SIGNUP_INTENT_STORAGE_KEY);
  sessionStorage.removeItem(SIGNUP_INTENT_ARMED_KEY);
}

export function armPendingSignupIntent() {
  sessionStorage.setItem(SIGNUP_INTENT_ARMED_KEY, '1');
}

export function hasArmedPendingSignupIntent() {
  return sessionStorage.getItem(SIGNUP_INTENT_ARMED_KEY) === '1';
}

export async function flushPendingSignupIntent(api) {
  if (!hasArmedPendingSignupIntent()) {
    return;
  }

  const pending = loadPendingSignupIntent();

  for (const entry of pending) {
    await api.post('/intent', {
      moment: entry.moment,
      question_key: entry.questionKey,
      answer: entry.answer,
    });
  }

  clearPendingSignupIntent();
}
