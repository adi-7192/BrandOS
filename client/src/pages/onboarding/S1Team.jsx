import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import Input from '../../components/ui/Input';
import Dropdown from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';

const TEAMS = ['Brand and Content', 'Marketing Communications', 'Digital Marketing', 'Corporate Communications', 'Social Media', 'PR and External Affairs', 'Creative Studio', 'Other'];
const BRAND_COUNTS = ['1–2', '3–4', '5–8', '9+'];

export default function S1Team() {
  const navigate = useNavigate();
  const { role, team, brandCount, update } = useOnboarding();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/onboarding/brand-name');
  };

  return (
    <OnboardingShell phase="Phase 1 · get in fast" step={1} totalSteps={3}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Tell us about your team</h1>
      <p className="text-sm text-gray-500 mb-8">Helps us personalise your workspace from the start.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Your role"
          placeholder="e.g. Content Marketing Specialist"
          value={role}
          onChange={e => update({ role: e.target.value })}
          tooltip="Helps us tailor how the tool is presented to you."
        />
        <Dropdown
          label="Team or department"
          options={TEAMS}
          value={team}
          onChange={e => update({ team: e.target.value })}
          tooltip="Tells us what kind of content you focus on."
        />
        <Dropdown
          label="How many brands does your team manage?"
          options={BRAND_COUNTS}
          value={brandCount}
          onChange={e => update({ brandCount: e.target.value })}
          tooltip="A user managing 9+ brands needs a very different workspace default than someone managing 1–2."
        />

        <Button type="submit" variant="primary" className="mt-2 w-full">
          Continue →
        </Button>
      </form>
    </OnboardingShell>
  );
}
