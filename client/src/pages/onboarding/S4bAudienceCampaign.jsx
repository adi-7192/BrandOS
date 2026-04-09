import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Dropdown from '../../components/ui/Dropdown';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  FUNNEL_STAGE_OPTIONS,
  PROOF_STYLE_OPTIONS,
  normalizeFunnelStages,
} from '../../lib/brand-kit-fields';

export default function S4bAudienceCampaign() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const [formalityEnabled, setFormalityEnabled] = useState(ob.voiceFormality !== null);
  const [formality, setFormality] = useState(ob.voiceFormality ?? 3);

  const formalityLabel = ['Conversational', 'Leans conversational', 'Balanced', 'Leans formal', 'Formal'][formality - 1];
  const selectedFunnelStages = normalizeFunnelStages(ob.funnelStages);

  const canSubmit = ob.publishingFrequency !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    ob.update({ voiceFormality: formalityEnabled ? formality : null });
    navigate('/onboarding/generating');
  };

  const f = (key) => ({ value: ob[key], onChange: (e) => ob.update({ [key]: e.target.value }) });
  const toggleFunnelStage = (option) => {
    const nextStages = selectedFunnelStages.includes(option)
      ? selectedFunnelStages.filter((entry) => entry !== option)
      : [...selectedFunnelStages, option];

    ob.update({ funnelStages: nextStages });
  };

  const handleProofStyleChange = (event) => {
    const nextValue = event.target.value;
    ob.update({
      proofStyle: nextValue,
      proofStyleOther: nextValue === 'Other' ? ob.proofStyleOther : '',
    });
  };

  return (
    <OnboardingShell phase="Phase 2 · build brand kit">
      <KitProgressBar activeStep={2} />

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Audience, campaign context, and goal</h1>
      <p className="text-sm text-gray-500 mb-8">These parameters calibrate every generation for this brand.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Brand audience */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Brand audience</h2>
          <div className="flex flex-col gap-4">
            <Dropdown label="Audience type" {...f('audienceType')} tooltip="Who you're writing for changes word choice, depth, and assumed knowledge."
              options={['B2B decision makers', 'Young professionals', 'General consumers', 'Parents and families', 'Custom — I\'ll describe my audience']} />
            <Dropdown label="Buyer seniority" {...f('buyerSeniority')} tooltip="C-suite content is strategic and brief. Practitioner-level can go deep and technical."
              options={['C-suite (CEO, CFO, CMO)', 'Director', 'VP', 'Manager', 'Practitioner', 'Individual contributor', 'Mixed — multiple levels']} />
            <Dropdown label="Age range" {...f('ageRange')}
              options={['18–24', '25–34', '35–44', '45–54', '55+', 'All ages']} />
            <Input label="Industry or sector" placeholder="e.g. Fashion, Retail" {...f('industrySector')} tooltip="Jargon natural in fintech can feel wrong in fashion." />
            <Dropdown label="Which industry are you targeting?" {...f('industryTarget')} tooltip="The buyer's industry determines which pain points and pressures to reference."
              options={['Retail and e-commerce', 'Financial services', 'Technology and SaaS', 'Healthcare and pharma', 'Manufacturing and logistics', 'Media and entertainment', 'Professional services', 'Education', 'Public sector', 'NGO', 'Hospitality and travel', 'Other — I\'ll describe it']} />
          </div>
        </section>

        {/* Campaign context */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Campaign context</h2>
          <div className="flex flex-col gap-4">
            <Dropdown label="Campaign type" {...f('campaignType')} tooltip="A product launch needs 'what' and 'why now'. Thought leadership needs a strong POV with no hard sell."
              options={['Product launch', 'Brand awareness', 'Seasonal', 'Thought leadership', 'PR and press', 'Community']} />
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Funnel stages
                <span className="group relative ml-1 cursor-help text-gray-400 hover:text-gray-600">
                  ?
                  <span className="absolute left-0 top-6 z-10 hidden w-64 rounded-md bg-slate-950 p-2 text-xs text-white group-hover:block">
                    Pick every stage this brand usually writes for. Multi-select helps BrandOS avoid forcing one campaign shape onto every generation.
                  </span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FUNNEL_STAGE_OPTIONS.map((option) => {
                  const active = selectedFunnelStages.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleFunnelStage(option)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
                          : 'border-[#e7ebf3] bg-white text-[var(--brand-text)] hover:border-[var(--brand-primary)]'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <Dropdown label="Tone shift" {...f('toneShift')} tooltip="Layered on top of brand voice — does not replace it."
              options={['More urgent', 'More celebratory', 'More intimate', 'More authoritative', 'More playful', 'Keep baseline — no shift']} />
            <Dropdown
              label="Proof point style"
              value={ob.proofStyle}
              onChange={handleProofStyleChange}
              tooltip="Choose the kind of evidence that should make the content feel credible. Use Other when your team has a specific proof pattern."
              options={PROOF_STYLE_OPTIONS}
            />
            {ob.proofStyle === 'Other' && (
              <Input
                label="Describe your proof point style"
                placeholder="e.g. Founder quote first, then one concrete stat"
                value={ob.proofStyleOther}
                onChange={(e) => ob.update({ proofStyleOther: e.target.value })}
                tooltip="This custom proof style will be stored and fed into generation prompts exactly as you write it."
              />
            )}
          </div>
        </section>

        {/* Content goal & cadence */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Content goal & cadence</h2>
          <div className="flex flex-col gap-4">
            <Dropdown label="What should this content achieve?" {...f('contentGoal')} tooltip="Changes the closing structure — lead gen ends with a clear next step, thought leadership ends with a question."
              options={['Lead generation', 'Brand visibility', 'Thought leadership', 'PR and press']} />
            <Dropdown label="Publishing frequency" required {...f('publishingFrequency')} tooltip="High-frequency teams need shorter punchier content. Low-frequency teams can go deeper per post."
              options={['Daily', '2–3 times per week', 'Weekly', 'Bi-weekly', 'Monthly or less']} />

            {/* Voice formality behind checkbox gate */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
                <input type="checkbox" checked={formalityEnabled} onChange={e => setFormalityEnabled(e.target.checked)} className="rounded" />
                Set a custom formality level for this brand
              </label>
              {formalityEnabled && (
                <div className="mt-2 px-1">
                  <input type="range" min={1} max={5} value={formality} onChange={e => setFormality(Number(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Conversational</span>
                    <span className="font-medium text-gray-700">{formalityLabel}</span>
                    <span>Formal</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 mt-2">
          <button type="button" onClick={() => navigate('/onboarding/brand-content')} className="text-sm text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-text)] hover:underline">
            ← Back
          </button>
          <Button type="submit" variant="primary" disabled={!canSubmit} className="flex-1">
            Generate brand kit →
          </Button>
        </div>
        <button type="button" onClick={() => navigate('/onboarding/generating')} className="text-sm text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-text)] hover:underline text-center">
          Skip for now
        </button>
      </form>
    </OnboardingShell>
  );
}
