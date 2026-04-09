import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  buildBrandPortfolioRows,
  buildBriefActionItems,
  buildContinueWorkingItems,
  buildDashboardStats,
  buildDraftOutputState,
  buildRecentActivity,
  buildUpcomingDeadlineItems,
  getEmptyDashboardSummary,
  normalizeDashboardSummary,
} from '../../lib/dashboard-flow';
import { buildSessionRoute } from '../../lib/generation-session';
import { PLATFORM_NAV_ITEMS } from '../../lib/platform-nav';

const emptySummary = getEmptyDashboardSummary();

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setSummary(normalizeDashboardSummary(res.data.summary)))
      .catch(() => setSummary(getEmptyDashboardSummary()))
      .finally(() => setLoading(false));
  }, []);

  const greeting = getGreeting();
  const stats = useMemo(() => buildDashboardStats(summary), [summary]);
  const briefItems = useMemo(() => buildBriefActionItems(summary), [summary]);
  const continueWorkingItems = useMemo(() => buildContinueWorkingItems(summary), [summary]);
  const brandRows = useMemo(() => buildBrandPortfolioRows(summary), [summary]);
  const deadlineItems = useMemo(() => buildUpcomingDeadlineItems(summary), [summary]);
  const activity = useMemo(() => buildRecentActivity(summary), [summary]);

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const handleActivityClick = (item) => {
    if (item.kind === 'session') {
      navigate(item.href);
      return;
    }

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

  const handleBriefActionClick = (item) => {
    navigate('/generate/brief', { state: { cardIds: [item.id] } });
  };

  const handleContinueWorkingClick = (item) => {
    if (item.kind === 'session') {
      const session = summary.recentSessions.find((entry) => entry.id === item.id);
      if (session) {
        navigate(buildSessionRoute(session));
      }
      return;
    }

    const draft = summary.recentDrafts.find((entry) => entry.id === item.id);
    if (draft) {
      navigate('/generate/output', { state: buildDraftOutputState(draft) });
    }
  };

  const handleDeadlineClick = (item) => {
    if (item.kind === 'session') {
      const session = summary.recentSessions.find((entry) => entry.id === item.id);
      if (session) {
        navigate(buildSessionRoute(session));
      }
      return;
    }

    navigate('/generate/brief', { state: { cardIds: [item.id] } });
  };

  const handleStatClick = (card) => {
    if (card.label === 'Brand Kits') {
      navigate('/settings/brands');
      return;
    }

    if (card.label === 'Pending Briefs') {
      navigate('/inbox');
      return;
    }

    if (card.label === 'Brands in Pipeline') {
      if (summary.pendingBriefs.length > 0) {
        navigate('/inbox');
        return;
      }

      if (summary.recentSessions[0]) {
        navigate(buildSessionRoute(summary.recentSessions[0]));
        return;
      }

      if (summary.brands[0]) {
        navigate('/settings/brands');
      }
      return;
    }

    if (card.label === 'Saved Drafts') {
      const draft = summary.recentDrafts[0];
      if (draft) {
        navigate('/generate/output', { state: buildDraftOutputState(draft) });
      }
    }
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
                {PLATFORM_NAV_ITEMS.map((item) => (
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
                        <SidebarIcon name={getSidebarIconName(item.to)} active={isActive} />
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
                    <StatCard key={card.label} card={card} delay={index} onClick={() => handleStatClick(card)} />
                  ))}
                </section>

                <section className="mt-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Action Center</p>
                      <h2 className="mt-2 font-sans text-[1.75rem] font-semibold tracking-[-0.03em] text-slate-950">
                        Choose what to pick up next.
                      </h2>
                      <p className="mt-1 max-w-3xl text-sm text-slate-500">
                        New intake and ongoing work stay in the same place so you can decide what matters most right now.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/inbox')}
                      className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                    >
                      Open inbox →
                    </button>
                  </div>

                  <div className="mt-5 grid gap-6 xl:grid-cols-2">
                    <ActionCard
                      title="New Briefs to Review"
                      count={summary.counts.pendingBriefs}
                      delay="180ms"
                    >
                      {briefItems.length > 0 ? (
                        briefItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleBriefActionClick(item)}
                            className="group flex w-full items-start justify-between gap-4 border-b border-[#eef2f7] px-5 py-5 text-left transition-colors hover:bg-[#fafcff] last:border-b-0 sm:px-6"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Pill tone={item.qualityTone}>{item.qualityLabel}</Pill>
                                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                  {item.brandName}
                                </span>
                              </div>
                              <p className="mt-3 text-[1.05rem] font-medium tracking-[-0.02em] text-slate-900">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm text-slate-400">{formatRelativeTime(item.createdAt)}</p>
                              <p className="mt-3 text-sm font-medium text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-hover)]">
                                {item.actionLabel} →
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <EmptyActionState
                          title="Your intake queue is clear"
                          copy="New extracted briefs will appear here when stakeholder emails are processed."
                          actionLabel="Open inbox"
                          onAction={() => navigate('/inbox')}
                        />
                      )}
                    </ActionCard>

                    <ActionCard
                      title="Continue Working"
                      count={summary.recentSessions.length + summary.recentDrafts.length}
                      delay="240ms"
                    >
                      {continueWorkingItems.length > 0 ? (
                        continueWorkingItems.map((item) => (
                          <button
                            key={`${item.kind}-${item.id}`}
                            onClick={() => handleContinueWorkingClick(item)}
                            className="group flex w-full items-start justify-between gap-4 border-b border-[#eef2f7] px-5 py-5 text-left transition-colors hover:bg-[#fafcff] last:border-b-0 sm:px-6"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Pill tone={item.kind === 'session' ? 'green' : 'amber'}>{item.itemType}</Pill>
                                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                  {item.brandName}
                                </span>
                              </div>
                              <p className="mt-3 text-[1.05rem] font-medium tracking-[-0.02em] text-slate-900">
                                {item.title}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm text-slate-400">{formatRelativeTime(item.updatedAt)}</p>
                              <p className="mt-3 text-sm font-medium text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-hover)]">
                                {item.actionLabel} →
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <EmptyActionState
                          title="No active work right now"
                          copy="Saved drafts and live sessions will show up here when there is something to resume."
                        />
                      )}
                    </ActionCard>
                  </div>
                </section>

                <section
                  className="animate-dashboard-enter mt-8 overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="flex flex-col gap-3 border-b border-[#eef2f7] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace Health</p>
                      <h2 className="mt-2 font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
                        Brand Portfolio
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate('/settings/brands')}
                      className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                    >
                      View all kits →
                    </button>
                  </div>

                  {brandRows.length > 0 ? (
                    <div>
                      {brandRows.map((row) => (
                        <button
                          key={row.id}
                          onClick={() => navigate(row.href)}
                          className="group flex w-full flex-col gap-4 border-b border-[#eef2f7] px-5 py-5 text-left transition-colors hover:bg-[#fafcff] last:border-b-0 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-[1.02rem] font-medium tracking-[-0.02em] text-slate-900">{row.name}</p>
                              <Pill tone={row.statusTone}>{row.statusLabel}</Pill>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{row.descriptor}</p>
                            <p className="mt-3 text-sm text-slate-500">{row.toneSummary}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-500">
                              {row.pendingBriefLabel}
                            </span>
                            <Pill tone={row.guidelineTone}>{row.guidelineLabel}</Pill>
                            <span className="text-sm font-medium text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-hover)]">
                              {row.actionLabel} →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-sm text-slate-500">
                      <p>Create your first brand kit to start building a healthier workspace view.</p>
                      <button
                        onClick={() => navigate('/onboarding/brand-name')}
                        className="mt-4 text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                      >
                        Start setup →
                      </button>
                    </div>
                  )}
                </section>

                <section
                  className="animate-dashboard-enter mt-8 overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  style={{ animationDelay: '360ms' }}
                >
                  <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4 sm:px-6">
                    <div>
                      <h2 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
                        Upcoming Deadlines
                      </h2>
                    </div>
                    <span className="text-sm text-slate-400">Publish dates</span>
                  </div>

                  {deadlineItems.length > 0 ? (
                    <div>
                      {deadlineItems.map((item) => (
                        <button
                          key={`${item.kind}-${item.id}`}
                          onClick={() => handleDeadlineClick(item)}
                          className="group flex w-full flex-col gap-4 border-b border-[#eef2f7] px-5 py-5 text-left transition-colors hover:bg-[#fafcff] last:border-b-0 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Pill tone={item.urgencyTone}>{item.urgencyLabel}</Pill>
                              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                {item.brandName}
                              </span>
                            </div>
                            <p className="mt-3 text-[1.02rem] font-medium tracking-[-0.02em] text-slate-900">
                              {item.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{item.stateLabel}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-500">
                              {formatDeadlineDate(item.publishDate)}
                            </span>
                            <span className="text-sm font-medium text-[var(--brand-primary)] group-hover:text-[var(--brand-primary-hover)]">
                              Open →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-sm text-slate-500">
                      Upcoming publish dates will appear here once briefs or live sessions have confirmed go-live dates.
                    </div>
                  )}
                </section>

                <section
                  className="animate-dashboard-enter mt-8 overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  style={{ animationDelay: '420ms' }}
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
                            <p className="text-[1.02rem] font-medium tracking-[-0.02em] text-slate-900">{item.title}</p>
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
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function getSidebarIconName(path) {
  if (path === '/dashboard') return 'grid';
  if (path === '/settings/brands') return 'layers';
  if (path === '/inbox') return 'inbox';
  return 'settings';
}

function ActionCard({ title, count, delay, children }) {
  return (
    <div
      className="animate-dashboard-enter overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4 sm:px-6">
        <h3 className="font-sans text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
        <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-500">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyActionState({ title, copy, actionLabel, onAction }) {
  return (
    <div className="px-6 py-12 text-sm text-slate-500">
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-2 max-w-xl">{copy}</p>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-4 text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
        >
          {actionLabel} →
        </button>
      ) : null}
    </div>
  );
}

function Pill({ tone = 'neutral', children }) {
  const classes = {
    neutral: 'bg-[#f3f4f6] text-slate-500',
    blue: 'bg-[#eef4ff] text-[var(--brand-primary)]',
    green: 'bg-[#eefaf3] text-[#2f9b63]',
    amber: 'bg-[#fff8ea] text-[#c48a20]',
    red: 'bg-[#fff1f1] text-[#c93a3a]',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[tone] || classes.neutral}`}>
      {children}
    </span>
  );
}

function StatCard({ card, delay, onClick }) {
  const toneClasses = {
    neutral: 'text-slate-400 bg-[#f6f8fb]',
    blue: 'text-[var(--brand-primary)] bg-[#eef4ff]',
    green: 'text-[#2f9b63] bg-[#eefaf3]',
    amber: 'text-[#c48a20] bg-[#fff8ea]',
  };

  return (
    <button
      onClick={onClick}
      className="animate-dashboard-enter rounded-[22px] border border-[#e7ebf3] bg-white px-5 py-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-[#fafcff]"
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
    </button>
  );
}

function SidebarIcon({ name, active }) {
  const stroke = active ? '#ffffff' : '#a9b4c7';
  return <IconSvg name={name} stroke={stroke} className="h-5 w-5 shrink-0" />;
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

  if (name === 'bookmark') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M7 4.75h10a1 1 0 0 1 1 1V20l-6-3.5L6 20V5.75a1 1 0 0 1 1-1Z" />
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

function formatDeadlineDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
