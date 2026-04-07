import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  buildAttentionItems,
  buildDraftOutputState,
  buildRecentActivity,
} from '../../lib/dashboard-flow';

const emptySummary = {
  counts: { brands: 0, pendingBriefs: 0, recentDrafts: 0 },
  pendingBriefs: [],
  recentDrafts: [],
  brands: [],
  setup: { hasBrands: false, hasPendingBriefs: false, hasRecentDrafts: false, gmailAvailable: false },
};

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: 'grid', end: true },
  { to: '/settings/brands', label: 'Brand Kits', icon: 'layers', end: false },
  { to: '/inbox', label: 'Inbox', icon: 'inbox', end: true },
  { to: '/settings', label: 'Settings', icon: 'settings', end: true },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setSummary(res.data.summary))
      .catch(() => setSummary(emptySummary))
      .finally(() => setLoading(false));
  }, []);

  const greeting = getGreeting();
  const activity = useMemo(() => buildRecentActivity(summary), [summary]);
  const attentionItems = useMemo(() => buildAttentionItems(summary), [summary]);
  const stats = useMemo(() => ([
    {
      label: 'Brand Kits',
      value: summary.counts.brands,
      note: summary.counts.brands === 1 ? '1 live brand' : `${summary.counts.brands} live brands`,
      tone: 'neutral',
      icon: 'layers',
    },
    {
      label: 'Pending Briefs',
      value: summary.counts.pendingBriefs,
      note: summary.counts.pendingBriefs > 0 ? `${summary.counts.pendingBriefs} ready to use` : 'Queue is clear',
      tone: summary.counts.pendingBriefs > 0 ? 'blue' : 'neutral',
      icon: 'inbox',
    },
    {
      label: 'Saved Drafts',
      value: summary.counts.recentDrafts,
      note: summary.counts.recentDrafts > 0 ? 'Ready to resume' : 'Nothing saved yet',
      tone: summary.counts.recentDrafts > 0 ? 'green' : 'neutral',
      icon: 'draft',
    },
    {
      label: 'Needs Attention',
      value: attentionItems.length,
      note: attentionItems.length > 0 ? 'Items waiting on you' : 'Everything looks clear',
      tone: attentionItems.length > 0 ? 'amber' : 'neutral',
      icon: 'alert',
    },
  ]), [summary, attentionItems.length]);

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const handleActivityClick = (item) => {
    if (item.kind === 'brief') {
      navigate('/generate/brief', { state: { cardIds: [item.id.replace('brief-', '')] } });
      return;
    }

    if (item.kind === 'draft') {
      const draftId = item.id.replace('draft-', '');
      const draft = summary.recentDrafts.find((entry) => entry.id === draftId);
      if (draft) {
        navigate('/generate/output', { state: buildDraftOutputState(draft) });
      }
      return;
    }

    if (item.kind === 'brand') {
      navigate(item.href);
    }
  };

  const handleAttentionClick = (item) => {
    if (item.kind === 'brief') {
      navigate('/generate/brief', { state: { cardIds: [item.id] } });
      return;
    }

    if (item.kind === 'draft') {
      const draft = summary.recentDrafts.find((entry) => entry.id === item.id);
      if (draft) {
        navigate('/generate/output', { state: buildDraftOutputState(draft) });
      }
      return;
    }

    if (item.kind === 'settings') {
      navigate('/settings');
      return;
    }

    navigate('/onboarding/brand-name');
  };

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <div className="grid min-h-dvh lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="border-b border-[#1b2333] bg-[#0b1020] text-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b border-[#1b2333] px-4 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2563eb,#5b8cff)] text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
                  <span className="text-lg font-semibold">B</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em] text-white">BrandOS</p>
                  <p className="text-xs text-[#8e9ab0]">Content marketing</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto px-3 py-5 lg:overflow-visible">
              <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#657089]">Main</p>
              <div className="flex gap-2 lg:flex-col">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex min-w-fit items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#171f31] text-white'
                          : 'text-[#c2cad8] hover:bg-[#12192a] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <SidebarIcon name={item.icon} active={isActive} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-[#1b2333] px-4 py-5">
              <div className="rounded-2xl bg-[#12192a] px-3 py-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Content manager'}
                </p>
                <p className="mt-1 text-xs text-[#8e9ab0]">{user?.companyName || user?.email || 'Workspace'}</p>
              </div>

              <button
                onClick={handleSignOut}
                className="mt-4 text-sm font-medium text-[#8e9ab0] transition-colors hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="bg-white">
          <div className="border-b border-[#e9edf5]" />
          <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            {loading ? (
              <div className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                Loading your workspace...
              </div>
            ) : (
              <div className="animate-dashboard-enter">
                <header className="mb-8">
                  <h1 className="font-sans text-[2.35rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.8rem]">
                    {greeting}, {user?.firstName || 'team'}.
                  </h1>
                  <p className="mt-2 max-w-2xl text-base text-slate-500">
                    Here&apos;s what&apos;s happening across your brands today.
                  </p>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((card, index) => (
                    <StatCard key={card.label} card={card} delay={index} />
                  ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                  <div
                    className="animate-dashboard-enter overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    style={{ animationDelay: '180ms' }}
                  >
                    <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4 sm:px-6">
                      <div>
                        <h2 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
                          Recent Activity
                        </h2>
                      </div>
                      <span className="text-sm text-slate-400">Last 7 days</span>
                    </div>

                    {activity.length > 0 ? (
                      <div>
                        {activity.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleActivityClick(item)}
                            className="group flex w-full items-start justify-between gap-5 border-b border-[#eef2f7] px-5 py-5 text-left transition-colors hover:bg-[#fafcff] last:border-b-0 sm:px-6"
                          >
                            <div>
                              <p className="text-[1.05rem] font-medium tracking-[-0.02em] text-slate-900">{item.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{item.subject}</p>
                            </div>
                            <span className="shrink-0 pt-1 text-sm text-slate-400 group-hover:text-slate-500">
                              {formatRelativeTime(item.when)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-sm text-slate-500">
                        Activity will appear here as new briefs arrive, drafts are saved, and brand kits are updated.
                      </div>
                    )}
                  </div>

                  <div
                    className="animate-dashboard-enter overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    style={{ animationDelay: '260ms' }}
                  >
                    <div className="border-b border-[#eef2f7] px-5 py-4 sm:px-6">
                      <h2 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
                        Needs Attention
                      </h2>
                    </div>

                    {attentionItems.length > 0 ? (
                      <div>
                        {attentionItems.map((item) => (
                          <div key={item.id} className="border-b border-[#eef2f7] px-5 py-5 last:border-b-0 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[1.05rem] font-medium tracking-[-0.02em] text-slate-900">{item.title}</p>
                                <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                              </div>
                              <StatusPill status={item.status} />
                            </div>
                            <button
                              onClick={() => handleAttentionClick(item)}
                              className="mt-4 text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                            >
                              {item.actionLabel} →
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-sm text-slate-500">
                        Nothing urgent right now. New briefs and drafts that need attention will show up here.
                      </div>
                    )}

                    <div className="px-5 py-4 sm:px-6">
                      <button
                        onClick={() => navigate('/inbox')}
                        className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                      >
                        Open inbox →
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ card, delay }) {
  const toneClasses = {
    neutral: 'text-slate-400 bg-[#f6f8fb]',
    blue: 'text-[var(--brand-primary)] bg-[#eef4ff]',
    green: 'text-[#2f9b63] bg-[#eefaf3]',
    amber: 'text-[#c48a20] bg-[#fff8ea]',
  };

  return (
    <div
      className="animate-dashboard-enter rounded-[22px] border border-[#e7ebf3] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      style={{ animationDelay: `${60 + (delay * 45)}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-5 text-[2.1rem] font-semibold tracking-[-0.04em] text-slate-950">{card.value}</p>
          <p className={`mt-1 text-sm ${card.tone === 'neutral' ? 'text-slate-400' : toneClasses[card.tone].split(' ')[0]}`}>
            {card.note}
          </p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[card.tone]}`}>
          <MetricIcon name={card.icon} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const labels = {
    brief: 'pending',
    draft: 'draft',
    setup: 'setup',
  };

  const classes = {
    brief: 'bg-[#eef4ff] text-[var(--brand-primary)]',
    draft: 'bg-[#fff8ea] text-[#c48a20]',
    setup: 'bg-[#f3f4f6] text-slate-500',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || classes.setup}`}>
      {labels[status] || status}
    </span>
  );
}

function SidebarIcon({ name, active }) {
  const stroke = active ? '#ffffff' : '#a9b4c7';
  const className = 'h-5 w-5 shrink-0';
  return <IconSvg name={name} stroke={stroke} className={className} />;
}

function MetricIcon({ name }) {
  return <IconSvg name={name} stroke="currentColor" className="h-5 w-5" />;
}

function IconSvg({ name, stroke, className }) {
  if (name === 'grid') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === 'layers') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="m12 4 8 4-8 4-8-4 8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
      </svg>
    );
  }

  if (name === 'inbox') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M4 5.5h16v10.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5Z" />
        <path d="M4 13h4.8a2 2 0 0 0 1.7.95h3a2 2 0 0 0 1.7-.95H20" />
      </svg>
    );
  }

  if (name === 'draft') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M14 4h6v6" />
        <path d="m20 4-9.5 9.5" />
        <path d="M6 8h3" />
        <path d="M4 12h5" />
        <path d="M4 16h8" />
        <path d="M4 20h12" />
      </svg>
    );
  }

  if (name === 'alert') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="m10.29 3.86-7.7 13.34A2 2 0 0 0 4.32 20h15.36a2 2 0 0 0 1.73-2.8l-7.7-13.34a2 2 0 0 0-3.42 0Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3.75v2.5" />
      <path d="m18.187 5.813-1.768 1.768" />
      <path d="M20.25 12h-2.5" />
      <path d="m18.187 18.187-1.768-1.768" />
      <path d="M12 17.75a5.75 5.75 0 1 0 0-11.5 5.75 5.75 0 0 0 0 11.5Z" />
      <path d="m7.581 16.419-1.768 1.768" />
      <path d="M3.75 12h2.5" />
      <path d="m7.581 7.581-1.768-1.768" />
      <path d="M12 17.75v2.5" />
    </svg>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diff = Date.now() - date.getTime();
  const hour = 1000 * 60 * 60;
  const day = hour * 24;

  if (diff < hour) {
    const minutes = Math.max(1, Math.round(diff / (1000 * 60)));
    return `${minutes}m ago`;
  }

  if (diff < day) {
    return `${Math.round(diff / hour)}h ago`;
  }

  return `${Math.round(diff / day)}d ago`;
}
