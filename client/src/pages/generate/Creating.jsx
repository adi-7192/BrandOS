import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import api from '../../services/api';
import { buildGeneratingContext } from '../../lib/generation-flow';
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
  const sessionIdParam = new URLSearchParams(search).get('sessionId');
  const [brief, setBrief] = useState(state?.brief || {});
  const [sections, setSections] = useState(state?.sections || {});
  const [sessionId, setSessionId] = useState(sessionIdParam || state?.sessionId || '');
  const kit = brief.kit || {};
  const context = buildGeneratingContext(brief);

  useEffect(() => {
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
        if (activeSessionId) {
          await api.patch(`/generate/sessions/${activeSessionId}`, buildGenerationSessionPayload({
            brief: activeBrief,
            sections: activeSections,
            output: { linkedin: '', blog: '' },
            currentStep: 'output',
            activeTab: 'linkedin',
            lastInstruction: '',
          })).catch(() => {});
        }
        navigate(`/generate/output${buildSessionQuery(activeSessionId)}`, { state: { output: { linkedin: '', blog: '' }, brief: activeBrief, sessionId: activeSessionId } });
      }
    };

    generate();
  }, [navigate, sessionIdParam, state]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span>Brief</span><span>→</span><span>Preview</span><span>→</span>
          <span className="font-medium text-gray-900">Generate</span>
        </div>

        <div className="flex gap-6">
          {/* Generation steps */}
          <div className="flex-1">
            <div className="flex justify-center mb-6">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Writing for {brief.brandName || 'your brand'}…</h1>
            <div className="space-y-2 mt-6">
              {STEPS.map((stepFn, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-opacity ${i < currentStep ? 'opacity-100' : 'opacity-30'}`}>
                  <span className={`h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center text-xs ${i < currentStep ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </span>
                  {stepFn(brief.brandName, kit, brief.language)}
                </div>
              ))}
            </div>
          </div>

          {/* Context panel */}
          <div className="w-52 flex-shrink-0 rounded-xl border border-gray-200 bg-white p-4">
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
