import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import api from '../../services/api';
import { buildBriefOriginMeta, buildGeneratingContext, buildSampleOutput } from '../../lib/generation-flow';
import { buildGenerationSessionPayload, buildSessionQuery } from '../../lib/generation-session';

const STEPS = [
  (brand) => `Loading brand kit v1…`,
  (brand, kit) => `Applying tone: ${kit?.voiceAdjectives?.join(' · ') || '…'}`,
  () => 'Anchoring to key message…',
  (brand, kit) => `Enforcing ${kit?.restrictedWords?.length || 0} restricted word guardrails…`,
  (brand, kit, language) => `Writing in brand voice (${language || 'English'})…`,
  () => 'Checking format compliance…',
];

export default function Creating() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [generationError, setGenerationError] = useState('');
  const sessionIdParam = new URLSearchParams(search).get('sessionId');
  const [brief, setBrief] = useState(state?.brief || {});
  const [sections, setSections] = useState(state?.sections || {});
  const [sessionId, setSessionId] = useState(sessionIdParam || state?.sessionId || '');
  const kit = brief.kit || {};
  const context = buildGeneratingContext(brief);
  const originMeta = buildBriefOriginMeta(brief);

  useEffect(() => {
    if (brief?.mode === 'sample') {
      const timeout = setTimeout(() => {
        navigate('/generate/output', {
          state: {
            output: buildSampleOutput(),
            brief,
            activeTab: 'linkedin',
          },
        });
      }, 2200);

      return () => clearTimeout(timeout);
    }

    const generate = async () => {
      let interval;
      let activeBrief = brief;
      let activeSections = sections;
      let activeSessionId = sessionIdParam || state?.sessionId || '';

      try {
        if (sessionIdParam) {
          const sessionRes = await api.get(`/generate/sessions/${sessionIdParam}`);
          activeBrief = sessionRes.data.session.briefPayload || {};
          activeSections = sessionRes.data.session.previewPayload || {};
          activeSessionId = sessionRes.data.session.id;
          setBrief(activeBrief);
          setSections(activeSections);
          setSessionId(activeSessionId);
        }

        const creatingPayload = buildGenerationSessionPayload({
          brief: activeBrief,
          sections: activeSections,
          output: {},
          currentStep: 'creating',
          activeTab: 'linkedin',
          lastInstruction: '',
        });

        if (activeSessionId) {
          await api.patch(`/generate/sessions/${activeSessionId}`, creatingPayload);
        } else {
          const created = await api.post('/generate/sessions', creatingPayload);
          activeSessionId = created.data.session.id;
          setSessionId(activeSessionId);
        }

        let step = 0;
        interval = setInterval(() => {
          step += 1;
          setCurrentStep(step);
          if (step >= STEPS.length) clearInterval(interval);
        }, 900);

        const res = await api.post('/generate/create', { brief: activeBrief, sections: activeSections });
        clearInterval(interval);
        await api.patch(`/generate/sessions/${activeSessionId}`, buildGenerationSessionPayload({
          brief: activeBrief,
          sections: activeSections,
          output: res.data.output,
          currentStep: 'output',
          activeTab: 'linkedin',
          lastInstruction: '',
        }));
        navigate(`/generate/output${buildSessionQuery(activeSessionId)}`, { state: { output: res.data.output, brief: activeBrief, sessionId: activeSessionId } });
      } catch {
        if (interval) clearInterval(interval);
        setGenerationError('Content generation failed. Please go back to the brief and try again.');
      }
    };

    generate();
  }, [navigate, sessionIdParam, state]);

  if (generationError) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <TopNav eyebrow="Campaign flow" meta="Generating content" />
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <span>Brief</span><span>→</span><span>Preview</span><span>→</span>
            <span className="font-medium text-gray-900">Generate</span>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 mb-6">
            <p className="text-sm text-red-700">{generationError}</p>
          </div>

          <button
            onClick={() => window.history.back()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            ← Go back to brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <TopNav eyebrow="Campaign flow" meta="Generating content" />
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span>Brief</span><span>→</span><span>Preview</span><span>→</span>
          <span className="font-medium text-gray-900">Generate</span>
        </div>

        <div className="mb-6 rounded-[24px] border border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a66c2] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              {originMeta.badge}
            </span>
            <p className="text-sm font-semibold text-slate-900">{originMeta.label}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{originMeta.description}</p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Generation steps */}
          <div className="flex-1">
            <div className="flex justify-center mb-6">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7ebf3] border-t-[var(--brand-primary)]" />
            </div>
            <h1 className="mb-2 text-center font-sans text-[1.75rem] font-semibold tracking-[-0.03em] text-slate-950">Writing for {brief.brandName || 'your brand'}…</h1>
            <div className="space-y-2 mt-6">
              {STEPS.map((stepFn, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-opacity ${i < currentStep ? 'opacity-100' : 'opacity-30'}`}>
                  <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${i < currentStep ? 'bg-[var(--brand-primary)] text-white' : 'bg-[#e7ebf3] text-slate-500'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </span>
                  {stepFn(brief.brandName, kit, brief.language)}
                </div>
              ))}
            </div>
          </div>

          {/* Context panel */}
          <div className="w-full flex-shrink-0 rounded-[24px] border border-[#e7ebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:w-56">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Context being applied</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div><span className="text-gray-400">Brand voice</span><br />{context.voice}</div>
              <div><span className="text-gray-400">Language</span><br />{context.language}</div>
              <div><span className="text-gray-400">Tone shift</span><br />{context.toneShift}</div>
              <div><span className="text-gray-400">Audience</span><br />{context.audience}</div>
              <div><span className="text-gray-400">Guardrails</span><br />{context.guardrailCount} active</div>
              <div><span className="text-gray-400">Goal</span><br />{context.goal}</div>
              <div><span className="text-gray-400">Key message</span><br /><span className="truncate block">{context.keyMessage}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
