import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import { useBrand } from '../../context/BrandContext';
import api from '../../services/api';
import {
  buildCampaignCards,
  buildCampaignFilters,
  filterCampaigns,
} from '../../lib/campaigns-view';

export default function Campaigns() {
  const navigate = useNavigate();
  const { brands, fetchBrands } = useBrand();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get('/campaigns'),
      fetchBrands().catch(() => []),
    ])
      .then(([campaignsRes]) => {
        if (!mounted) return;
        setCampaigns(campaignsRes.data.campaigns || []);
      })
      .catch(() => {
        if (!mounted) return;
        setCampaigns([]);
        setFetchError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fetchBrands]);

  const filters = useMemo(() => buildCampaignFilters(campaigns), [campaigns]);
  const visibleCampaigns = useMemo(
    () => filterCampaigns(campaigns, { activeFilter, searchQuery }),
    [activeFilter, campaigns, searchQuery]
  );
  const cards = useMemo(() => buildCampaignCards(visibleCampaigns), [visibleCampaigns]);

  const handleNewCampaign = () => {
    if (brands.length === 0) {
      navigate('/onboarding/brand-name');
      return;
    }

    if (brands.length === 1) {
      navigate(`/generate/brief?brandId=${brands[0].id}`, {
        state: { mode: 'manual', brand: brands[0] },
      });
      return;
    }

    navigate('/settings/brands');
  };

  return (
    <AppShell>
      {loading ? (
        <div className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          Loading campaigns...
        </div>
      ) : (
        <div className="animate-dashboard-enter">
          {fetchError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Could not load campaigns. Please refresh and try again.
            </div>
          )}
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-sans text-[2.2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.6rem]">
                Campaigns
              </h1>
              <p className="mt-2 max-w-3xl text-base text-slate-500">
                Track draft, active, and completed work across your brands so your team can resume quickly and keep every campaign connected to the right kit.
              </p>
              <p className="mt-3 text-sm text-slate-400">
                {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} across {new Set(campaigns.map((campaign) => campaign.brandId)).size} brands
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleNewCampaign}
            >
              New campaign
            </Button>
          </div>

          <section className="mb-6 rounded-[24px] border border-[#e7ebf3] bg-[#fbfcff] px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-[var(--brand-primary)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              <label className="flex items-center rounded-xl border border-[#e7ebf3] bg-white px-4 py-3">
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search campaigns..."
                  className="ml-3 w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>
          </section>

          {cards.length > 0 ? (
            <div className="space-y-5">
              {cards.map((card, index) => (
                <CampaignCard key={card.id} card={card} index={index} navigate={navigate} />
              ))}
            </div>
          ) : (
            <EmptyCampaignState
              hasCampaigns={campaigns.length > 0}
              hasSearch={Boolean(searchQuery.trim())}
              onClearSearch={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              onNewCampaign={handleNewCampaign}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}

function CampaignCard({ card, index, navigate }) {
  return (
    <section
      className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      style={{ animationDelay: `${60 + (index * 40)}ms` }}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
              {card.title}
            </h2>
            <StatusPill tone={card.statusTone}>{card.statusLabel}</StatusPill>
            <MetaPill>{card.typeLabel}</MetaPill>
          </div>
          <p className="mt-2 text-sm text-slate-500">{card.brandName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{card.publishLabel}</span>
          <span>•</span>
          <span>{card.updatedLabel}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[#eef2f7] pt-5 lg:grid-cols-2 xl:grid-cols-4">
        <InfoBlock label="Current Stage" value={card.stepLabel} />
        <InfoBlock label="Tone" value={card.toneLabel} />
        <InfoBlock label="Channels" value={card.channelsLabel} />
        <InfoBlock label="Key Message" value={card.keyMessage} />
      </div>

      <div className="mt-5 rounded-[20px] bg-[#f8fafc] px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Progress</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{card.progressPercent}% complete</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {card.outputs.length > 0 ? (
              card.outputs.map((output) => (
                <StatusPill key={output.id} tone={output.stateTone}>{output.label} · {output.stateLabel}</StatusPill>
              ))
            ) : (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-400">
                No outputs yet
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#5b8cff)]"
            style={{ width: `${Math.max(8, card.progressPercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#eef2f7] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(card.primaryAction.href)}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)]"
          >
            {card.primaryAction.label}
          </button>
          <button
            onClick={() => navigate(card.secondaryAction.href)}
            className="inline-flex items-center justify-center rounded-xl border border-[#d7deea] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#c3cede] hover:bg-[#f8fafc]"
          >
            {card.secondaryAction.label}
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function StatusPill({ tone, children }) {
  const tones = {
    green: 'bg-[#eefaf3] text-[#2f9b63]',
    amber: 'bg-[#fff8ea] text-[#c48a20]',
    blue: 'bg-[#eef4ff] text-[#3568d4]',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || 'bg-[#f3f5f9] text-slate-500'}`}>
      {children}
    </span>
  );
}

function MetaPill({ children }) {
  return (
    <span className="rounded-full bg-[#f3f5f9] px-3 py-1 text-xs font-semibold text-slate-500">
      {children}
    </span>
  );
}

function EmptyCampaignState({ hasCampaigns, hasSearch, onClearSearch, onNewCampaign }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d8dfeb] bg-[#fbfcfe] px-6 py-14 text-center">
      <h2 className="font-sans text-[1.4rem] font-semibold tracking-[-0.03em] text-slate-950">
        {hasCampaigns ? 'No campaigns match this view' : 'No campaigns yet'}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
        {hasCampaigns
          ? 'Try a different status tab or search query to find the work you need.'
          : 'Start a campaign from one of your brand kits to track draft, active, and completed work in one place.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasSearch ? (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center justify-center rounded-xl border border-[#d7deea] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#c3cede] hover:bg-[#f8fafc]"
          >
            Clear filters
          </button>
        ) : null}
        <Button
          variant="primary"
          onClick={onNewCampaign}
        >
          New campaign
        </Button>
      </div>
    </div>
  );
}
