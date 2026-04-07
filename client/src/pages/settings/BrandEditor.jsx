import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function BrandEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/brands/${id}`)
      .then(res => setBrand(res.data.brand))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 text-sm">Loading…</div>;
  if (!brand) return <div className="flex h-screen items-center justify-center text-gray-400 text-sm">Brand not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/settings/brands')} className="text-sm text-gray-500 hover:underline mb-6 block">← All brands</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{brand.name}</h1>

        <div className="flex flex-col gap-4">
          {/* Voice adjectives */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900 mb-1">Brand voice</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {brand.kit?.voiceAdjectives?.map(adj => (
                <span key={adj} className="chip chip-purple">{adj}</span>
              ))}
            </div>
          </div>

          {/* Restricted words */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900 mb-1">Restricted words</p>
            <p className="text-xs text-gray-400 mb-3">Hard guardrails — never used in any generation.</p>
            <div className="flex flex-wrap gap-2">
              {brand.kit?.restrictedWords?.map(w => (
                <span key={w} className="chip chip-red">🔒 {w}</span>
              ))}
            </div>
          </div>

          {/* Vocabulary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="font-semibold text-gray-900 mb-1">Vocabulary to use</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {brand.kit?.vocabulary?.map(w => (
                <span key={w} className="chip chip-green">{w}</span>
              ))}
            </div>
          </div>

          <Button variant="secondary" onClick={() => navigate('/inbox')} className="w-full">
            Generate content for {brand.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
