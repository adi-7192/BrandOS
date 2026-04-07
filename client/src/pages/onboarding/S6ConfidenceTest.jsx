import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { buildOnboardingSavePayload } from '../../lib/onboarding-flow';

const REGENERATE_CHIPS = ['Tone too formal', 'Tone too casual', 'Wrong vocabulary', 'Too long', 'Too short', 'Weak opening', 'CTA missing'];

export default function S6ConfidenceTest() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const { refreshUser } = useAuth();
  const [samplePost, setSamplePost] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [reaction, setReaction] = useState(null); // 'positive' | 'mixed' | 'negative'
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [selectedChips, setSelectedChips] = useState([]);
  const [freeText, setFreeText] = useState('');

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await api.post('/onboarding/confidence-sample', {
          brandName: ob.brandName,
          kitCards: ob.kitCards,
          campaignType: ob.campaignType,
          funnelStage: ob.funnelStage,
          toneShift: ob.toneShift,
          brandLanguage: ob.brandLanguage,
        });
        setSamplePost(res.data.samplePost);
      } catch {
        setSamplePost('Sample post generation failed. Please try editing the kit directly.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, []);

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

  const approveEnabled = reaction === 'positive' || (reaction === 'mixed' && regenerateCount > 0);

  return (
    <OnboardingShell phase="Phase 2 · build brand kit">
      <KitProgressBar activeStep={5} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Confidence test</h1>
      <p className="text-sm text-gray-500 mb-6">Here's a sample post generated from your kit. How does it sound?</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      ) : (
        <>
          {/* Sample post */}
          <div className="rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-400">
              <span className="chip chip-purple">{ob.brandName}</span>
              <span>LinkedIn</span>
              {ob.campaignType && <span>· {ob.campaignType}</span>}
              {ob.funnelStage && <span>· {ob.funnelStage.split(' — ')[0]}</span>}
              <span>· 0 restricted words</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{samplePost}</p>
          </div>

          {/* Reactions */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { key: 'positive', label: 'This sounds right' },
              { key: 'mixed', label: 'Close but not quite' },
              { key: 'negative', label: "Doesn't sound like us" },
            ].map(r => (
              <button
                key={r.key}
                onClick={() => setReaction(r.key)}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors text-center ${
                  reaction === r.key
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
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
                    className={`text-xs rounded-full border px-3 py-1 ${selectedChips.includes(chip) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600'}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea rows={2} value={freeText} onChange={e => setFreeText(e.target.value)}
                placeholder="Describe what's off…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-gray-900"
              />
              <Button variant="secondary" className="mt-3 text-sm" disabled={regenerateCount >= 1}
                onClick={() => { setRegenerateCount(c => c + 1); }}>
                {regenerateCount >= 1 ? 'Regenerated once' : 'Regenerate'}
              </Button>
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
