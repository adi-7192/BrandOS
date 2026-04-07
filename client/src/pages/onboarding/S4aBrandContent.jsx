import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

export default function S4aBrandContent() {
  const navigate = useNavigate();
  const { brandName, websiteUrl, pastContentExamples, brandGuidelinesFile, update } = useOnboarding();

  const handleFileChange = (e) => update({ brandGuidelinesFile: e.target.files[0] || null });

  const handleSubmit = (e) => {
    e.preventDefault();
    update({ s4aSkipped: false });
    navigate('/onboarding/audience-campaign');
  };

  const handleSkip = () => {
    update({ s4aSkipped: true });
    navigate('/onboarding/audience-campaign');
  };

  return (
    <OnboardingShell phase="Phase 2 · build brand kit">
      <KitProgressBar activeStep={1} />

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Seed content for {brandName ? `${brandName}'s` : 'the'} AI
      </h1>
      <p className="text-sm text-gray-500 mb-8">All optional — but the more you provide, the more accurate the kit.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Website URL"
          type="url"
          placeholder="https://bhvmarais.com"
          value={websiteUrl}
          onChange={e => update({ websiteUrl: e.target.value })}
          tooltip="The AI reads your site to understand how this brand writes — structure, tone, and vocabulary come from what's already live."
        />
        <Textarea
          label="Past content examples"
          placeholder="Paste a past campaign, LinkedIn post, blog excerpt, or any copy that already sounds like this brand…"
          rows={5}
          value={pastContentExamples}
          onChange={e => update({ pastContentExamples: e.target.value })}
          tooltip="The strongest training signal we have. Real examples teach the AI more than any guideline doc."
        />
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            Upload brand guidelines
            <span className="ml-1 text-gray-400 text-xs">(Optional · PDF or DOCX)</span>
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />
          {brandGuidelinesFile && (
            <p className="text-xs text-gray-400 mt-1">{brandGuidelinesFile.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button type="submit" variant="primary" className="w-full">
            Continue →
          </Button>
          <button type="button" onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 hover:underline text-center">
            Skip for now — I'll add context later
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
