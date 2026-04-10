import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { buildInboxCounts, buildInboxEmptyState, groupInboxThreads } from '../../lib/inbox-view';
import { buildInboxAiCard } from '../../lib/inbox-ai-view';
import { buildSampleBrief } from '../../lib/generation-flow';
import {
  buildGenerationSessionPayload,
  buildSessionQuery,
} from '../../lib/generation-session';

const STATUS_TABS = ['pending', 'used', 'dismissed'];

export default function Inbox() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, used: 0, dismissed: 0 });
  const [activeTab, setActiveTab] = useState('pending');
  const [viewMode, setViewMode] = useState('updates');
  const [drawerCardId, setDrawerCardId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openThreads, setOpenThreads] = useState({});
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await api.get(`/inbox?status=${status}`);
      const nextCards = res.data.cards || [];
      setCards(nextCards);
      setCounts(res.data.counts || buildInboxCounts(nextCards));
      setDrawerCardId((current) => {
        if (current && nextCards.some((card) => card.id === current)) {
          return current;
        }

        return nextCards[0]?.id || null;
      });
      setOpenThreads({});
      if (nextCards.length === 0) {
        setDrawerOpen(false);
      }
    } catch {
      setCards([]);
      setCounts({ pending: 0, used: 0, dismissed: 0 });
      setDrawerCardId(null);
      setDrawerOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox(activeTab);
  }, [activeTab, loadInbox]);

  const aiCards = useMemo(() => cards.map(buildInboxAiCard), [cards]);
  const aiCardMap = useMemo(
    () => new Map(aiCards.map((card) => [card.id, card])),
    [aiCards]
  );
  const threads = useMemo(
    () => groupInboxThreads(cards).map((thread) => ({
      ...thread,
      cards: thread.cards.map((card) => aiCardMap.get(card.id) || buildInboxAiCard(card)),
    })),
    [aiCardMap, cards]
  );
  const drawerCard = drawerCardId ? aiCardMap.get(drawerCardId) || null : null;
  const emptyState = useMemo(
    () => buildInboxEmptyState({ activeTab, intakeEmail: '', gmailAvailable: false }),
    [activeTab]
  );

  const handleDismiss = async (id) => {
    await api.patch(`/inbox/${id}/status`, { status: 'dismissed' });
    await loadInbox(activeTab);
  };

  const handleGenerateBrief = async (id) => {
    await api.post(`/inbox/${id}/complete-campaign`);
    navigate('/generate/brief', { state: { cardIds: [id] } });
  };

  const handleGenerateContent = async (id) => {
    const briefRes = await api.post('/generate/brief', { cardIds: [id] });
    const brief = briefRes.data.brief;
    const payload = buildGenerationSessionPayload({
      brief,
      sections: {},
      output: {},
      currentStep: 'preview',
      activeTab: 'linkedin',
      lastInstruction: '',
    });
    const sessionRes = await api.post('/generate/sessions', payload);
    const sessionId = sessionRes.data.session.id;
    await api.post(`/inbox/${id}/complete-campaign`);
    navigate(`/generate/preview${buildSessionQuery(sessionId)}`, {
      state: {
        brief,
        sessionId,
        activeTab: 'linkedin',
      },
    });
  };

  const handleApplyBrandUpdates = async (id) => {
    await api.post(`/inbox/${id}/apply-brand-updates`);
    await loadInbox(activeTab);
  };

  const openOriginalDrawer = (id) => {
    setDrawerCardId(id);
    setDrawerOpen(true);
  };

  const toggleThread = (threadId) => {
    setOpenThreads((current) => ({
      ...current,
      [threadId]: !current[threadId],
    }));
  };

  const handleStartSampleFlow = () => {
    navigate('/generate/brief', {
      state: {
        sampleBrief: buildSampleBrief(),
      },
    });
  };

  return (
    <AppShell>
      {loading ? (
        <div className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          Loading inbox...
        </div>
      ) : (
        <div className="animate-dashboard-enter">
          <header className="mb-8">
            <h1 className="font-sans text-[2.2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.6rem]">
              Brand Inbox
            </h1>
            <p className="mt-2 max-w-3xl text-base text-slate-500">
              Forward stakeholder threads to your BrandOS intake address. AI turns each thread into a concise summary, extracted work blocks, and next-step actions for your team.
            </p>
          </header>

          <section className="mb-6 rounded-[24px] border border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0a66c2]">Workflow</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">Inbox to brief to content</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  BrandOS turns stakeholder updates into a campaign brief first, then helps you generate on-brand LinkedIn and blog drafts from that brief.
                </p>
              </div>
              <button
                onClick={handleStartSampleFlow}
                className="rounded-2xl border border-[#dbe3ef] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#c8d4e3] hover:text-slate-950"
              >
                Explore a sample workflow
              </button>
            </div>
          </section>

          <section className="mb-6 rounded-[24px] border border-[#e7ebf3] bg-[#fbfcff] px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
              <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'bg-[var(--brand-primary)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {tab} ({counts[tab] || 0})
                  </button>
                ))}
              </div>

              <div className="inline-flex rounded-xl border border-[#e7ebf3] bg-white p-1">
                {[
                  { id: 'updates', label: 'AI summaries' },
                  { id: 'threads', label: 'Grouped by thread' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setViewMode(option.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === option.id
                        ? 'bg-[#f0f5ff] text-[var(--brand-primary)]'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="text-sm text-slate-400">
                {cards.length} {cards.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {cards.length === 0 ? (
              <EmptyInboxState
                emptyState={emptyState}
                onOpenSettings={() => navigate('/settings')}
                onStartSampleFlow={handleStartSampleFlow}
              />
            ) : viewMode === 'updates' ? (
              aiCards.map((card, index) => (
                <UpdateCard
                  key={card.id}
                  aiCard={card}
                  index={index}
                  onGenerateBrief={() => handleGenerateBrief(card.id)}
                  onGenerateContent={() => handleGenerateContent(card.id)}
                  onDismiss={() => handleDismiss(card.id)}
                  onApplyBrandUpdates={() => handleApplyBrandUpdates(card.id)}
                  onViewOriginal={() => openOriginalDrawer(card.id)}
                  onReload={() => loadInbox(activeTab)}
                />
              ))
            ) : (
              threads.map((thread, index) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  index={index}
                  open={Boolean(openThreads[thread.id])}
                  onToggle={() => toggleThread(thread.id)}
                  onGenerateBrief={handleGenerateBrief}
                  onGenerateContent={handleGenerateContent}
                  onDismiss={handleDismiss}
                  onApplyBrandUpdates={handleApplyBrandUpdates}
                  onViewOriginal={openOriginalDrawer}
                  onReload={() => loadInbox(activeTab)}
                />
              ))
            )}
          </section>

          <OriginalMailDrawer
            open={drawerOpen}
            card={drawerCard}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      )}
    </AppShell>
  );
}

