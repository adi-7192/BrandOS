import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';
import TopNav from '../../components/layout/TopNav';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brands, fetchBrands } = useBrand();

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.firstName}.</h1>
          <p className="text-sm text-gray-500 mt-1">{brands.length} brand kit{brands.length !== 1 ? 's' : ''} live · ready to generate</p>
        </div>

        {/* Brand kits grid */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Brand kits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {brands.map(brand => (
              <div key={brand.id} onClick={() => navigate(`/settings/brands/${brand.id}`)}
                className="rounded-xl border border-gray-200 bg-white p-5 cursor-pointer hover:border-gray-400 transition-colors">
                <p className="font-semibold text-gray-900 mb-1">{brand.name}</p>
                <p className="text-xs text-gray-400 mb-3">Updated {new Date(brand.updatedAt).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-1">
                  {brand.kit?.voiceAdjectives?.map(adj => (
                    <span key={adj} className="chip chip-purple text-xs">{adj}</span>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/onboarding/brand-name')}
              className="rounded-xl border-2 border-dashed border-gray-200 p-5 text-sm text-gray-400 hover:border-gray-400 transition-colors text-left">
              + Add brand
            </button>
          </div>
        </section>

        {/* Quick generate shortcuts */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Generate content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['LinkedIn post', 'Blog post'].map(format => (
              <button key={format} onClick={() => navigate('/inbox')}
                className="rounded-xl border border-gray-200 bg-white p-5 text-left hover:border-gray-400 transition-colors">
                <p className="font-semibold text-gray-900">{format}</p>
                <p className="text-xs text-gray-400 mt-1">Select a brief from your inbox to get started</p>
              </button>
            ))}
          </div>
        </section>

        {/* Inbox section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Brand updates inbox</h2>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
            <p className="text-sm text-amber-700">Connect Gmail to capture campaign briefs automatically.</p>
            <button onClick={() => navigate('/settings')} className="text-sm font-medium text-amber-800 underline">
              Set up
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
