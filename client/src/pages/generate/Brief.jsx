import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../services/api';

const SOURCE_COLORS = {
  inbox: 'bg-green-100 text-green-700 border-green-300',
  inferred: 'bg-amber-100 text-amber-700 border-amber-300',
  'user-provided': 'bg-purple-100 text-purple-700 border-purple-300',
};

function FieldBlock({ label, value, source, highlight, children }) {
  const [editing, setEditing] = useState(false);
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
        <button onClick={() => setEditing(e => !e)} className="text-xs text-gray-400 hover:underline">Edit</button>
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
  const { state } = useLocation();
  const [brief, setBrief] = useState(null);
  const [audienceType, setAudienceType] = useState('');
  const [contentGoal, setContentGoal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cardIds = state?.cardIds || [];
    api.post('/generate/brief', { cardIds })
      .then(res => setBrief(res.data.brief))
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    navigate('/generate/preview', { state: { brief: { ...brief, audienceType, contentGoal } } });
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
            <p className="text-xs text-gray-400">{brief?.voiceAdjectives?.join(' · ')} · {brief?.language}</p>
          </div>
          <button className="text-xs text-gray-400 hover:underline">Change brand</button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading brief…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {brief?.lowConfidence && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                This brief is missing several fields. The more you fill in, the better the output.
              </div>
            )}

            <FieldBlock label="Campaign name" value={brief?.campaignName} source="inbox" />
            <FieldBlock label="Campaign type" value={brief?.campaignType} source="inbox" />
            <FieldBlock label="Audience" value={brief?.audience} source="inbox" />

            <FieldBlock label="Audience type" source="user-provided">
              <Dropdown
                options={['B2B decision makers', 'Young professionals', 'General consumers', 'Parents and families', 'Custom']}
                value={audienceType}
                onChange={e => setAudienceType(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Narrows framing and tone for this campaign — overrides the brand kit default if needed.</p>
            </FieldBlock>

            <FieldBlock label="Tone shift" value={brief?.toneShift} source="inbox" />
            <FieldBlock label="Key message" value={brief?.keyMessage} source="inbox" highlight />

            {/* Missing fields */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Needs your input</p>
              <div className="flex flex-col gap-3">
                <Dropdown label="Content goal" required
                  value={contentGoal}
                  onChange={e => setContentGoal(e.target.value)}
                  options={['Lead generation', 'Brand visibility', 'Thought leadership', 'PR and press']} />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => navigate('/inbox')} className="text-sm text-gray-500 hover:underline">← Back to inbox</button>
              <Button variant="primary" disabled={!contentGoal} onClick={handleContinue} className="flex-1">
                Preview content →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
