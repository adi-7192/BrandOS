import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import DangerConfirmModal from '../../components/ui/DangerConfirmModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getNextOutputIntentQuestion } from '../../lib/intent-capture';
import { buildGenerationSessionPayload, normalizeGenerationSessionStatus } from '../../lib/generation-session';
import { buildBriefOriginMeta } from '../../lib/generation-flow';
import { buildLinkedInPublishState } from '../../lib/linkedin-view';
import { buildCampaignDeleteConfirmation } from '../../lib/destructive-actions';
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
  const [sessionStatus, setSessionStatus] = useState('in_progress');
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
  const [completeState, setCompleteState] = useState({ saving: false, message: '' });
  const [autosaveState, setAutosaveState] = useState('idle');
  const [linkedin, setLinkedin] = useState({ connected: false, status: 'not_connected' });
  const [linkedinLoading, setLinkedinLoading] = useState(true);
  const [publishState, setPublishState] = useState({ loading: false, message: '', ok: false, postUrn: '', publishedAt: '' });
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [loading, setLoading] = useState(Boolean(sessionIdParam));
  const [intentHidden, setIntentHidden] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, loading: false });
  const [deleteError, setDeleteError] = useState('');
  const outputIntentQuestion = useMemo(
    () => getNextOutputIntentQuestion(user?.intentState),
    [user?.intentState]
  );
  const campaignDeleteConfirmation = buildCampaignDeleteConfirmation({
    sessionTitle: brief?.campaignName || brief?.emailSubject || brief?.brandName,
  });
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
  const linkedinPublishState = useMemo(
    () => buildLinkedInPublishState({
      activeTab,
      content: activeDraft,
      linkedin,
      publishing: publishState.loading,
    }),
    [activeDraft, activeTab, linkedin, publishState.loading]
  );
  const originMeta = useMemo(() => buildBriefOriginMeta(brief), [brief]);
  const isSampleMode = brief?.mode === 'sample';

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  useEffect(() => {
    let cancelled = false;

    api.get('/linkedin/status')
      .then((res) => {
        if (cancelled) return;
        setLinkedin(res.data.linkedin || { connected: false, status: 'not_connected' });
      })
      .catch(() => {
        if (cancelled) return;
        setLinkedin({ connected: false, status: 'not_connected' });
      })
      .finally(() => {
        if (cancelled) return;
        setLinkedinLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        setSessionStatus(normalizeGenerationSessionStatus(session.status));
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
          status: sessionStatus,
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
    setCompleteState((current) => ({ ...current, message: '' }));
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

      let statusUpdated = true;
      if (sessionId) {
        try {
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
            status: 'saved',
          }));
          setSessionStatus('saved');
        } catch {
          statusUpdated = false;
        }
      }

      setSaveState({
        saving: false,
        message: statusUpdated
          ? `Saved as draft in version ${res.data.version}.`
          : `Saved version ${res.data.version}, but we could not move the campaign to Draft yet.`,
      });
    } catch {
      setSaveState({ saving: false, message: 'Failed to save draft. Please try again.' });
    }
  };

  const handleMarkCompleted = async () => {
    if (!sessionId) {
      setCompleteState({ saving: false, message: 'This campaign needs a saved session before it can be marked as completed.' });
      return;
    }

    setCompleteState({ saving: true, message: '' });
    setSaveState((current) => ({ ...current, message: '' }));

    try {
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
        status: 'completed',
      }));
      setSessionStatus('completed');
      setCompleteState({
        saving: false,
        message: 'Campaign marked as completed. It now appears in the Completed tab on Campaigns.',
      });
    } catch {
      setCompleteState({
        saving: false,
        message: 'We could not mark this campaign as completed right now. Please try again.',
      });
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const handleOpenLinkedInSettings = () => {
    navigate('/settings');
  };

  const handlePublishToLinkedIn = async () => {
    if (linkedinPublishState.disabled) return;

    setPublishState({ loading: true, message: '', ok: false, postUrn: '', publishedAt: '' });
    try {
      const res = await api.post('/linkedin/publish', {
        generationSessionId: sessionId || null,
        brandId: brief?.brandId || null,
        content: content.linkedin,
      });

      setPublishState({
        loading: false,
        message: res.data.message || 'Published to LinkedIn.',
        ok: true,
        postUrn: res.data.postUrn || '',
        publishedAt: res.data.publishedAt || '',
      });
      if (sessionId) {
        setSessionStatus('completed');
        setCompleteState({
          saving: false,
          message: 'Campaign marked as completed after publishing.',
        });
      }
      setPublishModalOpen(false);
    } catch (err) {
      setPublishState({
        loading: false,
        message: err.response?.data?.message || 'We could not publish to LinkedIn right now.',
        ok: false,
        postUrn: '',
        publishedAt: '',
      });

      if (err.response?.status === 409) {
        setLinkedin((current) => ({
          ...current,
          connected: false,
          status: 'reconnect_required',
        }));
      }
    }
  };

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

  const confirmDeleteCampaign = async () => {
    if (!sessionId) return;

    setDeleteError('');
    setDeleteState({ open: true, loading: true });

    try {
      await api.delete(`/generate/sessions/${sessionId}`);
      navigate(brief?.brandId ? `/settings/brands/${brief.brandId}` : '/dashboard', { replace: true });
    } catch {
      setDeleteError('We could not delete this campaign right now. Please try again.');
      setDeleteState({ open: true, loading: false });
    }
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
          status: sessionStatus,
        }));
        setAutosaveState('saved');
      } catch {
        setAutosaveState('error');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [activeTab, brief, content, draftReaction, feedbackChips, feedbackNote, loading, sessionId, sessionStatus]);

  useEffect(() => {
    setSelectionRange({ start: 0, end: 0 });
    resetSelectionFeedback();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <TopNav eyebrow="Campaign flow" meta="Generated content ready to review" />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Campaign output
          </div>
          {sessionId ? (
            <button
              type="button"
              onClick={() => {
                setDeleteError('');
                setDeleteState({ open: true, loading: false });
              }}
              className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
            >
              Delete campaign
            </button>
          ) : null}
        </div>

        {deleteError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        ) : null}

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

        {originMeta ? (
          <div className="mb-4 rounded-xl border border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a66c2] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                {originMeta.badge}
              </span>
              <p className="text-sm font-semibold text-slate-900">{originMeta.label}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{originMeta.description}</p>
          </div>
        ) : null}

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
            {saveState.saving ? 'Saving…' : 'Save as draft'}
          </Button>
          <Button
            variant="teal"
            className="text-sm"
            onClick={handleMarkCompleted}
            disabled={completeState.saving || !sessionId || sessionStatus === 'completed'}
          >
            {completeState.saving ? 'Updating…' : sessionStatus === 'completed' ? 'Completed' : 'Mark as completed'}
          </Button>
          <Button variant="secondary" className="text-sm" onClick={() => copyToClipboard(content[activeTab])}>Copy to clipboard</Button>
          {activeTab === 'blog' && (
            <Button variant="secondary" className="text-sm" onClick={() => {}}>Copy markdown</Button>
          )}
        </div>
        {(saveState.message || completeState.message || autosaveState !== 'idle') && (
          <p className="mb-4 text-sm text-brand-muted">
            {saveState.message || completeState.message || (
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
                aria-label="Dismiss suggestion"
                onClick={handleIntentDismiss}
                className="text-sm font-medium text-brand-muted transition-colors hover:text-brand"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {!isSampleMode && linkedinPublishState.visible ? (
          <div className="mb-6 rounded-[24px] border border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0a66c2]">Publishing</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {linkedinPublishState.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {publishState.message || linkedinPublishState.helper}
                </p>
              </div>
              <span className={`inline-flex h-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                linkedinPublishState.mode === 'setup'
                  ? 'bg-[#fff5df] text-[#b7791f]'
                  : 'bg-[#e7f8ef] text-[#178A5B]'
              }`}>
                {linkedinLoading ? 'Checking status…' : linkedinPublishState.badgeLabel}
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                {linkedinPublishState.mode === 'setup' ? (
                  <div className="rounded-2xl border border-[#e7ecf3] bg-white px-4 py-4">
                    <p className="text-sm font-medium text-slate-900">How direct publishing works</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {linkedinPublishState.steps.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0a66c2]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#e7ecf3] bg-white px-4 py-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Connected account</p>
                      <p className="mt-3 text-sm font-semibold text-slate-900">{linkedin.displayName || 'Personal LinkedIn account'}</p>
                      <p className="mt-1 text-xs text-slate-500">{linkedin.email || 'Ready for direct publishing'}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e7ecf3] bg-white px-4 py-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Publish behavior</p>
                      <p className="mt-3 text-sm font-semibold text-slate-900">Posts immediately from BrandOS</p>
                      <p className="mt-1 text-xs text-slate-500">You can still copy the draft if you want to post manually.</p>
                    </div>
                  </div>
                )}

                {publishState.ok && (publishState.publishedAt || publishState.postUrn) ? (
                  <div className="mt-4 rounded-2xl border border-[#cfe9db] bg-[#eefaf3] px-4 py-3 text-sm text-[#146c43]">
                    {publishState.publishedAt ? `Published at ${new Date(publishState.publishedAt).toLocaleString()}. ` : ''}
                    {publishState.postUrn ? `Reference: ${publishState.postUrn}.` : ''}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
                <p className="text-sm font-medium text-slate-900">Next step</p>
                <div className="mt-4 space-y-3">
                  {linkedinPublishState.mode === 'setup' ? (
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={linkedinLoading}
                      onClick={handleOpenLinkedInSettings}
                    >
                      {linkedinPublishState.primaryActionLabel}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={linkedinLoading || linkedinPublishState.disabled}
                      onClick={() => setPublishModalOpen(true)}
                    >
                      {linkedinLoading ? 'Checking LinkedIn…' : linkedinPublishState.primaryActionLabel}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => copyToClipboard(content[activeTab])}
                  >
                    {linkedinPublishState.secondaryActionLabel}
                  </Button>
                  {linkedinPublishState.mode !== 'setup' ? (
                    <button
                      type="button"
                      onClick={handleOpenLinkedInSettings}
                      className="w-full text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                    >
                      Manage LinkedIn in Settings
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {isSampleMode ? (
          <div className="mb-6 rounded-[24px] border border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0a66c2]">Sample walkthrough</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">This output is example data</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Use this sample to understand how BrandOS moves from a brief to an editable final draft. When your real inbox and LinkedIn are connected, this same screen becomes your live review and publishing surface.
            </p>
          </div>
        ) : null}

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

      <DangerConfirmModal
        open={deleteState.open}
        title={campaignDeleteConfirmation.title}
        subject={campaignDeleteConfirmation.subject}
        description={campaignDeleteConfirmation.description}
        warningItems={campaignDeleteConfirmation.warningItems}
        confirmLabel={campaignDeleteConfirmation.confirmLabel}
        loading={deleteState.loading}
        onCancel={() => {
          if (deleteState.loading) return;
          setDeleteState({ open: false, loading: false });
        }}
        onConfirm={confirmDeleteCampaign}
      />
      <PublishConfirmModal
        open={publishModalOpen}
        loading={publishState.loading}
        accountName={linkedin.displayName || 'your personal LinkedIn account'}
        preview={content.linkedin}
        onCancel={() => {
          if (publishState.loading) return;
          setPublishModalOpen(false);
        }}
        onConfirm={handlePublishToLinkedIn}
      />
    </div>
  );
}

function PublishConfirmModal({ open, loading, accountName, preview, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-[#e7ebf3] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">Publish live</p>
            <h2 className="mt-2 font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
              Publish this LinkedIn post?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              BrandOS will publish this immediately to {accountName}. Review the final copy below before continuing.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Draft preview</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{preview}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            Cancel
          </button>
          <Button type="button" variant="primary" disabled={loading} onClick={onConfirm}>
            {loading ? 'Publishing…' : 'Publish to LinkedIn'}
          </Button>
        </div>
      </div>
    </div>
  );
}
