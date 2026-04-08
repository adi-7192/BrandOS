import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../services/api';
import {
  buildConfirmedBrief,
  buildManualBriefFromBrand,
  isManualBriefReady,
} from '../../lib/generation-flow';

const SOURCE_COLORS = {
  inbox: 'bg-green-100 text-green-700 border-green-300',
  inferred: 'bg-amber-100 text-amber-700 border-amber-300',
  'user-provided': 'bg-purple-100 text-purple-700 border-purple-300',
};

function FieldBlock({ label, value, source, highlight, children }) {
  return (
    <div className={`rounded-lg border-2 p-4 ${highlight ? 'border-amber-400' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
          {source && (
            <span className={`ml-2 inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${SOURCE_COLORS[source] || SOURCE_COLORS['user-provided']}`}>
              {source === 'inbox' ? 'From inbox' : source === 'inferred' ? 'AI-inferred' : 'User-provided'}
            </span>
          )}
        </div>
      </div>
      {children || <p className="text-sm text-gray-800">{value}</p>}
      {highlight && (
        <p className="mt-2 text-xs text-amber-600">Quoted directly — used as anchor for both LinkedIn and blog formats</p>
      )}
    </div>
  );
}

export default function Brief() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const [brief, setBrief] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [contentGoal, setContentGoal] = useState('');
  const [toneShift, setToneShift] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const brandIdParam = new URLSearchParams(search).get('brandId');

  const seedFields = (nextBrief) => {
    setCampaignName(nextBrief?.campaignName || '');
    setCampaignType(nextBrief?.campaignType || '');
    setAudienceType(nextBrief?.audienceType || nextBrief?.audience || '');
    setContentGoal(nextBrief?.contentGoal || '');
    setToneShift(nextBrief?.toneShift || '');
    setKeyMessage(nextBrief?.keyMessage || '');
  };

  useEffect(() => {
    const loadBrief = async () => {
      try {
        if (state?.mode === 'manual' || brandIdParam) {
          const sourceBrand = state?.brand
            ? state.brand
            : (await api.get(`/brands/${brandIdParam}`)).data.brand;
          const nextBrief = buildManualBriefFromBrand(sourceBrand);
          setBrief(nextBrief);
          seedFields(nextBrief);
          return;
        }

        const cardIds = state?.cardIds || [];
        const res = await api.post('/generate/brief', { cardIds });
        setBrief(res.data.brief);
        seedFields(res.data.brief);
      } catch {
        setBrief(null);
      } finally {
        setLoading(false);
      }
    };

    loadBrief();
  }, [brandIdParam, state]);

  const nextBrief = brief ? buildConfirmedBrief(brief, {
    campaignName,
    campaignType,
    audienceType,
    contentGoal,
    toneShift,
    keyMessage,
  }) : null;

  const readyToContinue = nextBrief ? isManualBriefReady(nextBrief) : false;
  const isManualMode = nextBrief?.mode === 'manual';

  const handleContinue = () => {
    navigate('/generate/preview', {
      state: {
        brief: nextBrief,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span className="font-medium text-gray-900">Brief</span>
          <span>→</span>
          <span>Preview</span>
          <span>→</span>
          <span>Generate</span>
        </div>

        {/* Brand pill */}
        <div className="flex items-center gap-3 mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
            {brief?.brandName?.[0] || 'B'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{brief?.brandName || 'Brand'}</p>
            <p className="text-xs text-gray-400">{brief?.kit?.voiceAdjectives?.join(' · ')} · {brief?.language}</p>
          </div>
          <button className="text-xs text-gray-400 hover:underline">Change brand</button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading brief…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {isManualMode ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Brand memory is already loaded. Add only the campaign-specific details for this piece.
              </div>
            ) : brief?.lowConfidence ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                This brief is missing several fields. The more you fill in, the better the output.
              </div>
            ) : null}

            <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2">
              <ContextItem label="Language" value={brief?.language || 'English'} />
              <ContextItem label="Brand voice" value={brief?.kit?.voiceAdjectives?.join(' · ') || 'Pending'} />
              <ContextItem label="Guardrails" value={`${brief?.kit?.restrictedWords?.length || 0} restricted words`} />
              <ContextItem label="Content role" value={brief?.contentRole || brief?.kit?.contentRole || 'Standard campaign content'} />
              <ContextItem label="Proof style" value={brief?.proofStyle || brief?.kit?.proofStyle || 'Brand default'} />
              <ContextItem label="Publishing cadence" value={brief?.publishingFrequency || brief?.kit?.publishingFrequency || 'Not set'} />
            </div>

            <FieldBlock label="Campaign name" source={isManualMode ? 'user-provided' : 'inbox'}>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Summer workshop series"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
            </FieldBlock>

            <FieldBlock label="Campaign type" source={isManualMode ? 'user-provided' : 'inbox'}>
              <Dropdown
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                options={['Product launch', 'Brand awareness', 'Seasonal campaign', 'Event promotion', 'Thought leadership', 'Customer story', 'Other']}
              />
            </FieldBlock>

            <FieldBlock label="Audience" source={brief?.audience ? 'inbox' : 'user-provided'}>
              <Dropdown
                options={['B2B decision makers', 'Young professionals', 'General consumers', 'Parents and families', 'Custom']}
                value={audienceType}
                onChange={e => setAudienceType(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Preloaded from the brand kit. Adjust only if this campaign targets a different audience.</p>
            </FieldBlock>

            <FieldBlock label="Tone shift" source={brief?.toneShift ? 'inferred' : 'user-provided'}>
              <Dropdown
                value={toneShift}
                onChange={(e) => setToneShift(e.target.value)}
                options={['Keep baseline', 'More editorial', 'More direct', 'More aspirational', 'More restrained', 'More urgent', 'Custom']}
              />
            </FieldBlock>

            <FieldBlock label="Key message" source={brief?.keyMessage ? 'inbox' : 'user-provided'} highlight>
              <textarea
                rows={3}
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                placeholder="What should the audience understand, feel, or do after reading this piece?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:border-gray-900 focus:outline-none"
              />
            </FieldBlock>

            <FieldBlock label="Content goal" source="user-provided">
              <Dropdown
                label="Content goal"
                required
                value={contentGoal}
                onChange={e => setContentGoal(e.target.value)}
                options={['Lead generation', 'Brand visibility', 'Thought leadership', 'PR and press']}
              />
              <p className="text-xs text-gray-400 mt-1">Preloaded from the brand kit. Change it only if this campaign has a different objective.</p>
            </FieldBlock>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => navigate(isManualMode ? `/settings/brands/${brief.brandId}` : '/inbox')}
                className="text-sm text-gray-500 hover:underline"
              >
                {isManualMode ? '← Back to brand kit' : '← Back to inbox'}
              </button>
              <Button variant="primary" disabled={!readyToContinue} onClick={handleContinue} className="flex-1">
                Preview content →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContextItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-sm text-gray-700">{value}</p>
    </div>
  );
}
