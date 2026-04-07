import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import api from '../../services/api';

const STEPS = [
  (brand) => `Loading brand kit v1…`,
  (brand, kit) => `Applying tone: ${kit?.voiceAdjectives?.join(' · ') || '…'}`,
  () => 'Anchoring to key message…',
  (brand, kit) => `Enforcing ${kit?.restrictedWords?.length || 0} restricted word guardrails…`,
  (brand, kit) => `Writing in brand voice (${kit?.language || 'English'})…`,
  () => 'Checking format compliance…',
];

export default function Creating() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const brief = state?.brief || {};
  const sections = state?.sections || {};

  const kit = { voiceAdjectives: ['Authentic', 'Confident', 'Approachable'], restrictedWords: [], language: brief.language || 'English' };

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= STEPS.length) clearInterval(interval);
    }, 900);

    const generate = async () => {
      try {
        const res = await api.post('/generate/create', { brief, sections });
        clearInterval(interval);
        navigate('/generate/output', { state: { output: res.data.output, brief } });
      } catch {
        clearInterval(interval);
        navigate('/generate/output', { state: { output: { linkedin: '', blog: '' }, brief } });
      }
    };

    generate();
    return () => clearInterval(interval);
  }, []);

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
                  {stepFn(brief.brandName, kit)}
                </div>
              ))}
            </div>
          </div>

          {/* Context panel */}
          <div className="w-52 flex-shrink-0 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Context being applied</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div><span className="text-gray-400">Brand voice</span><br />{kit.voiceAdjectives?.join(', ')}</div>
              <div><span className="text-gray-400">Language</span><br />{brief.language || 'English'}</div>
              <div><span className="text-gray-400">Tone shift</span><br />{brief.toneShift || 'Baseline'}</div>
              <div><span className="text-gray-400">Audience</span><br />{brief.audienceType || brief.audience || '—'}</div>
              <div><span className="text-gray-400">Guardrails</span><br />{kit.restrictedWords?.length || 0} active</div>
              <div><span className="text-gray-400">Goal</span><br />{brief.contentGoal || '—'}</div>
              <div><span className="text-gray-400">Key message</span><br /><span className="truncate block">{brief.keyMessage || '—'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
