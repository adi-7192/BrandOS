export const OUTPUT_FEEDBACK_CHIPS = [
  'Too long',
  'Too generic',
  'Needs stronger hook',
  'More on-brand',
  'Add CTA',
  'More concise',
  'More premium',
];

export const SELECTION_REWRITE_CHIPS = [
  'Shorter',
  'Clearer',
  'More punchy',
  'More polished',
];

export function buildGlobalFeedbackInstruction({ reaction, chips = [], note = '' }) {
  const normalizedNote = String(note || '').trim();
  const normalizedChips = (chips || []).filter(Boolean);
  const parts = [];

  if (reaction === 'needs_changes') {
    parts.push('The draft needs improvement.');
  } else if (reaction === 'works') {
    parts.push('Keep what is working, but refine the requested details.');
  }

  if (normalizedChips.length) {
    parts.push(`Feedback to address: ${normalizedChips.join(', ')}.`);
  }

  if (normalizedNote) {
    parts.push(`Additional guidance: ${normalizedNote}`);
  }

  return parts.join(' ').trim();
}

export function canApplyGlobalFeedback({ chips = [], note = '', reaction, loading = false }) {
  if (loading) return false;
  return Boolean(
    reaction === 'needs_changes'
    || (chips || []).length > 0
    || String(note || '').trim()
  );
}

export function buildSelectionRewriteInstruction({ chips = [], note = '' }) {
  const normalizedNote = String(note || '').trim();
  const normalizedChips = (chips || []).filter(Boolean);
  const parts = [];

  if (normalizedChips.length) {
    parts.push(`Rewrite goals: ${normalizedChips.join(', ')}.`);
  }

  if (normalizedNote) {
    parts.push(`Specific instruction: ${normalizedNote}`);
  }

  return parts.join(' ').trim();
}

export function getSelectionState(text, start, end) {
  const safeText = String(text || '');
  const safeStart = Math.max(0, Number(start || 0));
  const safeEnd = Math.max(safeStart, Number(end || 0));
  const selectedText = safeText.slice(safeStart, safeEnd);

  return {
    start: safeStart,
    end: safeEnd,
    text: selectedText,
    hasSelection: safeEnd > safeStart && selectedText.trim().length > 0,
  };
}

export function replaceSelection(text, selection, replacement) {
  const safeText = String(text || '');
  const nextSelection = selection || { start: 0, end: 0 };

  return `${safeText.slice(0, nextSelection.start)}${replacement}${safeText.slice(nextSelection.end)}`;
}
