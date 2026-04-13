import { Navigate, useNavigate } from 'react-router-dom';
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
  AUDIENCE_TYPE_OPTIONS,
  BUYER_SENIORITY_OPTIONS,
  AGE_RANGE_OPTIONS,
  INDUSTRY_TARGET_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  CONTENT_GOAL_OPTIONS,
  TONE_SHIFT_OPTIONS,
  CTA_STYLE_OPTIONS,
  EMOJI_USAGE_OPTIONS,
  PUBLISHING_FREQUENCY_OPTIONS,
  B2C_AUDIENCE_TYPES,
  YOUNG_AUDIENCE_TYPES,
  OLDER_AGE_RANGES,
  normalizeFunnelStages,
} from '../../lib/brand-kit-fields';

export default function S4bAudienceCampaign() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const [formalityEnabled, setFormalityEnabled] = useState(ob.voiceFormality !== null);
  const [formality, setFormality] = useState(ob.voiceFormality ?? 3);

  if (!ob.brandName.trim()) return <Navigate to="/onboarding/brand-name" replace />;
  if (ob.contentTypes.length === 0) return <Navigate to="/onboarding/content-types" replace />;

  const formalityLabel = ['Conversational', 'Leans conversational', 'Balanced', 'Leans formal', 'Formal'][formality - 1];
  const selectedFunnelStages = normalizeFunnelStages(ob.funnelStages);

  const isB2CAudience = B2C_AUDIENCE_TYPES.has(ob.audienceType);
  const showYoungAgeWarning = YOUNG_AUDIENCE_TYPES.has(ob.audienceType) && OLDER_AGE_RANGES.has(ob.ageRange);

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

  const handleAudienceTypeChange = (e) => {
    const next = e.target.value;
    const updates = {
      audienceType: next,
      audienceTypeOther: next !== "Custom — I'll describe my audience" ? '' : ob.audienceTypeOther,
    };
    if (B2C_AUDIENCE_TYPES.has(next)) updates.buyerSeniority = '';
    ob.update(updates);
  };

  const handleIndustryTargetChange = (e) => {
    const next = e.target.value;
    ob.update({ industryTarget: next, industryTargetOther: next !== "Other — I'll describe it" ? '' : ob.industryTargetOther });
  };

  const handleCampaignTypeChange = (e) => {
    const next = e.target.value;
    ob.update({ campaignType: next, campaignTypeOther: next !== 'Other' ? '' : ob.campaignTypeOther });
  };

  const handleToneShiftChange = (e) => {
    const next = e.target.value;
    ob.update({ toneShift: next, toneShiftOther: next !== 'Other' ? '' : ob.toneShiftOther });
  };

  const handleProofStyleChange = (e) => {
    const next = e.target.value;
    ob.update({ proofStyle: next, proofStyleOther: next !== 'Other' ? '' : ob.proofStyleOther });
  };

  const handleContentGoalChange = (e) => {
    const next = e.target.value;
    ob.update({ contentGoal: next, contentGoalOther: next !== 'Other' ? '' : ob.contentGoalOther });
  };

  const handleCtaStyleChange = (e) => {
    const next = e.target.value;
    ob.update({ ctaStyle: next, ctaStyleOther: next !== 'Other' ? '' : ob.ctaStyleOther });
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

            <Dropdown
              label="Audience type"
              value={ob.audienceType}
              onChange={handleAudienceTypeChange}
              tooltip="Who you're writing for changes word choice, depth, and assumed knowledge."
              options={AUDIENCE_TYPE_OPTIONS}
            />
            {ob.audienceType === "Custom — I'll describe my audience" && (
              <Input
                label="Describe your audience"
                placeholder="e.g. Independent fashion retailers aged 28–45 in the UK"
                value={ob.audienceTypeOther}
                onChange={(e) => ob.update({ audienceTypeOther: e.target.value })}
                tooltip="This description replaces the audience type label in every generation prompt."
              />
            )}

            {isB2CAudience ? (
              <p className="text-sm text-gray-400 italic px-1">
                Buyer seniority is not applicable for a B2C audience.
              </p>
            ) : (
              <Dropdown
                label="Buyer seniority"
                {...f('buyerSeniority')}
                tooltip="C-suite content is strategic and brief. Practitioner-level can go deep and technical."
                options={BUYER_SENIORITY_OPTIONS}
              />
            )}

            <div className="flex flex-col gap-1">
              <Dropdown
                label="Age range"
                {...f('ageRange')}
                options={AGE_RANGE_OPTIONS}
                tooltip="Sets the cultural references and vocabulary register for every piece of content."
              />
              {showYoungAgeWarning && (
                <p className="text-xs text-amber-600 px-1">
                  Young professionals are typically 18–34 — the selected age range may be inconsistent.
                </p>
              )}
            </div>

            <Input
              label="Your brand's industry"
              placeholder="e.g. Fashion, Fintech, SaaS"
              {...f('industrySector')}
              tooltip="Jargon natural in fintech can feel wrong in fashion."
            />

            <Dropdown
              label="Target audience's industry"
              value={ob.industryTarget}
              onChange={handleIndustryTargetChange}
              tooltip="The buyer's industry determines which pain points and pressures to reference."
              options={INDUSTRY_TARGET_OPTIONS}
            />
            {ob.industryTarget === "Other — I'll describe it" && (
              <Input
                label="Describe the target industry"
                placeholder="e.g. Independent art galleries and creative studios"
                value={ob.industryTargetOther}
                onChange={(e) => ob.update({ industryTargetOther: e.target.value })}
                tooltip="This replaces the industry label in generation prompts."
              />
            )}

            <Input
              label="Audience's primary challenge"
              placeholder="e.g. Scaling content output without losing brand quality"
              {...f('audiencePainPoint')}
              tooltip="One line: what keeps your audience up at night? Feeds into pain-point framing in every post."
            />

          </div>
        </section>

        {/* Campaign context */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Campaign context</h2>
          <div className="flex flex-col gap-4">

            <Dropdown
              label="Campaign type"
              value={ob.campaignType}
              onChange={handleCampaignTypeChange}
              tooltip="A product launch needs 'what' and 'why now'. Thought leadership needs a strong POV with no hard sell."
              options={CAMPAIGN_TYPE_OPTIONS}
            />
            {ob.campaignType === 'Other' && (
              <Input
                label="Describe the campaign type"
                placeholder="e.g. Partner activation series"
                value={ob.campaignTypeOther}
                onChange={(e) => ob.update({ campaignTypeOther: e.target.value })}
                tooltip="This description is passed directly to the AI to calibrate content structure."
              />
            )}

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

            <Dropdown
              label="Tone shift"
              value={ob.toneShift}
              onChange={handleToneShiftChange}
              tooltip="Layered on top of brand voice — does not replace it."
              options={TONE_SHIFT_OPTIONS}
            />
            {ob.toneShift === 'Other' && (
              <Input
                label="Describe the tone shift"
                placeholder="e.g. More provocative — challenge conventional thinking"
                value={ob.toneShiftOther}
                onChange={(e) => ob.update({ toneShiftOther: e.target.value })}
                tooltip="This modifier is applied on top of the brand's baseline voice for every generation."
              />
            )}

            <Dropdown
              label="Proof point style"
              value={ob.proofStyle}
              onChange={handleProofStyleChange}
              tooltip="Choose the kind of evidence that should make the content feel credible."
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

        {/* Content goal and cadence */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Content goal and cadence</h2>
          <div className="flex flex-col gap-4">

            <Dropdown
              label="What should this content achieve?"
              value={ob.contentGoal}
              onChange={handleContentGoalChange}
              tooltip="Changes the closing structure — lead gen ends with a clear next step, education ends with a question."
              options={CONTENT_GOAL_OPTIONS}
            />
            {ob.contentGoal === 'Other' && (
              <Input
                label="Describe the content goal"
                placeholder="e.g. Build trust with first-time buyers before a product push"
                value={ob.contentGoalOther}
                onChange={(e) => ob.update({ contentGoalOther: e.target.value })}
                tooltip="Passed directly to the AI to shape how each post ends and what action it drives."
              />
            )}

            <Dropdown
              label="Call-to-action style"
              value={ob.ctaStyle}
              onChange={handleCtaStyleChange}
              tooltip="Every post ends with an action. This sets the default — it can be overridden per campaign."
              options={CTA_STYLE_OPTIONS}
            />
            {ob.ctaStyle === 'Other' && (
              <Input
                label="Describe the CTA style"
                placeholder="e.g. Soft nudge — invite a reply, don't push a link"
                value={ob.ctaStyleOther}
                onChange={(e) => ob.update({ ctaStyleOther: e.target.value })}
                tooltip="This CTA instruction is injected into every generation for this brand."
              />
            )}

            <Dropdown
              label="Publishing frequency"
              required
              {...f('publishingFrequency')}
              tooltip="High-frequency teams need shorter punchier content. Low-frequency teams can go deeper per post."
              options={PUBLISHING_FREQUENCY_OPTIONS}
            />

            <Dropdown
              label="Emoji usage"
              {...f('emojiUsage')}
              tooltip="Brand policy for emojis — applied consistently across all generated content."
              options={EMOJI_USAGE_OPTIONS}
            />

            {/* Voice formality behind checkbox gate */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={formalityEnabled}
                  onChange={e => setFormalityEnabled(e.target.checked)}
                  className="rounded"
                />
                Set a custom formality level for this brand
              </label>
              {formalityEnabled && (
                <div className="mt-2 px-1">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={formality}
                    onChange={e => setFormality(Number(e.target.value))}
                    className="w-full"
                  />
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
          <button
            type="button"
            onClick={() => navigate('/onboarding/brand-content')}
            className="text-sm text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-text)] hover:underline"
          >
            ← Back
          </button>
          <Button type="submit" variant="primary" disabled={!canSubmit} className="flex-1">
            Generate brand kit →
          </Button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/onboarding/generating')}
          className="text-sm text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-text)] hover:underline text-center"
        >
          Skip for now
        </button>

      </form>
    </OnboardingShell>
  );
}
