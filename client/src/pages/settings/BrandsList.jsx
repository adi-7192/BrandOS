import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import { useBrand } from '../../context/BrandContext';

export default function BrandsList() {
  const navigate = useNavigate();
  const { brands, fetchBrands } = useBrand();

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Brand kits</h1>
          <button onClick={() => navigate('/onboarding/brand-name')}
            className="text-sm font-medium text-gray-900 underline">+ Add brand</button>
        </div>
        <div className="flex flex-col gap-3">
          {brands.map(brand => (
            <div key={brand.id} onClick={() => navigate(`/settings/brands/${brand.id}`)}
              className="rounded-xl border border-gray-200 bg-white p-5 cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{brand.name}</p>
                <span className="text-xs text-gray-400">Kit v{brand.kitVersion}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{brand.market} · {brand.language}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {brand.kit?.voiceAdjectives?.map(adj => (
                  <span key={adj} className="chip chip-purple text-xs">{adj}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
