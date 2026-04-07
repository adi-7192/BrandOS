import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Dropdown from '../../components/ui/Dropdown';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function S4bAudienceCampaign() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const [formalityEnabled, setFormalityEnabled] = useState(ob.voiceFormality !== null);
  const [formality, setFormality] = useState(ob.voiceFormality ?? 3);

  const formalityLabel = ['Conversational', 'Leans conversational', 'Balanced', 'Leans formal', 'Formal'][formality - 1];

  const canSubmit = ob.publishingFrequency !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    ob.update({ voiceFormality: formalityEnabled ? formality : null });
    navigate('/onboarding/generating');
  };

  const f = (key) => ({ value: ob[key], onChange: (e) => ob.update({ [key]: e.target.value }) });

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
            <Dropdown label="Funnel stage" {...f('funnelStage')} tooltip="The single biggest lever for B2B content effectiveness."
              options={['Top of funnel — awareness (reaching new audiences)', 'Mid funnel — consideration (nurturing interest)', 'Bottom of funnel — decision (driving a specific action)']} />
            <Dropdown label="Tone shift" {...f('toneShift')} tooltip="Layered on top of brand voice — does not replace it."
              options={['More urgent', 'More celebratory', 'More intimate', 'More authoritative', 'More playful', 'Keep baseline — no shift']} />
            <Dropdown label="Proof point style" {...f('proofStyle')} tooltip="B2B buyers trust differently. Mixing styles without intention reads as unfocused."
              options={['Data-led — statistics and research', 'Case study-led — client stories and results', 'Opinion-led — strong point of view', 'Mixed — combination of all three']} />

            {/* Content role with inline info box */}
            <div>
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 mb-2 text-xs text-purple-800">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Language permission level — standalone organic never pitches. Sales enablement can be direct about outcomes.</li>
                  <li>Social proof usage — ABM references specific industry pain points. Organic stays broad.</li>
                  <li>Closing structure — organic ends with a thought or question. Sales enablement ends with a clear action.</li>
                </ul>
              </div>
              <Dropdown label="Content role in the sales cycle" {...f('contentRole')}
                options={['Standalone / organic reach', 'Sales enablement', 'Account-based (ABM)', 'Partner / co-marketing']} />
            </div>
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
          <button type="button" onClick={() => navigate('/onboarding/brand-content')} className="text-sm text-gray-500 hover:underline">
            ← Back
          </button>
          <Button type="submit" variant="primary" disabled={!canSubmit} className="flex-1">
            Generate brand kit →
          </Button>
        </div>
        <button type="button" onClick={() => navigate('/onboarding/generating')} className="text-sm text-gray-400 hover:text-gray-600 hover:underline text-center">
          Skip for now
        </button>
      </form>
    </OnboardingShell>
  );
}
