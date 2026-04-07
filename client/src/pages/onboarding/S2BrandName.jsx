import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import Input from '../../components/ui/Input';
import Dropdown from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';

const MARKETS = ['France', 'United Kingdom', 'Germany', 'United States', 'Pan-European', 'Global', 'Other'];
const LANGUAGES = ['English', 'French', 'German', 'Spanish', 'Other'];

export default function S2BrandName() {
  const navigate = useNavigate();
  const { brandName, primaryMarket, brandLanguage, update } = useOnboarding();
  const canContinue = brandName.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canContinue) return;
    navigate('/onboarding/content-types');
  };

  return (
    <OnboardingShell phase="Phase 1 · get in fast" step={2} totalSteps={3}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Name your first brand</h1>
      <p className="text-sm text-gray-500 mb-8">This propagates to every screen from here forward.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <Input
            label="Brand name"
            placeholder="e.g. BHV Marais"
            value={brandName}
            onChange={e => update({ brandName: e.target.value })}
            required
            tooltip="The brand you write content for — not your employer."
          />
          <p className="mt-1 text-xs text-gray-400">The brand you write content for — not your employer. You can add more brands after setup.</p>
        </div>
        <Dropdown
          label="Primary market"
          options={MARKETS}
          value={primaryMarket}
          onChange={e => update({ primaryMarket: e.target.value })}
          tooltip="Calibrates cultural references and platform norms for this brand's audience."
        />
        <Dropdown
          label="Brand language"
          options={LANGUAGES}
          value={brandLanguage}
          onChange={e => update({ brandLanguage: e.target.value })}
          tooltip="Content is generated in this language. Select French for a French-language brand — no per-session config needed."
        />

        <div className="flex items-center gap-3 mt-2">
          <button type="button" onClick={() => navigate('/onboarding/team')} className="text-sm text-gray-500 hover:underline">
            ← Back
          </button>
          <Button type="submit" variant="primary" disabled={!canContinue} className="flex-1">
            Continue →
          </Button>
        </div>
      </form>
    </OnboardingShell>
  );
}
