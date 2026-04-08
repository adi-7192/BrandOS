import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import api from '../../services/api';
import { buildBrandDetailSections } from '../../lib/brand-kits-view';

export default function BrandEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/brands/${id}`)
      .then((res) => setBrand(res.data.brand))
      .finally(() => setLoading(false));
  }, [id]);

  const detail = useMemo(() => (brand ? buildBrandDetailSections(brand) : null), [brand]);

  return (
    <AppShell>
      {loading ? (
        <div className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          Loading brand kit...
        </div>
      ) : !brand || !detail ? (
        <div className="rounded-[24px] border border-dashed border-[#d8dfeb] bg-[#fbfcfe] px-6 py-14 text-center text-sm text-slate-500">
          Brand not found.
        </div>
      ) : (
        <div className="animate-dashboard-enter">
          <button
            onClick={() => navigate('/settings/brands')}
            className="mb-6 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            ← All brands
          </button>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="font-sans text-[2.2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.6rem]">
                {brand.name}
              </h1>
              <p className="mt-2 max-w-2xl text-base text-slate-500">
                Review the live brand memory, channel rules, and guardrails used for generation.
              </p>
            </div>
            <button
              onClick={() => navigate(`/generate/brief?brandId=${brand.id}`, { state: { mode: 'manual', brand } })}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              Generate content
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {detail.summary.map((item, index) => (
              <div
                key={item.label}
                className="animate-dashboard-enter rounded-[22px] border border-[#e7ebf3] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                style={{ animationDelay: `${60 + (index * 40)}ms` }}
              >
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-4 text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {detail.cards.map((section, index) => (
              <div
                key={section.title}
                className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                style={{ animationDelay: `${180 + (index * 50)}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-sans text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-950">
                    {section.title}
                  </h2>
                  <SectionTonePill tone={section.tone} />
                </div>

                {section.items.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {section.items.map((item) => (
                      <span
                        key={`${section.title}-${item}`}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${getItemToneClasses(section.tone)}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-slate-500">{section.empty}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function SectionTonePill({ tone }) {
  const classes = {
    accent: 'bg-[#eef4ff] text-[var(--brand-primary)]',
    success: 'bg-[#eefaf3] text-[#2f9b63]',
    warning: 'bg-[#fff8ea] text-[#c48a20]',
    neutral: 'bg-[#f6f8fb] text-slate-500',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[tone] || classes.neutral}`}>
      {tone}
    </span>
  );
}

function getItemToneClasses(tone) {
  const classes = {
    accent: 'bg-[#eef4ff] text-[var(--brand-primary)]',
    success: 'bg-[#eefaf3] text-[#2f9b63]',
    warning: 'bg-[#fff8ea] text-[#c48a20]',
    neutral: 'bg-[#f6f8fb] text-slate-600',
  };

  return classes[tone] || classes.neutral;
}