function UpdateCard({
  aiCard,
  index,
  onGenerateBrief,
  onGenerateContent,
  onDismiss,
  onApplyBrandUpdates,
  onViewOriginal,
  onReload,
  nested = false,
}) {
  const [instruction, setInstruction] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [routingState, setRoutingState] = useState('idle');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const needsRouting = aiCard.needsRouting;

  const handleInterpret = async () => {
    setRoutingState('loading');
    setError('');
    try {
      const res = await api.post(`/inbox/${aiCard.id}/route/interpret`, { instruction });
      setInterpretation(res.data.interpretation);
      setRoutingState('ready');
    } catch (err) {
      setError(err.response?.data?.message || 'We could not interpret that routing instruction yet.');
      setRoutingState('error');
    }
  };

  const handleConfirm = async () => {
    if (!interpretation?.brandId) return;

    setRoutingState('confirming');
    setError('');
    try {
      await api.post(`/inbox/${aiCard.id}/route/confirm`, {
        brandId: interpretation.brandId,
        instruction,
        summary: interpretation.summary,
        createCampaign: interpretation.createCampaign,
        reviewBrandUpdates: interpretation.reviewBrandUpdates,
      });
      await onReload();
    } catch (err) {
      setError(err.response?.data?.message || 'We could not confirm that routing yet.');
      setRoutingState('error');
    }
  };

  const handleAction = async (actionId) => {
    if (actionId === 'view-original') {
      onViewOriginal();
      return;
    }

    if (actionId === 'dismiss') {
      await onDismiss();
      return;
    }

    if (actionId === 'update-brand-kit') {
      await onApplyBrandUpdates();
      return;
    }

    if (actionId === 'generate-content') {
      await onGenerateContent();
      return;
    }

    if (actionId === 'generate-brief') {
      await onGenerateBrief();
      return;
    }

    if (actionId === 'route-thread') {
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      className={`animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${nested ? '' : ''}`}
      style={{ animationDelay: nested ? undefined : `${60 + (index * 45)}ms` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-600">
          {aiCard.brandName}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getClassificationClasses(aiCard.classification)}`}>
          {formatClassificationLabel(aiCard.classification)}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getConfidenceClasses(aiCard.confidence.tone)}`}>
          {aiCard.confidence.label}
        </span>
        {aiCard.status !== 'pending' ? (
          <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold capitalize text-slate-500">
            {aiCard.status}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
            {aiCard.emailSubject}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {aiCard.emailFrom} · {formatRelativeTime(aiCard.createdAt)}
          </p>
        </div>
        {!needsRouting && (
          <div className="flex flex-wrap items-center gap-2">
            {aiCard.raw.campaignActionStatus !== 'not_applicable' && (
              <StatusChip label={`Campaign · ${formatActionStatus(aiCard.raw.campaignActionStatus)}`} tone={aiCard.raw.campaignActionStatus} />
            )}
            {aiCard.raw.brandUpdateActionStatus !== 'not_applicable' && (
              <StatusChip label={`Brand updates · ${formatActionStatus(aiCard.raw.brandUpdateActionStatus)}`} tone={aiCard.raw.brandUpdateActionStatus} />
            )}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dbe7ff] bg-[#f8fbff] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">AI summary</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">{aiCard.aiTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{aiCard.aiSummary}</p>
        {aiCard.highlights.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {aiCard.highlights.map((item) => (
              <li key={`${aiCard.id}-${item}`} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {aiCard.campaign.visible ? (
        <div className="mt-5 rounded-[20px] border border-[#eef2f7] bg-[#fbfcff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">AI extracted campaign brief</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {aiCard.campaign.fields.map((field) => (
              <div key={`${aiCard.id}-${field.key}`} className="rounded-[16px] border border-[#e7ebf3] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{field.label}</p>
                <p className="mt-2 text-sm text-slate-900">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {aiCard.brandUpdates.visible ? (
        <div className="mt-5 rounded-[20px] border border-[#eef2f7] bg-[#fbfcff] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">AI suggested brand updates</p>
              {aiCard.brandUpdates.summary ? (
                <p className="mt-2 text-sm leading-7 text-slate-600">{aiCard.brandUpdates.summary}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {aiCard.brandUpdates.changes.map((change) => (
              <div key={`${aiCard.id}-${change.field}`} className="rounded-[16px] border border-[#e7ebf3] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{change.label}</p>
                  <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-medium text-slate-500">
                    Suggested
                  </span>
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Current</p>
                    <p className="mt-2 text-sm text-slate-600">{change.current}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Suggested</p>
                    <p className="mt-2 text-sm text-slate-900">{change.suggested}</p>
                  </div>
                </div>
                {change.reason ? (
                  <p className="mt-3 text-sm text-slate-500">{change.reason}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {needsRouting ? (
        <div className="mt-5 rounded-[20px] border border-[#fff1c8] bg-[#fffaf0] p-4">
          <p className="text-sm font-semibold text-slate-900">Help BrandOS route this thread</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Tell BrandOS which brand this belongs to and whether it should create a campaign, update the brand kit, or both.
          </p>
          <textarea
            ref={textareaRef}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Example: This belongs to BHV Marais. Create a campaign from this and review any lasting tone changes for the brand kit."
            className="mt-4 min-h-[96px] w-full rounded-xl border border-[#e7ebf3] bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
          />
          {error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : null}
          {interpretation ? (
            <div className="mt-4 rounded-xl border border-[#dbe7ff] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">AI interpretation</p>
              <p className="mt-2 text-sm text-slate-700">I understood this as: {interpretation.summary}</p>
              <p className="mt-2 text-xs text-slate-400">
                Brand: {interpretation.brandName || 'Unresolved'} · Campaign: {interpretation.createCampaign ? 'Yes' : 'No'} · Brand updates: {interpretation.reviewBrandUpdates ? 'Yes' : 'No'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={handleConfirm} disabled={!interpretation.brandId || routingState === 'confirming'}>
                  {routingState === 'confirming' ? 'Confirming…' : 'Confirm interpretation'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {aiCard.actions.map((action) => {
          if (action.id === 'view-original') {
            return (
              <button
                key={`${aiCard.id}-${action.id}`}
                onClick={() => handleAction(action.id)}
                className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
              >
                {action.label}
              </button>
            );
          }

          if (action.id === 'dismiss') {
            return (
              <button
                key={`${aiCard.id}-${action.id}`}
                onClick={() => handleAction(action.id)}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {action.label}
              </button>
            );
          }

          return (
            <Button
              key={`${aiCard.id}-${action.id}`}
              variant={action.recommended ? 'primary' : 'secondary'}
              disabled={action.disabled || (action.id === 'route-thread' && routingState === 'loading')}
              onClick={() => {
                if (action.id === 'route-thread' && !interpretation && !instruction.trim()) {
                  textareaRef.current?.focus();
                  return;
                }

                if (action.id === 'route-thread' && !interpretation) {
                  handleInterpret();
                  return;
                }

                handleAction(action.id);
              }}
              className={action.recommended ? 'shadow-[0_12px_24px_rgba(37,99,235,0.16)]' : ''}
            >
              {action.recommended ? `${action.label} · Recommended` : action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function ThreadCard({
  thread,
  index,
  open,
  onToggle,
  onGenerateBrief,
  onGenerateContent,
  onDismiss,
  onApplyBrandUpdates,
  onViewOriginal,
  onReload,
}) {
  const statusView = getThreadStatusView(thread.statuses);

  return (
    <div
      className="animate-dashboard-enter overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      style={{ animationDelay: `${60 + (index * 45)}ms` }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[#fafcff]"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-600">
              {thread.brandName}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusView.classes}`}>
              {statusView.label}
            </span>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
              {thread.updateCount} {thread.updateCount === 1 ? 'AI summary' : 'AI summaries'}
            </span>
          </div>
          <h2 className="mt-3 font-sans text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
            {thread.subject}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {thread.sourceLabel} · {formatRelativeTime(thread.createdAt)}
          </p>
        </div>
        <span className="pt-1 text-sm font-medium text-[var(--brand-primary)]">
          {open ? 'Hide' : 'Expand'}
        </span>
      </button>

      {open ? (
        <div className="border-t border-[#eef2f7] bg-[#fcfdff] px-5 py-5">
          <div className="space-y-4">
            {thread.cards.map((card) => (
              <UpdateCard
                key={card.id}
                aiCard={card}
                nested
                onGenerateBrief={() => onGenerateBrief(card.id)}
                onGenerateContent={() => onGenerateContent(card.id)}
                onDismiss={() => onDismiss(card.id)}
                onApplyBrandUpdates={() => onApplyBrandUpdates(card.id)}
                onViewOriginal={() => onViewOriginal(card.id)}
                onReload={onReload}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OriginalMailDrawer({ open, card, onClose }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowTechnicalDetails(false);
    }
  }, [open, card?.id]);

  if (!open || !card) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        aria-label="Close original email drawer"
        className="absolute inset-0 bg-slate-950/20"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-[#e7ebf3] bg-white shadow-[-12px_0_32px_rgba(15,23,42,0.16)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#eef2f7] px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Original email</p>
            <h2 className="mt-2 font-sans text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-950">
              {card.originalMail.subject}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {card.originalMail.from} · {formatLongDate(card.originalMail.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#e7ebf3] px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="rounded-[20px] border border-[#eef2f7] bg-[#fbfcff] p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {card.originalMail.body || 'Original message body unavailable.'}
            </p>
          </div>

          <div className="mt-5">
            <button
              onClick={() => setShowTechnicalDetails((current) => !current)}
              className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
            >
              {showTechnicalDetails ? 'Hide technical details' : 'Show technical details'}
            </button>
            {showTechnicalDetails ? (
              <div className="mt-3 rounded-[18px] border border-[#eef2f7] bg-white p-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Message ID:</span> {card.originalMail.messageId || 'Unavailable'}</p>
                <p className="mt-2"><span className="font-semibold text-slate-900">Delivered to:</span> {(card.originalMail.recipients || []).join(', ') || 'Unavailable'}</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function StatusChip({ label, tone }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionToneClasses(tone)}`}>
      {label}
    </span>
  );
}

function EmptyInboxState({ emptyState, onOpenSettings, onStartSampleFlow }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d8dfeb] bg-[#fbfcfe] px-6 py-10">
      <h2 className="font-sans text-[1.4rem] font-semibold tracking-[-0.03em] text-slate-950">
        {emptyState.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        {emptyState.description}
      </p>
      {emptyState.steps.length > 0 ? (
        <ul className="mt-5 space-y-3 text-left text-sm text-slate-600">
          {emptyState.steps.map((step) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {emptyState.actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onStartSampleFlow}>
            {emptyState.actions[0].label}
          </Button>
          <Button variant="primary" onClick={onOpenSettings}>
            {emptyState.actions[1].label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function formatClassificationLabel(value) {
  if (value === 'brand_update') return 'Brand update';
  if (value === 'needs_routing') return 'Needs routing';
  if (value === 'mixed') return 'Campaign + brand update';
  return 'Campaign brief';
}

function getClassificationClasses(value) {
  if (value === 'brand_update') {
    return 'bg-[#eefaf3] text-[#2f9b63]';
  }

  if (value === 'needs_routing') {
    return 'bg-[#fff8ea] text-[#c48a20]';
  }

  if (value === 'mixed') {
    return 'bg-[#eef4ff] text-[var(--brand-primary)]';
  }

  return 'bg-[#f6f8fb] text-slate-500';
}

function getConfidenceClasses(tone) {
  if (tone === 'positive') {
    return 'bg-[#eefaf3] text-[#2f9b63]';
  }

  if (tone === 'warning') {
    return 'bg-[#fff8ea] text-[#c48a20]';
  }

  return 'bg-[#f6f8fb] text-slate-500';
}

function getActionToneClasses(status) {
  if (status === 'done') {
    return 'bg-[#eefaf3] text-[#2f9b63]';
  }

  if (status === 'dismissed') {
    return 'bg-[#f6f8fb] text-slate-500';
  }

  return 'bg-[#eef4ff] text-[var(--brand-primary)]';
}

function getThreadStatusView(statuses) {
  if (statuses.includes('pending')) {
    return { label: 'pending', classes: 'bg-[#eef4ff] text-[var(--brand-primary)]' };
  }

  if (statuses.includes('used')) {
    return { label: 'used', classes: 'bg-[#eefaf3] text-[#2f9b63]' };
  }

  return { label: 'dismissed', classes: 'bg-[#f6f8fb] text-slate-500' };
}

function formatActionStatus(status) {
  if (status === 'done') return 'Done';
  if (status === 'dismissed') return 'Dismissed';
  return 'Needs review';
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

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

function formatLongDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
