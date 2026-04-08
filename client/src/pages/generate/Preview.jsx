import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import {
  createInitialPreviewSections,
  hasPreviewContent,
  mergePreviewSuggestions,
} from '../../lib/generation-flow';
import {
  buildGenerationSessionPayload,
  buildSessionQuery,
  buildSessionRoute,
} from '../../lib/generation-session';

function EditableSection({ label, content, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">{label}</p>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.textContent)}
        className="w-full min-h-[60px] rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 focus:outline-none focus:border-gray-900"
      >
        {content}
      </div>
    </div>
  );
}

export default function Preview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, search, pathname } = location;
  const sessionIdParam = new URLSearchParams(search).get('sessionId');
  const [sessionId, setSessionId] = useState(sessionIdParam || state?.sessionId || '');
  const [brief, setBrief] = useState(state?.brief || null);
  const [activeFormat, setActiveFormat] = useState(state?.activeTab || 'linkedin');
  const [sections, setSections] = useState(createInitialPreviewSections());
  const [loading, setLoading] = useState(true);
  const [autosaveState, setAutosaveState] = useState('idle');
  const [suggestionsState, setSuggestionsState] = useState('idle');
  const initialSnapshotRef = useRef('');
  const lastSavedSnapshotRef = useRef('');

  useEffect(() => {
    const loadPreview = async () => {
      try {
        if (sessionIdParam) {
          const res = await api.get(`/generate/sessions/${sessionIdParam}`);
          const session = res.data.session;
          if (session.currentStep && session.currentStep !== 'preview') {
            navigate(buildSessionRoute(session), {
              replace: true,
              state: {
                sessionId: session.id,
                brief: session.briefPayload,
                sections: session.previewPayload,
                output: session.outputPayload,
                activeTab: session.activeTab,
              },
            });
            return;
          }

          setSessionId(session.id);
          setBrief(session.briefPayload || null);
          const hydratedSections = mergePreviewSuggestions(createInitialPreviewSections(), session.previewPayload || {});
          setSections(hydratedSections);
          setActiveFormat(session.activeTab || 'linkedin');
          const snapshot = buildPreviewSnapshot(hydratedSections, session.activeTab || 'linkedin');
          initialSnapshotRef.current = snapshot;
          lastSavedSnapshotRef.current = snapshot;
          return;
        }

        setBrief(state?.brief || null);
        const initialSections = mergePreviewSuggestions(createInitialPreviewSections(), state?.sections || {});
        setSections(initialSections);
        setActiveFormat(state?.activeTab || 'linkedin');
        const snapshot = buildPreviewSnapshot(initialSections, state?.activeTab || 'linkedin');
        initialSnapshotRef.current = snapshot;
        lastSavedSnapshotRef.current = snapshot;
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [navigate, sessionIdParam, state]);

  useEffect(() => {
    if (loading || !brief?.brandId) return undefined;
    if (hasPreviewContent(sections, 'linkedin') || hasPreviewContent(sections, 'blog')) return undefined;

    hydrateSuggestions({ mode: 'merge' }).catch(() => {});
    return undefined;
  }, [brief?.brandId, loading]);

  const updateSection = (format, key, val) => {
    setSections(s => ({ ...s, [format]: { ...s[format], [key]: val } }));
  };

  const hydrateSuggestions = async ({ mode = 'merge' } = {}) => {
    if (!brief) return;

    setSuggestionsState('loading');
    try {
      const res = await api.post('/generate/preview', { brief });
      const incomingSections = res.data.sections || createInitialPreviewSections();

      const nextSections = mode === 'replace-active'
        ? {
            ...sections,
            [activeFormat]: {
              ...createInitialPreviewSections()[activeFormat],
              ...(incomingSections[activeFormat] || {}),
            },
          }
        : mergePreviewSuggestions(sections, incomingSections);

      setSections(nextSections);
      setSuggestionsState('ready');
    } catch {
      setSuggestionsState('error');
    }
  };

  const persistSession = async ({ nextStep, nextActiveTab } = {}) => {
    const payload = buildGenerationSessionPayload({
      brief,
      sections,
      output: {},
      currentStep: nextStep || 'preview',
      activeTab: nextActiveTab || activeFormat,
      lastInstruction: '',
    });

    setAutosaveState('saving');
    const res = sessionId
      ? await api.patch(`/generate/sessions/${sessionId}`, payload)
      : await api.post('/generate/sessions', payload);

    const persisted = res.data.session;
    setSessionId(persisted.id);
    lastSavedSnapshotRef.current = buildPreviewSnapshot(sections, nextActiveTab || activeFormat);
    setAutosaveState('saved');

    if (!sessionId) {
      navigate(`${pathname}${buildSessionQuery(persisted.id)}`, {
        replace: true,
        state: { brief, sections, sessionId: persisted.id, activeTab: nextActiveTab || activeFormat },
      });
    }

    return persisted;
  };

  useEffect(() => {
    if (loading || !brief?.brandId) return undefined;

    const snapshot = buildPreviewSnapshot(sections, activeFormat);
    if (snapshot === lastSavedSnapshotRef.current) return undefined;
    if (!sessionId && snapshot === initialSnapshotRef.current) return undefined;

    const timer = setTimeout(() => {
      persistSession().catch(() => setAutosaveState('error'));
    }, 700);

    return () => clearTimeout(timer);
  }, [activeFormat, brief, loading, sections, sessionId]);

  const handleGenerate = async () => {
    const persisted = await persistSession({ nextStep: 'creating' });
    navigate(`/generate/creating${buildSessionQuery(persisted.id)}`, { state: { brief, sections, sessionId: persisted.id } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span>Brief</span>
          <span>→</span>
          <span className="font-medium text-gray-900">Preview</span>
          <span>→</span>
          <span>Generate</span>
        </div>

        <div className="flex gap-2 mb-4">
          {['linkedin', 'blog'].map(fmt => (
            <button key={fmt} onClick={() => setActiveFormat(fmt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeFormat === fmt ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {fmt === 'linkedin' ? 'LinkedIn post' : 'Blog post'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">AI drafted these sections from your brief.</p>
              <p className="mt-1 text-xs text-gray-400">Review and tweak only if needed. You should not have to write this from scratch.</p>
            </div>
            <button
              type="button"
              onClick={() => hydrateSuggestions({ mode: 'replace-active' })}
              disabled={suggestionsState === 'loading'}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {suggestionsState === 'loading'
                ? 'Refreshing…'
                : activeFormat === 'linkedin'
                  ? 'Refresh LinkedIn draft'
                  : 'Refresh blog draft'}
            </button>
          </div>

          {suggestionsState === 'loading' && !hasPreviewContent(sections, activeFormat) && (
            <p className="mb-4 text-sm text-blue-600">Drafting suggestions from your campaign brief…</p>
          )}
          {suggestionsState === 'error' && (
            <p className="mb-4 text-sm text-amber-600">We could not draft suggestions this time. You can still edit manually or try refreshing again.</p>
          )}

          {activeFormat === 'linkedin' && (
            <>
              <EditableSection label="Hook" content={sections.linkedin.hook} onChange={v => updateSection('linkedin', 'hook', v)} />
              <EditableSection label="Body" content={sections.linkedin.body} onChange={v => updateSection('linkedin', 'body', v)} />
              <EditableSection label="Closing" content={sections.linkedin.closing} onChange={v => updateSection('linkedin', 'closing', v)} />
              <EditableSection label="Hashtags" content={sections.linkedin.hashtags} onChange={v => updateSection('linkedin', 'hashtags', v)} />
            </>
          )}
          {activeFormat === 'blog' && (
            <>
              <EditableSection label="Headline" content={sections.blog.headline} onChange={v => updateSection('blog', 'headline', v)} />
              <EditableSection label="Opening" content={sections.blog.opening} onChange={v => updateSection('blog', 'opening', v)} />
              <EditableSection label="Body" content={sections.blog.body} onChange={v => updateSection('blog', 'body', v)} />
              <EditableSection label="Closing" content={sections.blog.closing} onChange={v => updateSection('blog', 'closing', v)} />
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/generate/brief${buildSessionQuery(sessionId)}`, { state: { brief, sessionId } })} className="text-sm text-gray-500 hover:underline">← Back to brief</button>
          <Button variant="primary" onClick={handleGenerate} className="flex-1">
            Looks good — generate full content →
          </Button>
        </div>
        {autosaveState !== 'idle' && (
          <p className="mt-3 text-xs text-slate-400">
            {autosaveState === 'saving'
              ? 'Saving…'
              : autosaveState === 'saved'
                ? 'Saved just now'
                : 'We could not save this progress yet.'}
          </p>
        )}
      </div>
    </div>
  );
}

function buildPreviewSnapshot(sections, activeFormat) {
  return JSON.stringify({
    sections,
    activeFormat,
  });
}
