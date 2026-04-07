import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import Button from '../../components/ui/Button';

const AVAILABLE_NOW = ['LinkedIn posts', 'Blog posts'];
const COMING_SOON = ['Email newsletters', 'Ad copy', 'Press releases', 'Video scripts', 'Social captions', 'Case studies'];

export default function S3ContentTypes() {
  const navigate = useNavigate();
  const { brandName, contentTypes, contentTypesInterest, update } = useOnboarding();

  const toggle = (type, available) => {
    if (available) {
      update({
        contentTypes: contentTypes.includes(type)
          ? contentTypes.filter(t => t !== type)
          : [...contentTypes, type],
      });
    } else {
      update({
        contentTypesInterest: contentTypesInterest.includes(type)
          ? contentTypesInterest.filter(t => t !== type)
          : [...contentTypesInterest, type],
      });
    }
  };

  const canContinue = contentTypes.length > 0;

  return (
    <OnboardingShell phase="Phase 1 · get in fast" step={3} totalSteps={3}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        What does {brandName ? `${brandName}'s` : 'your'} team produce?
      </h1>
      <p className="text-sm text-gray-500 mb-8">Select all that apply — we'll configure your workspace accordingly.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {AVAILABLE_NOW.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type, true)}
            className={`rounded-xl border-2 p-4 text-left text-sm font-medium transition-colors ${
              contentTypes.includes(type)
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
            }`}
          >
            {type}
            <span className="mt-1 block text-xs font-normal opacity-70">Available now</span>
          </button>
        ))}
        {COMING_SOON.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type, false)}
            className={`rounded-xl border-2 border-dashed p-4 text-left text-sm font-medium transition-colors ${
              contentTypesInterest.includes(type)
                ? 'border-gray-400 bg-gray-50 text-gray-700'
                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
            }`}
          >
            {type}
            <span className="mt-1 block text-xs font-normal">Coming soon</span>
          </button>
        ))}
      </div>

      {/* Selection chips */}
      {(contentTypes.length > 0 || contentTypesInterest.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {contentTypes.map(t => (
            <span key={t} className="chip-green text-xs">{t}</span>
          ))}
          {contentTypesInterest.map(t => (
            <span key={t} className="chip-grey text-xs">{t} (coming soon)</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button type="button" onClick={() => navigate('/onboarding/brand-name')} className="text-sm text-gray-500 hover:underline">
          ← Back
        </button>
        <Button variant="primary" disabled={!canContinue} onClick={() => navigate('/onboarding/unlocked')} className="flex-1">
          Continue →
        </Button>
      </div>
    </OnboardingShell>
  );
}
