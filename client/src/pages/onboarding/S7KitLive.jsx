import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import Button from '../../components/ui/Button';

export default function S7KitLive() {
  const navigate = useNavigate();
  const ob = useOnboarding();

  const chips = [
    ob.kitCards?.voiceAdjectives?.join(' · '),
    ob.kitCards?.restrictedWords?.length && `${ob.kitCards.restrictedWords.length} restricted words`,
    'LinkedIn + Blog rules active',
    ob.contentGoal,
    [ob.brandLanguage, ob.primaryMarket].filter(Boolean).join(' · '),
    ob.publishingFrequency,
  ].filter(Boolean);

  return (
    <OnboardingShell phase="">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900">{ob.brandName || 'Your brand'}'s kit is live.</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ready to generate on-brand content — every time, without re-explaining the brief.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {chips.map((chip, i) => (
          <span key={i} className="chip chip-green text-xs">{chip}</span>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
          Go to dashboard
        </Button>
        <button onClick={() => navigate('/onboarding/brand-name')} className="text-sm text-center text-gray-500 hover:underline">
          Add another brand
        </button>
      </div>

      {/* Phase 3 signpost */}
      <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">What's available next</p>
        <ul className="space-y-2 text-sm text-gray-500">
          <li>Connect Gmail to capture campaign briefs automatically · takes 2 min</li>
          <li>Add the group layer — shared rules across all brands · in settings</li>
          <li>Add your next brand — each additional brand takes ~5 minutes</li>
        </ul>
      </div>
    </OnboardingShell>
  );
}
