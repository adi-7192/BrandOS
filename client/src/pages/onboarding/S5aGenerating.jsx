import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import api from '../../services/api';
import { buildExtractKitRequest } from '../../lib/onboarding-extraction';

const STEPS = [
  'Reading website content',
  'Identifying brand voice patterns',
  'Extracting vocabulary and tone',
  'Mapping audience signals',
  'Drafting kit cards',
];

export default function S5aGenerating() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx += 1;
      setCurrentStep(stepIdx);
      if (stepIdx >= STEPS.length) clearInterval(interval);
    }, 700);

    // Trigger real extraction in background
    const runExtraction = async () => {
      try {
        const request = buildExtractKitRequest(ob);
        const res = await api.post('/onboarding/extract-kit', request.data, request.config);
        ob.update({
          kitCards: res.data.kitCards,
          guidelineFileUrl: res.data.guideline?.fileUrl || '',
          guidelineFileName: res.data.guideline?.fileName || '',
          guidelineStoragePath: res.data.guideline?.storagePath || '',
          guidelineTextExcerpt: res.data.guideline?.textExcerpt || '',
        });
        if (res.data.warning) {
          setError(res.data.warning);
        }
      } catch (err) {
        setError('Kit extraction failed. You can still review default cards.');
      }
    };

    runExtraction();

    return () => clearInterval(interval);
  }, []);

  // Auto-advance after steps complete + give extraction time
  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const timer = setTimeout(() => navigate('/onboarding/review-kit'), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigate]);

  return (
    <OnboardingShell phase="Phase 2 · build brand kit">
      <KitProgressBar activeStep={3} />

      <div className="text-center py-8">
        <div className="mb-6 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Reading {ob.brandName || 'your brand'}…</h1>
        <p className="text-sm text-gray-500 mb-8">The AI is extracting your brand's voice from everything you provided. This takes about 10–15 seconds.</p>

        <div className="text-left space-y-3 max-w-sm mx-auto">
          {STEPS.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-opacity ${i < currentStep ? 'opacity-100' : 'opacity-30'}`}>
              <span className={`h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center text-xs ${i < currentStep ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span className={i < currentStep ? 'text-gray-900' : 'text-gray-400'}>{step}</span>
            </div>
          ))}
        </div>

        {error && <p className="mt-6 text-sm text-amber-600">{error}</p>}
      </div>
    </OnboardingShell>
  );
}
