export function buildConfirmedBrief(brief, overrides) {
  return {
    ...brief,
    audienceType: overrides.audienceType || brief.audienceType || '',
    contentGoal: overrides.contentGoal || brief.contentGoal || '',
  };
}

export function buildGeneratingContext(brief) {
  return {
    voice: brief.kit?.voiceAdjectives?.join(', ') || 'Professional, clear, engaging',
    language: brief.language || 'English',
    toneShift: brief.toneShift || 'Baseline',
    audience: brief.audienceType || brief.audience || '—',
    guardrailCount: brief.kit?.restrictedWords?.length || 0,
    goal: brief.contentGoal || '—',
    keyMessage: brief.keyMessage || '—',
  };
}
