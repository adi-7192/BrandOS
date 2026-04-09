import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getNextOutputIntentQuestion } from '../../lib/intent-capture';
import { buildGenerationSessionPayload } from '../../lib/generation-session';
import {
  OUTPUT_FEEDBACK_CHIPS,
  SELECTION_REWRITE_CHIPS,
  buildGlobalFeedbackInstruction,
  buildSelectionRewriteInstruction,
  canApplyGlobalFeedback,
  getSelectionState,
  replaceSelection,
} from '../../lib/output-feedback';

function ComplianceItem({ label, value, pass }) {
  return (
    <span className={`text-xs flex items-center gap-1 ${pass ? 'text-green-700' : 'text-amber-600'}`}>
      {pass ? '✓' : '⚠'} {label}{value !== undefined ? `: ${value}` : ''}
    </span>
  );
}

export default function Output() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const { user, refreshUser } = useAuth();
  const editorRef = useRef(null);
  const sessionIdParam = new URLSearchParams(search).get('sessionId');
  const [sessionId, setSessionId] = useState(sessionIdParam || state?.sessionId || '');
  const [brief, setBrief] = useState(state?.brief || {});
  const [activeTab, setActiveTab] = useState(state?.activeTab || 'linkedin');
  const [content, setContent] = useState({
    linkedin: state?.output?.linkedin || '',
    blog: state?.output?.blog || '',
  });
  const [draftReaction, setDraftReaction] = useState('');
  const [feedbackChips, setFeedbackChips] = useState([]);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [iterating, setIterating] = useState(false);
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [selectionFeedbackChips, setSelectionFeedbackChips] = useState([]);
  const [selectionFeedbackNote, setSelectionFeedbackNote] = useState('');
  const [selectionRewriteState, setSelectionRewriteState] = useState({ loading: false, message: '' });
  const [lastAiChange, setLastAiChange] = useState({ linkedin: '', blog: '' });
  const [saveState, setSaveState] = useState({ saving: false, message: '' });
  const [autosaveState, setAutosaveState] = useState('idle');
  const [loading, setLoading] = useState(Boolean(sessionIdParam));
  const [intentHidden, setIntentHidden] = useState(false);
  const outputIntentQuestion = useMemo(
    () => getNextOutputIntentQuestion(user?.intentState),
    [user?.intentState]
  );
  const activeDraft = content[activeTab] || '';
  const selection = useMemo(
    () => getSelectionState(activeDraft, selectionRange.start, selectionRange.end),
    [activeDraft, selectionRange.end, selectionRange.start]
  );
  const canApplyFeedback = canApplyGlobalFeedback({
    chips: feedbackChips,
    note: feedbackNote,
    reaction: draftReaction,
    loading: iterating,
  });

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionIdParam) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/generate/sessions/${sessionIdParam}`);
        const session = res.data.session;
        setSessionId(session.id);
        setBrief(session.briefPayload || {});
        setContent({
          linkedin: session.outputPayload?.linkedin || '',
          blog: session.outputPayload?.blog || '',
        });
        setActiveTab(session.activeTab || 'linkedin');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionIdParam]);

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const hashtagCount = (text) => (text.match(/#\w+/g) || []).length;
  const hasHook = (text) => text.trim().split('\n')[0].length > 10;
  const hasCTA = (text) => /\b(contact|reach out|learn more|click|sign up|book|download|try|get started)\b/i.test(text);

  const linkedinCompliance = {
    wordCount: wordCount(content.linkedin),
    withinLimit: wordCount(content.linkedin) <= 220,
    hashtags: hashtagCount(content.linkedin),
    hookOk: hasHook(content.linkedin),
    ctaOk: hasCTA(content.linkedin),
  };
  const blogCompliance = {
    wordCount: wordCount(content.blog),
    inRange: wordCount(content.blog) >= 400 && wordCount(content.blog) <= 1000,
    closingOk: content.blog.trim().endsWith('?') || content.blog.trim().length > 0,
  };

  const toggleChip = (value, setter) => {
    setter((current) => (
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    ));
  };

  const updateSelectionFromEditor = () => {
    if (!editorRef.current) return;
    setSelectionRange({
      start: editorRef.current.selectionStart || 0,
      end: editorRef.current.selectionEnd || 0,
    });
  };

  const resetSelectionFeedback = () => {
    setSelectionFeedbackChips([]);
    setSelectionFeedbackNote('');
    setSelectionRewriteState({ loading: false, message: '' });
  };

  const handleIterate = async () => {
    const instruction = buildGlobalFeedbackInstruction({
      reaction: draftReaction,
      chips: feedbackChips,
      note: feedbackNote,
    });

    if (!instruction.trim()) return;
    setIterating(true);
    try {
      setLastAiChange((current) => ({ ...current, [activeTab]: activeDraft }));
      const res = await api.post('/generate/iterate', {
        brief,
        instruction,
        currentContent: content,
        format: activeTab,
      });
      setContent(res.data.output);
      if (sessionId) {
        await api.patch(`/generate/sessions/${sessionId}`, buildGenerationSessionPayload({
          brief,
          sections: {},
          output: res.data.output,
          currentStep: 'output',
          activeTab,
          lastInstruction: instruction,
        }));
      }
    } catch {
      // silent
    } finally {
      setIterating(false);
      setDraftReaction('');
      setFeedbackChips([]);
      setFeedbackNote('');
    }
  };

  const handleRewriteSelection = async () => {
    const instruction = buildSelectionRewriteInstruction({
      chips: selectionFeedbackChips,
      note: selectionFeedbackNote,
    });

    if (!selection.hasSelection || !instruction.trim()) return;

    setSelectionRewriteState({ loading: true, message: '' });
    try {
      const res = await api.post('/generate/rewrite-selection', {
        brief,
        format: activeTab,
        currentText: activeDraft,
        selectedText: selection.text,
        instruction,
      });

      setLastAiChange((current) => ({ ...current, [activeTab]: activeDraft }));
      setContent((current) => ({
        ...current,
        [activeTab]: replaceSelection(current[activeTab], selection, res.data.selection),
      }));
      setSelectionRange({ start: 0, end: 0 });
      resetSelectionFeedback();
    } catch {
      setSelectionRewriteState({ loading: false, message: 'We could not rewrite that selection right now.' });
    }
  };

  const handleUndoAiChange = () => {
    const previous = lastAiChange[activeTab];
    if (!previous) return;

    setContent((current) => ({ ...current, [activeTab]: previous }));
    setLastAiChange((current) => ({ ...current, [activeTab]: '' }));
  };

  const handleSaveDraft = async () => {
    if (!brief.brandId) {
      setSaveState({ saving: false, message: 'This draft cannot be saved because the brand context is missing.' });
      return;
    }

    setSaveState({ saving: true, message: '' });
    try {
      const res = await api.post('/generate/save-draft', {
        brandId: brief.brandId,
        inboxCardId: brief.sourceCardIds?.length === 1 ? brief.sourceCardIds[0] : null,
        format: activeTab,
        content: content[activeTab],
        instruction: buildGlobalFeedbackInstruction({
          reaction: draftReaction,
          chips: feedbackChips,
          note: feedbackNote,
        }) || null,
      });
      setSaveState({ saving: false, message: `Saved version ${res.data.version}.` });
    } catch {
      setSaveState({ saving: false, message: 'Failed to save draft. Please try again.' });
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const handleIntentAnswer = async (answer) => {
    if (!outputIntentQuestion) return;

    await api.post('/intent', {
      moment: 'post_generation',
      question_key: outputIntentQuestion.questionKey,
      answer,
      content_piece_count: user?.intentState?.generationSessionCount || 0,
    });
    setIntentHidden(true);
    await refreshUser();
  };

  const handleIntentDismiss = async () => {
    if (!outputIntentQuestion) return;

    await api.post('/intent/dismiss', {
      moment: 'post_generation',
      question_key: outputIntentQuestion.questionKey,
      content_piece_count: user?.intentState?.generationSessionCount || 0,
    });
    setIntentHidden(true);
    await refreshUser();
  };

  useEffect(() => {
    if (loading || !sessionId || !brief?.brandId) return undefined;

    const timer = setTimeout(async () => {
      try {
        setAutosaveState('saving');
        await api.patch(`/generate/sessions/${sessionId}`, buildGenerationSessionPayload({
          brief,
          sections: {},
          output: content,
          currentStep: 'output',
          activeTab,
          lastInstruction: buildGlobalFeedbackInstruction({
            reaction: draftReaction,
            chips: feedbackChips,
            note: feedbackNote,
          }),
        }));
        setAutosaveState('saved');
      } catch {
        setAutosaveState('error');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [activeTab, brief, content, draftReaction, feedbackChips, feedbackNote, loading, sessionId]);

  useEffect(() => {
    setSelectionRange({ start: 0, end: 0 });
    resetSelectionFeedback();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <TopNav eyebrow="Campaign flow" meta="Generated content ready to review" />
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['linkedin', 'blog'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {tab === 'linkedin' ? 'LinkedIn post' : 'Blog post'}
            </button>
          ))}
        </div>

        {/* Output badge row */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <span className="chip chip-purple">{brief.brandName}</span>
          <span className="chip chip-grey">{activeTab === 'linkedin' ? 'LinkedIn' : 'Blog'}</span>
          {brief.contentGoal && <span className="chip chip-grey">{brief.contentGoal}</span>}
          {brief.toneShift && <span className="chip chip-grey">{brief.toneShift}</span>}
          {brief.language && <span className="chip chip-grey">{brief.language}</span>}
          <span className="chip chip-green">✓ {brief.kit?.restrictedWords?.length || 0} restricted words</span>
        </div>

        {/* Output body */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Editable draft</p>
              <p className="text-xs text-gray-400">Edit directly, then ask AI to improve the whole draft or only a selected passage.</p>
            </div>
            {lastAiChange[activeTab] && (
              <button
                type="button"
                onClick={handleUndoAiChange}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                Undo AI change
              </button>
            )}
          </div>
          <textarea
            ref={editorRef}
            value={activeDraft}
            onChange={(e) => setContent((current) => ({ ...current, [activeTab]: e.target.value }))}
            onMouseUp={updateSelectionFromEditor}
            onKeyUp={updateSelectionFromEditor}
            className="min-h-[220px] w-full resize-y rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* Compliance row */}
        <div className="flex flex-wrap gap-3 mt-2 mb-4">
          {activeTab === 'linkedin' ? (
            <>
              <ComplianceItem label="Words" value={`${linkedinCompliance.wordCount}/220`} pass={linkedinCompliance.withinLimit} />
              <ComplianceItem label="Hashtags" value={linkedinCompliance.hashtags} pass={linkedinCompliance.hashtags <= 3} />
              <ComplianceItem label="Hook in line 1" pass={linkedinCompliance.hookOk} />
              <ComplianceItem label="CTA detected" pass={linkedinCompliance.ctaOk} />
            </>
          ) : (
            <>
              <ComplianceItem label="Words" value={`${blogCompliance.wordCount}`} pass={blogCompliance.inRange} />
              <ComplianceItem label="Closing structure" pass={blogCompliance.closingOk} />
            </>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Improve this draft</p>
              <p className="text-xs text-gray-400">Tell BrandOS what feels off, then regenerate from your latest edits.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraftReaction('works')}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  draftReaction === 'works'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Like this draft
              </button>
              <button
                type="button"
                onClick={() => setDraftReaction('needs_changes')}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  draftReaction === 'needs_changes'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                Needs changes
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {OUTPUT_FEEDBACK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => toggleChip(chip, setFeedbackChips)}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  feedbackChips.includes(chip)
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Tell AI what to improve, for example: keep the proof points but make the opening more premium."
            className="mt-4 min-h-[92px] w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-gray-900 focus:outline-none"
          />

          <div className="mt-4 flex items-center gap-3">
            <Button variant="primary" disabled={!canApplyFeedback} onClick={handleIterate}>
              {iterating ? 'Regenerating…' : 'Regenerate with feedback'}
            </Button>
            {draftReaction === 'works' && (
              <p className="text-xs text-emerald-700">Great. You can still save, copy, or make a more specific change below.</p>
            )}
          </div>
        </div>

        {selection.hasSelection && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand">Rewrite selected text</p>
                <p className="mt-1 text-xs text-brand-muted">Only the highlighted passage will change. The rest of the draft stays untouched.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectionRange({ start: 0, end: 0 });
                  resetSelectionFeedback();
                }}
                className="text-xs font-medium text-brand-muted hover:text-brand"
              >
                Clear selection
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-blue-100 bg-white/80 px-3 py-3 text-sm text-gray-700">
              {selection.text}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SELECTION_REWRITE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(chip, setSelectionFeedbackChips)}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                    selectionFeedbackChips.includes(chip)
                      ? 'bg-brand text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea
              value={selectionFeedbackNote}
              onChange={(e) => setSelectionFeedbackNote(e.target.value)}
              placeholder="Optional: tell AI exactly how to improve the selected passage."
              className="mt-4 min-h-[80px] w-full rounded-xl border border-blue-100 px-4 py-3 text-sm text-gray-800 focus:border-brand focus:outline-none"
            />

            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="primary"
                disabled={selectionRewriteState.loading || !buildSelectionRewriteInstruction({ chips: selectionFeedbackChips, note: selectionFeedbackNote })}
                onClick={handleRewriteSelection}
              >
                {selectionRewriteState.loading ? 'Rewriting…' : 'Rewrite selection'}
              </Button>
              {selectionRewriteState.message && (
                <p className="text-xs text-amber-700">{selectionRewriteState.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Export row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="secondary" className="text-sm" onClick={handleSaveDraft} disabled={saveState.saving}>
            {saveState.saving ? 'Saving…' : 'Save draft'}
          </Button>
          <Button variant="secondary" className="text-sm" onClick={() => copyToClipboard(content[activeTab])}>Copy to clipboard</Button>
          {activeTab === 'blog' && (
            <Button variant="secondary" className="text-sm" onClick={() => {}}>Copy markdown</Button>
          )}
          <div className="relative">
            <Button variant="secondary" className="text-sm border-dashed cursor-not-allowed opacity-60">
              Post to LinkedIn
            </Button>
            <span className="absolute -top-2 -right-2 text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full">Coming V2</span>
          </div>
        </div>
        {(saveState.message || autosaveState !== 'idle') && (
          <p className="mb-4 text-sm text-brand-muted">
            {saveState.message || (
              autosaveState === 'saving'
                ? 'Saving…'
                : autosaveState === 'saved'
                  ? 'Saved just now'
                  : 'We could not save this progress yet.'
            )}
          </p>
        )}

        {outputIntentQuestion && !intentHidden && (
          <div className="mb-6 rounded-xl border border-brand bg-brand-surface-subtle px-4 py-4 animate-dashboard-enter">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-brand">{outputIntentQuestion.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {outputIntentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleIntentAnswer(option)}
                      className="rounded-full bg-brand-surface px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:text-brand"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleIntentDismiss}
                className="text-sm font-medium text-brand-muted transition-colors hover:text-brand"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Format switch */}
        <div className="border-t border-gray-200 pt-4">
          {activeTab === 'linkedin' ? (
            <button onClick={() => setActiveTab('blog')} className="text-sm text-gray-500 hover:underline">
              Generate blog post for this campaign →
            </button>
          ) : (
            <button onClick={() => setActiveTab('linkedin')} className="text-sm text-gray-500 hover:underline">
              ← Back to LinkedIn post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
