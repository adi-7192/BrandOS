import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { buildOnboardingSavePayload } from '../../lib/onboarding-flow';
import {
  canApproveConfidenceReaction,
  buildConfidenceRegenerationPayload,
  buildConfidenceSamplePayload,
  canRegenerateConfidenceSample,
} from '../../lib/confidence-flow';
import { formatFunnelStages } from '../../lib/brand-kit-fields';

const REGENERATE_CHIPS = ['Tone too formal', 'Tone too casual', 'Wrong vocabulary', 'Too long', 'Too short', 'Weak opening', 'CTA missing'];

export default function S6ConfidenceTest() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const { refreshUser } = useAuth();
  const [generatedSample, setGeneratedSample] = useState('');
  const [sampleDraft, setSampleDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [reaction, setReaction] = useState(null); // 'positive' | 'mixed' | 'negative'
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedChips, setSelectedChips] = useState([]);
  const [freeText, setFreeText] = useState('');

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await api.post('/onboarding/confidence-sample', buildConfidenceSamplePayload(ob));
        setGeneratedSample(res.data.samplePost);
        setSampleDraft(res.data.samplePost);
      } catch {
        const fallback = 'Sample post generation failed. Please try editing the kit directly.';
        setGeneratedSample(fallback);
        setSampleDraft(fallback);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, []);

  const handleRegenerate = async () => {
    if (!canRegenerateConfidenceSample({ selectedChips, freeText, regenerateCount, regenerating })) {
      return;
    }

    setSaveError('');
    setRegenerating(true);

    try {
      const res = await api.post(
        '/onboarding/confidence-sample',
        buildConfidenceRegenerationPayload(ob, {
          currentSample: sampleDraft,
          selectedChips,
          freeText,
        })
      );
      setGeneratedSample(res.data.samplePost);
      setSampleDraft(res.data.samplePost);
      setRegenerateCount((count) => count + 1);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to regenerate the sample. Please try editing the kit directly.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleApprove = async () => {
    setSaveError('');
    setSaving(true);
    try {
      await api.post('/onboarding/save-kit', buildOnboardingSavePayload(ob));
      await refreshUser();
      navigate('/onboarding/kit-live');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const approveEnabled = canApproveConfidenceReaction({
    reaction,
    regenerateCount,
    originalSample: generatedSample,
    currentSample: sampleDraft,
  });
  const regenerateEnabled = canRegenerateConfidenceSample({ selectedChips, freeText, regenerateCount, regenerating });

  return (
    <OnboardingShell phase="Phase 2 · build brand kit">
      <KitProgressBar activeStep={5} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Confidence test</h1>
      <p className="text-sm text-gray-500 mb-6">Here's a sample post generated from your kit. How does it sound?</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e7ebf3] border-t-[var(--brand-primary)]" />
        </div>
      ) : (
        <>
          {/* Sample post */}
          <div className="rounded-[20px] border border-[#e7ebf3] shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 mb-4">
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-400">
              <span className="chip chip-purple">{ob.brandName}</span>
              <span>LinkedIn</span>
              {ob.campaignType && <span>· {ob.campaignType}</span>}
              {ob.funnelStages?.length > 0 && <span>· {formatFunnelStages(ob.funnelStages, ', ')}</span>}
              <span>· 0 restricted words</span>
            </div>
            <textarea
              rows={8}
              value={sampleDraft}
              onChange={(e) => setSampleDraft(e.target.value)}
              className="w-full rounded-lg border border-[#e7ebf3] px-3 py-2 text-sm text-gray-800 resize-y focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-soft)]"
            />
            <p className="mt-2 text-xs text-gray-400">You can edit this sample directly before asking AI to refine it again.</p>
          </div>

          {/* Reactions */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { key: 'positive', label: 'This sounds right' },
              { key: 'mixed', label: 'Almost there' },
              { key: 'negative', label: "Doesn't sound like us" },
            ].map(r => (
              <button
                key={r.key}
                onClick={() => setReaction(r.key)}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors text-center ${
                  reaction === r.key
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
                    : 'border-[#e7ebf3] bg-white text-gray-700 hover:border-[var(--brand-primary)]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* State A */}
          {reaction === 'positive' && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4 text-sm text-green-800">
              The kit looks well-calibrated for this brand. You can still edit any card before going live.
            </div>
          )}

          {/* State B — Mixed */}
          {reaction === 'mixed' && (
            <div className="rounded-xl border border-gray-200 p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">What's off?</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {REGENERATE_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChips(c => c.includes(chip) ? c.filter(x => x !== chip) : [...c, chip])}
                    className={`text-xs rounded-full border px-3 py-1 ${selectedChips.includes(chip) ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[#e7ebf3] text-[var(--brand-text-muted)]'}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea rows={2} value={freeText} onChange={e => setFreeText(e.target.value)}
                placeholder="Describe what's off…"
                className="w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-sm resize-none focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]"
              />
              <Button variant="secondary" className="mt-3 text-sm" disabled={!regenerateEnabled}
                onClick={handleRegenerate}>
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </Button>
              <p className="mt-2 text-xs text-gray-400">Each regeneration uses your latest edited draft plus the feedback you selected here.</p>
            </div>
          )}

          {/* State C — Negative */}
          {reaction === 'negative' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-4">
              <p className="text-sm font-medium text-amber-800 mb-2">Recommended action</p>
              <p className="text-sm text-amber-700 mb-3">If the output feels completely wrong, going back to the kit gives the best result. The kit drives every future generation.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <Button variant="secondary" onClick={() => navigate('/onboarding/review-kit')} className="flex-1">
              ← Back to kit
            </Button>
            <Button
              variant="primary"
              disabled={!approveEnabled || saving}
              onClick={handleApprove}
              className="flex-1"
            >
              {saving ? 'Finalising setup…' : 'Approve and continue →'}
            </Button>
          </div>
          {saveError && <p className="mt-3 text-sm text-red-500">{saveError}</p>}
        </>
      )}
    </OnboardingShell>
  );
}
