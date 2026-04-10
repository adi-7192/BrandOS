import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import DangerConfirmModal from '../../components/ui/DangerConfirmModal';
import api from '../../services/api';
import {
  buildBriefOriginMeta,
  buildConfirmedBrief,
  buildManualBriefFromBrand,
  buildSamplePreviewSections,
  isManualBriefReady,
} from '../../lib/generation-flow';
import { buildCampaignDeleteConfirmation } from '../../lib/destructive-actions';
import {
  buildGenerationSessionPayload,
  buildSessionQuery,
  buildSessionRoute,
} from '../../lib/generation-session';

const SOURCE_COLORS = {
  inbox: 'bg-green-100 text-green-700 border-green-300',
  inferred: 'bg-amber-100 text-amber-700 border-amber-300',
  'user-provided': 'bg-purple-100 text-purple-700 border-purple-300',
};

function FieldBlock({ label, value, source, highlight, children }) {
  return (
    <div className={`rounded-lg border-2 p-4 ${highlight ? 'border-amber-400' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
          {source && (
            <span className={`ml-2 inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${SOURCE_COLORS[source] || SOURCE_COLORS['user-provided']}`}>
              {source === 'inbox' ? 'From inbox' : source === 'inferred' ? 'AI-inferred' : 'User-provided'}
            </span>
          )}
        </div>
      </div>
      {children || <p className="text-sm text-gray-800">{value}</p>}
      {highlight && (
        <p className="mt-2 text-xs text-amber-600">Quoted directly — used as anchor for both LinkedIn and blog formats</p>
      )}
    </div>
  );
}

export default function Brief() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, search, pathname } = location;
  const [brief, setBrief] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [contentGoal, setContentGoal] = useState('');
  const [toneShift, setToneShift] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [sessionId, setSessionId] = useState(new URLSearchParams(search).get('sessionId') || state?.sessionId || '');
  const [autosaveState, setAutosaveState] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [deleteState, setDeleteState] = useState({ open: false, loading: false });
  const [deleteError, setDeleteError] = useState('');
  const brandIdParam = new URLSearchParams(search).get('brandId');
  const sessionIdParam = new URLSearchParams(search).get('sessionId');
  const initialSnapshotRef = useRef('');
  const lastSavedSnapshotRef = useRef('');

  const seedFields = (nextBrief) => {
    setCampaignName(nextBrief?.campaignName || '');
    setCampaignType(nextBrief?.campaignType || '');
    setPublishDate(nextBrief?.publishDate || '');
    setAudienceType(nextBrief?.audienceType || nextBrief?.audience || '');
    setContentGoal(nextBrief?.contentGoal || '');
    setToneShift(nextBrief?.toneShift || '');
    setKeyMessage(nextBrief?.keyMessage || '');
  };

  useEffect(() => {
    const loadBrief = async () => {
      try {
        if (sessionIdParam) {
          const res = await api.get(`/generate/sessions/${sessionIdParam}`);
          const session = res.data.session;

          if (session.currentStep && session.currentStep !== 'brief') {
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
          setBrief(session.briefPayload || {});
          seedFields(session.briefPayload || {});
          const snapshot = buildFieldSnapshot(session.briefPayload || {});
          initialSnapshotRef.current = snapshot;
          lastSavedSnapshotRef.current = snapshot;
          return;
        }

        if (state?.mode === 'manual' || brandIdParam) {
          const sourceBrand = state?.brand
            ? state.brand
            : (await api.get(`/brands/${brandIdParam}`)).data.brand;
          const nextBrief = buildManualBriefFromBrand(sourceBrand);
          setBrief(nextBrief);
          seedFields(nextBrief);
          const snapshot = buildFieldSnapshot(nextBrief);
          initialSnapshotRef.current = snapshot;
          lastSavedSnapshotRef.current = snapshot;
          return;
        }

        if (state?.sampleBrief) {
          const nextBrief = state.sampleBrief;
          setBrief(nextBrief);
          seedFields(nextBrief);
          const snapshot = buildFieldSnapshot(nextBrief);
          initialSnapshotRef.current = snapshot;
          lastSavedSnapshotRef.current = snapshot;
          return;
        }

        const cardIds = state?.cardIds || [];
        const res = await api.post('/generate/brief', { cardIds });
        setBrief(res.data.brief);
        seedFields(res.data.brief);
        const snapshot = buildFieldSnapshot(res.data.brief);
        initialSnapshotRef.current = snapshot;
        lastSavedSnapshotRef.current = snapshot;
      } catch {
        setBrief(null);
      } finally {
        setLoading(false);
      }
    };

    loadBrief();
  }, [brandIdParam, navigate, sessionIdParam, state]);

  const nextBrief = brief ? buildConfirmedBrief(brief, {
    campaignName,
    campaignType,
    publishDate,
    audienceType,
    contentGoal,
    toneShift,
    keyMessage,
  }) : null;

  const readyToContinue = nextBrief ? isManualBriefReady(nextBrief) : false;
  const isManualMode = nextBrief?.mode === 'manual';
  const isSampleMode = nextBrief?.mode === 'sample';
  const originMeta = nextBrief ? buildBriefOriginMeta(nextBrief) : null;
  const campaignDeleteConfirmation = buildCampaignDeleteConfirmation({
    sessionTitle: nextBrief?.campaignName || brief?.campaignName || brief?.emailSubject || brief?.brandName,
  });

  const persistSession = async ({ nextStep, nextBriefOverride } = {}) => {
    const briefForSave = nextBriefOverride || nextBrief;
    const payload = buildGenerationSessionPayload({
      brief: briefForSave,
      sections: {},
      output: { linkedin: '', blog: '' },
      currentStep: nextStep || 'brief',
      activeTab: 'linkedin',
      lastInstruction: '',
    });

    setAutosaveState('saving');

    const res = sessionId
      ? await api.patch(`/generate/sessions/${sessionId}`, payload)
      : await api.post('/generate/sessions', payload);

    const persisted = res.data.session;
    const nextSessionId = persisted.id;
    setSessionId(nextSessionId);
    lastSavedSnapshotRef.current = buildFieldSnapshot(briefForSave);
    setAutosaveState('saved');

    if (!sessionId) {
      navigate(`${pathname}${buildSessionQuery(nextSessionId)}`, {
        replace: true,
        state: { ...state, sessionId: nextSessionId, brief: briefForSave },
      });
    }

    return persisted;
  };

  useEffect(() => {
    if (loading || !nextBrief?.brandId) return undefined;

    const snapshot = buildFieldSnapshot(nextBrief);
    if (snapshot === lastSavedSnapshotRef.current) return undefined;
    if (!sessionId && snapshot === initialSnapshotRef.current) return undefined;

    const timer = setTimeout(() => {
      persistSession().catch(() => setAutosaveState('error'));
    }, 700);

    return () => clearTimeout(timer);
  }, [audienceType, campaignName, campaignType, contentGoal, keyMessage, loading, nextBrief, publishDate, sessionId, toneShift]);

  const handleContinue = async () => {
    if (isSampleMode) {
      navigate('/generate/preview', {
        state: {
          brief: nextBrief,
          sections: buildSamplePreviewSections(),
          activeTab: 'linkedin',
        },
      });
      return;
    }

    const persisted = await persistSession({ nextStep: 'preview' });
    navigate(`/generate/preview${buildSessionQuery(persisted.id)}`, {
      state: {
        brief: nextBrief,
        sessionId: persisted.id,
      },
    });
  };

  const handleDeleteCampaign = async () => {
    if (!sessionId) return;

    setDeleteError('');
    setDeleteState({ open: true, loading: false });
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

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <TopNav eyebrow="Campaign flow" meta="Brief → Preview → Generate" />
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-medium text-gray-900">Brief</span>
            <span>→</span>
            <span>Preview</span>
            <span>→</span>
            <span>Generate</span>
          </div>
          {sessionId ? (
            <button
              type="button"
              onClick={handleDeleteCampaign}
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

        {/* Brand pill */}
        <div className="flex items-center gap-3 mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
            {brief?.brandName?.[0] || 'B'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{brief?.brandName || 'Brand'}</p>
            <p className="text-xs text-gray-400">{brief?.kit?.voiceAdjectives?.join(' · ')} · {brief?.language}</p>
          </div>
          {!isSampleMode ? <button className="text-xs text-gray-400 hover:underline">Change brand</button> : null}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading brief…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {originMeta ? (
              <div className="rounded-xl border border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a66c2] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    {originMeta.badge}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{originMeta.label}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{originMeta.description}</p>
              </div>
            ) : null}

            {isManualMode ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Brand memory is already loaded. Add only the campaign-specific details for this piece.
              </div>
            ) : isSampleMode ? (
              <div className="rounded-lg border border-[#dbe6f3] bg-[#f8fbff] p-3 text-sm text-slate-700">
                This example uses sample data so you can understand the flow before your real inbox is connected.
              </div>
            ) : brief?.lowConfidence ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                This brief is missing several fields. The more you fill in, the better the output.
              </div>
            ) : null}

            <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2">
              <ContextItem label="Language" value={brief?.language || 'English'} />
              <ContextItem label="Brand voice" value={brief?.kit?.voiceAdjectives?.join(' · ') || 'Pending'} />
              <ContextItem label="Guardrails" value={`${brief?.kit?.restrictedWords?.length || 0} restricted words`} />
              <ContextItem label="Funnel stages" value={brief?.funnelStage || brief?.kit?.funnelStage || 'Not set'} />
              <ContextItem label="Proof style" value={brief?.proofStyle || brief?.kit?.proofStyle || 'Brand default'} />
              <ContextItem label="Publishing cadence" value={brief?.publishingFrequency || brief?.kit?.publishingFrequency || 'Not set'} />
            </div>

            <FieldBlock label="Campaign name" source={isManualMode ? 'user-provided' : 'inbox'}>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Summer workshop series"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </FieldBlock>

            <FieldBlock label="Campaign type" source={isManualMode ? 'user-provided' : 'inbox'}>
              <Dropdown
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                options={['Product launch', 'Brand awareness', 'Seasonal campaign', 'Event promotion', 'Thought leadership', 'Customer story', 'Other']}
              />
            </FieldBlock>

            <FieldBlock label="Publish date" source={brief?.publishDate && !isManualMode ? 'inbox' : 'user-provided'}>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Use the campaign&apos;s go-live date so the dashboard can flag upcoming deadlines correctly.</p>
            </FieldBlock>

            <FieldBlock label="Audience" source={brief?.audience ? 'inbox' : 'user-provided'}>
              <Dropdown
                options={['B2B decision makers', 'Young professionals', 'General consumers', 'Parents and families', 'Custom']}
                value={audienceType}
                onChange={e => setAudienceType(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Preloaded from the brand kit. Adjust only if this campaign targets a different audience.</p>
            </FieldBlock>

            <FieldBlock label="Tone shift" source={brief?.toneShift ? 'inferred' : 'user-provided'}>
              <Dropdown
                value={toneShift}
                onChange={(e) => setToneShift(e.target.value)}
                options={['Keep baseline', 'More editorial', 'More direct', 'More aspirational', 'More restrained', 'More urgent', 'Custom']}
              />
            </FieldBlock>

            <FieldBlock label="Key message" source={brief?.keyMessage ? 'inbox' : 'user-provided'} highlight>
              <textarea
                rows={3}
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                placeholder="What should the audience understand, feel, or do after reading this piece?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:border-gray-900 focus:outline-none"
              />
            </FieldBlock>

            <FieldBlock label="Content goal" source="user-provided">
              <Dropdown
                label="Content goal"
                required
                value={contentGoal}
                onChange={e => setContentGoal(e.target.value)}
                options={['Lead generation', 'Brand visibility', 'Thought leadership', 'PR and press']}
              />
              <p className="text-xs text-gray-400 mt-1">Preloaded from the brand kit. Change it only if this campaign has a different objective.</p>
            </FieldBlock>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => navigate(isSampleMode ? '/dashboard' : isManualMode ? `/settings/brands/${brief.brandId}` : '/inbox')}
                className="text-sm text-gray-500 hover:underline"
              >
                {isSampleMode ? '← Back to dashboard' : isManualMode ? '← Back to brand kit' : '← Back to inbox'}
              </button>
              <Button variant="primary" disabled={!readyToContinue} onClick={handleContinue} className="flex-1">
                Preview content →
              </Button>
            </div>
            {autosaveState !== 'idle' && (
              <p className="text-xs text-slate-400">
                {autosaveState === 'saving'
                  ? 'Saving…'
                  : autosaveState === 'saved'
                    ? 'Saved just now'
                    : 'We could not save this progress yet.'}
              </p>
            )}
          </div>
        )}
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
    </div>
  );
}

function ContextItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-sm text-gray-700">{value}</p>
    </div>
  );
}

function buildFieldSnapshot(brief) {
  return JSON.stringify({
    campaignName: brief?.campaignName || '',
    campaignType: brief?.campaignType || '',
    publishDate: brief?.publishDate || '',
    audienceType: brief?.audienceType || brief?.audience || '',
    contentGoal: brief?.contentGoal || '',
    toneShift: brief?.toneShift || '',
    keyMessage: brief?.keyMessage || '',
  });
}
