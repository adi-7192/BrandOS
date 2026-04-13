import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

export default function S4aBrandContent() {
  const navigate = useNavigate();
  const {
    brandName,
    websiteUrl,
    websiteUrls,
    pastContentExamples,
    brandGuidelinesFile,
    contentTypes,
    update,
  } = useOnboarding();

  if (!brandName.trim()) return <Navigate to="/onboarding/brand-name" replace />;
  if (contentTypes.length === 0) return <Navigate to="/onboarding/content-types" replace />;

  const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB — matches server Multer limit
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (file && file.size > MAX_FILE_BYTES) {
      setFileError('File exceeds the 8 MB limit. Please upload a smaller PDF or DOCX.');
      e.target.value = '';
      return;
    }
    setFileError('');
    update({ brandGuidelinesFile: file });
  };
  const seedUrls = [websiteUrl, ...(websiteUrls || [])];

  const handleWebsiteUrlChange = (index, value) => {
    if (index === 0) {
      update({ websiteUrl: value });
      return;
    }

    const next = [...(websiteUrls || [])];
    next[index - 1] = value;
    update({ websiteUrls: next });
  };

  const addWebsiteUrl = () => update({ websiteUrls: [...(websiteUrls || []), ''] });
  const removeWebsiteUrl = (index) => {
    if (index === 0) {
      update({ websiteUrl: '' });
      return;
    }

    const next = [...(websiteUrls || [])];
    next.splice(index - 1, 1);
    update({ websiteUrls: next });
  };

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
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            Website URL
            <span className="ml-1 text-gray-400 text-xs">(Start with one. Add more only if you want to guide the crawl.)</span>
          </label>
          {seedUrls.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="url"
                placeholder={index === 0 ? 'https://brand.com' : 'https://brand.com/about'}
                value={value}
                onChange={e => handleWebsiteUrlChange(index, e.target.value)}
                tooltip={index === 0
                  ? 'BrandOS will scan relevant pages automatically from this URL to understand products, positioning, and brand language.'
                  : 'Optional extra URL. Use this only if there is a specific section you want BrandOS to prioritize.'}
              />
              {seedUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWebsiteUrl(index)}
                  className="shrink-0 rounded-lg border border-[var(--brand-border)] px-3 py-2 text-sm text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-text)]"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addWebsiteUrl}
            className="w-fit text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
          >
            + Add another URL
          </button>
        </div>
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
          {fileError && (
            <p className="mt-1 text-xs text-red-600">{fileError}</p>
          )}
          {!fileError && brandGuidelinesFile && (
            <p className="mt-1 text-xs text-gray-400">{brandGuidelinesFile.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button type="submit" variant="primary" className="w-full">
            Continue →
          </Button>
          <button type="button" onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600 hover:underline text-center">
            Skip for now
          </button>
          <button type="button" onClick={() => navigate('/onboarding/content-types')} className="text-sm text-gray-400 hover:text-gray-600 text-center mt-2">
            ← Back
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
