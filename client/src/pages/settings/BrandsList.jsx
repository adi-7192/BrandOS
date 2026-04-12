import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { useBrand } from '../../context/BrandContext';
import { buildBrandCardModel } from '../../lib/brand-kits-view';

export default function BrandsList() {
  const navigate = useNavigate();
  const { brands, fetchBrands } = useBrand();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBrands()
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchBrands]);

  const cards = useMemo(() => brands.map((brand) => ({ brand, view: buildBrandCardModel(brand) })), [brands]);

  return (
    <AppShell>
      {loading ? (
        <div className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          Loading brand kits...
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-14 text-center text-sm text-red-600">
          Could not load brand kits. Please refresh and try again.
        </div>
      ) : (
        <div className="animate-dashboard-enter">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-sans text-[2.2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.6rem]">
                Brand Kits
              </h1>
              <p className="mt-2 max-w-2xl text-base text-slate-500">
                Manage tone, audience, guardrails, and channel rules for each brand in your workspace.
              </p>
            </div>
            <button
              onClick={() => navigate('/onboarding/brand-name')}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              Add Brand
            </button>
          </div>

          {cards.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cards.map(({ brand, view }, index) => (
                <button
                  key={brand.id}
                  onClick={() => navigate(`/settings/brands/${brand.id}`)}
                  className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d6deeb] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
                  style={{ animationDelay: `${60 + (index * 45)}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
                        {view.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {view.descriptor}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${view.status.label === 'active' ? 'bg-[#eefaf3] text-[#2f9b63]' : 'bg-[#fff8ea] text-[#c48a20]'}`}>
                      {view.status.label}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    {view.swatches.map((swatch) => (
                      <span
                        key={`${brand.id}-${swatch}`}
                        className="h-7 w-7 rounded-full border border-[#e7ebf3]"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[#eef2f7] pt-5">
                    <InfoRow label="Tone" value={view.toneSummary} />
                    <InfoRow label="Audience" value={view.audienceSummary} />
                  </div>

                  {view.signals.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {view.signals.map((signal) => (
                        <span key={`${brand.id}-${signal}`} className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-medium text-slate-500">
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between border-t border-[#eef2f7] pt-5">
                    <span className="text-sm text-slate-400">{view.status.meta}</span>
                    <span className="text-sm font-medium text-[var(--brand-primary)]">Open →</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d8dfeb] bg-[#fbfcfe] px-6 py-14 text-center">
              <h2 className="font-sans text-[1.4rem] font-semibold tracking-[-0.03em] text-slate-950">No brand kits yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                Create your first brand kit to capture tone, audience, and channel rules before content generation starts.
              </p>
              <button
                onClick={() => navigate('/onboarding/brand-name')}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
              >
                Start setup
              </button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
