import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import api from '../../services/api';
import Button from '../../components/ui/Button';

const FIELD_CHIPS = ['Campaign', 'Tone', 'Audience', 'Key message', 'Goal', 'CTA'];

function InboxCard({ card, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(card.id)}
      className={`flex gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
    >
      <div className="pt-0.5">
        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
          {selected && <span className="text-white text-xs">✓</span>}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip chip-purple text-xs">{card.brandName}</span>
        </div>
        <p className="font-medium text-sm text-gray-900 truncate">{card.emailSubject}</p>
        <p className="text-xs text-gray-400 mt-0.5">{card.emailFrom} · {new Date(card.createdAt).toLocaleDateString()}</p>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{card.excerpt}</p>

        {/* Field chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {FIELD_CHIPS.map(field => {
            const matched = card.matchedFields?.includes(field.toLowerCase().replace(' ', '_'));
            return (
              <span key={field} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${matched ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                {field}
              </span>
            );
          })}
        </div>

        <button className="mt-3 text-xs text-gray-400 hover:text-gray-600 hover:underline">
          ↻ Refresh from inbox
        </button>
      </div>
    </div>
  );
}

export default function Inbox() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/inbox?status=${activeTab}`)
      .then(res => setCards(res.data.cards))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const toggleCard = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === cards.length ? [] : cards.map(c => c.id));

  const selectedCards = cards.filter(c => selected.includes(c.id));

  const handleUseBrief = () => navigate('/generate/brief', { state: { cardIds: selected } });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />
      <div className="max-w-3xl mx-auto w-full px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Brand updates inbox</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['pending', 'used', 'dismissed'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Select all bar */}
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <div onClick={toggleAll} className={`h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer ${selected.length === cards.length && cards.length > 0 ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
              {selected.length === cards.length && cards.length > 0 && <span className="text-white text-xs">✓</span>}
            </div>
            Select all
          </label>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:underline">Clear selection</button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading inbox…</div>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No {activeTab} items. Tag a Gmail email with <code className="bg-gray-100 px-1 rounded">BrandOS — [Brand Name]</code> to get started.</div>
        ) : (
          <div className="flex flex-col gap-3 pb-28">
            {cards.map(card => (
              <InboxCard key={card.id} card={card} selected={selected.includes(card.id)} onToggle={toggleCard} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {selected.length === 0
              ? 'Select emails above to use as your brief'
              : selected.length === 1
              ? `${selectedCards[0]?.brandName} · 1 email selected`
              : `${selected.length} emails selected · fields will be merged into one brief`}
          </p>
          <Button variant="primary" disabled={selected.length === 0} onClick={handleUseBrief}>
            {selected.length > 1 ? 'Merge and use brief →' : 'Use this brief →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
