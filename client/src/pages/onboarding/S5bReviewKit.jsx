import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import KitProgressBar from '../../components/layout/KitProgressBar';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import {
  normalizeKitCards,
  updateKitCardArrayField,
  updateKitCardChannelRule,
} from '../../lib/kit-review';
import { buildGuidelineDisplay } from '../../lib/guideline-view';

function KitCard({ title, badge, children, onApprove, approved, reviewed, onOpen }) {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(o => !o);
    if (!reviewed) onOpen?.();
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-colors ${approved ? 'border-teal-500' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${approved ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
            {approved ? 'Approved ✓' : badge}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {children}
          <div className="mt-3 flex gap-2">
            <button className="text-sm text-gray-500 hover:underline">Edit</button>
            <Button variant="teal" className="text-xs px-3 py-1" onClick={onApprove}>
              {approved ? 'Approved ✓' : 'Approve'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function S5bReviewKit() {
  const navigate = useNavigate();
  const {
    kitCards,
    brandName,
    s4aSkipped,
    campaignCoreWhy,
    guidelineFileName,
    update,
  } = useOnboarding();
  const [approved, setApproved] = useState({ voice: false, vocab: false, restricted: false, channel: false });
  const [reviewed, setReviewed] = useState({ voice: false, vocab: false, restricted: false, channel: false });
  const [addCoreWhy, setAddCoreWhy] = useState(Boolean(campaignCoreWhy));
  const [coreWhy, setCoreWhy] = useState(campaignCoreWhy || '');

  const defaultCards = {
    voiceAdjectives: ['Authentic', 'Confident', 'Approachable'],
    vocabulary: ['innovation', 'community', 'experience', 'craft', 'quality'],
    restrictedWords: ['cheap', 'free', 'guarantee', 'best'],
    channelRules: {
      linkedin: 'Max 220 words · Hook in line 1 · Max 3 hashtags · No em dashes',
      blog: '700–900 words · Subheadings required · End with a question or call to action',
    },
  };

  const cards = useMemo(
    () => normalizeKitCards(kitCards || defaultCards),
    [kitCards]
  );
  const guidelineDisplay = useMemo(
    () => buildGuidelineDisplay({ guidelineFileName }),
    [guidelineFileName]
  );
  const lowConfidence = s4aSkipped;

  const approve = (key) => setApproved(a => ({ ...a, [key]: true }));
  const markReviewed = (key) => setReviewed(r => ({ ...r, [key]: true }));
  const syncKitCards = (nextKitCards) => update({ kitCards: nextKitCards });

  const allReviewed = Object.values(reviewed).every(Boolean);

  return (
    <OnboardingShell phase="Phase 2 · build brand kit">
      <KitProgressBar activeStep={4} />

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Review {brandName ? `${brandName}'s` : 'your'} kit
      </h1>
      <p className="text-sm text-gray-500 mb-6">The AI drafted these from your seed content. You're the reviewer — approve, edit, or skip each card.</p>

      {lowConfidence && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
          Low confidence — more input recommended. Add website or past content examples for a more accurate kit.
        </div>
      )}

      {guidelineFileName && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <p className="font-medium">{guidelineDisplay.title}</p>
          <p className="mt-1 text-blue-800/80">{guidelineDisplay.meta}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-5">
        <KitCard title="Brand voice" badge="AI drafted" approved={approved.voice} reviewed={reviewed.voice}
          onOpen={() => markReviewed('voice')} onApprove={() => approve('voice')}>
          <p className="text-xs text-gray-400 mb-2">Used to calibrate every generation for this brand.</p>
          <div className="flex flex-wrap gap-2">
            {cards.voiceAdjectives?.map(adj => (
              <span key={adj} className="chip chip-purple">{adj}</span>
            ))}
          </div>
          <div className="mt-3">
            <Textarea
              label="Edit adjectives"
              rows={2}
              value={cards.voiceAdjectives.join(', ')}
              onChange={(e) => syncKitCards(updateKitCardArrayField(cards, 'voiceAdjectives', e.target.value))}
              placeholder="Comma separated adjectives"
            />
          </div>
        </KitCard>

        <KitCard title="Vocabulary to use" badge="AI drafted" approved={approved.vocab} reviewed={reviewed.vocab}
          onOpen={() => markReviewed('vocab')} onApprove={() => approve('vocab')}>
          <div className="flex flex-wrap gap-2">
            {cards.vocabulary?.map(w => (
              <span key={w} className="chip chip-green">{w}</span>
            ))}
          </div>
          <div className="mt-3">
            <Textarea
              label="Edit vocabulary"
              rows={2}
              value={cards.vocabulary.join(', ')}
              onChange={(e) => syncKitCards(updateKitCardArrayField(cards, 'vocabulary', e.target.value))}
              placeholder="Comma separated words or phrases"
            />
          </div>
        </KitCard>

        <KitCard title="Restricted words" badge="AI drafted + yours" approved={approved.restricted} reviewed={reviewed.restricted}
          onOpen={() => markReviewed('restricted')} onApprove={() => approve('restricted')}>
          <p className="text-xs text-gray-500 mb-2">Hard guardrails — the AI will never use these words regardless of campaign or tone shift.</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {cards.restrictedWords?.map(w => (
              <span key={w} className="chip chip-red">🔒 {w}</span>
            ))}
          </div>
          <div className="mt-3">
            <Textarea
              label="Edit restricted words"
              rows={2}
              value={cards.restrictedWords.join(', ')}
              onChange={(e) => syncKitCards(updateKitCardArrayField(cards, 'restrictedWords', e.target.value))}
              placeholder="Comma separated blocked words"
            />
          </div>
        </KitCard>

        <KitCard title="Channel rules" badge="AI drafted" approved={approved.channel} reviewed={reviewed.channel}
          onOpen={() => markReviewed('channel')} onApprove={() => approve('channel')}>
          <div className="space-y-2 text-sm text-gray-700">
            <div><span className="font-medium">LinkedIn:</span> {cards.channelRules?.linkedin}</div>
            <div><span className="font-medium">Blog:</span> {cards.channelRules?.blog}</div>
          </div>
          <div className="mt-3 space-y-3">
            <Textarea
              label="LinkedIn rule"
              rows={2}
              value={cards.channelRules?.linkedin}
              onChange={(e) => syncKitCards(updateKitCardChannelRule(cards, 'linkedin', e.target.value))}
            />
            <Textarea
              label="Blog rule"
              rows={2}
              value={cards.channelRules?.blog}
              onChange={(e) => syncKitCards(updateKitCardChannelRule(cards, 'blog', e.target.value))}
            />
          </div>
        </KitCard>
      </div>

      {/* Campaign core why toggle */}
      <div className={`rounded-xl border-2 border-dashed p-4 mb-5 ${addCoreWhy ? 'border-gray-400' : 'border-gray-200'}`}>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            checked={addCoreWhy}
            onChange={e => {
              setAddCoreWhy(e.target.checked);
              if (!e.target.checked) {
                setCoreWhy('');
                update({ campaignCoreWhy: '' });
              }
            }}
            className="rounded"
          />
          Add campaign core why
          <span className="ml-1 text-xs text-gray-400">Optional</span>
        </label>
        {addCoreWhy && (
          <div className="mt-3">
            <textarea
              rows={2}
              value={coreWhy}
              onChange={e => {
                setCoreWhy(e.target.value);
                update({ campaignCoreWhy: e.target.value });
              }}
              placeholder="e.g. This is not a sale — it's a cultural moment."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-900 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Used as the anchor line for this campaign's content across both formats.</p>
          </div>
        )}
      </div>

      <Button
        variant="primary"
        className="w-full"
        disabled={!allReviewed}
        onClick={() => navigate('/onboarding/confidence-test')}
      >
        Run confidence test →
      </Button>
      {!allReviewed && (
        <p className="text-xs text-center text-gray-400 mt-2">Open each card to review before continuing.</p>
      )}
    </OnboardingShell>
  );
}
