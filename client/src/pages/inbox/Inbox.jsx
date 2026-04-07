import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { buildInboxCounts, groupInboxThreads, pickThreadSource } from '../../lib/inbox-view';

const STATUS_TABS = ['pending', 'used', 'dismissed'];

export default function Inbox() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, used: 0, dismissed: 0 });
  const [activeTab, setActiveTab] = useState('pending');
  const [viewMode, setViewMode] = useState('updates');
  const [selectedSourceCardId, setSelectedSourceCardId] = useState(null);
  const [openThreads, setOpenThreads] = useState({});
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await api.get(`/inbox?status=${status}`);
      const nextCards = res.data.cards || [];
      setCards(nextCards);
      setCounts(res.data.counts || buildInboxCounts(nextCards));
      setSelectedSourceCardId((current) => {
        if (current && nextCards.some((card) => card.id === current)) {
          return current;
        }
        return nextCards[0]?.id || null;
      });
      setOpenThreads({});
    } catch {
      setCards([]);
      setCounts({ pending: 0, used: 0, dismissed: 0 });
      setSelectedSourceCardId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox(activeTab);
  }, [activeTab, loadInbox]);

  const threads = useMemo(() => groupInboxThreads(cards), [cards]);
  const sourceThread = useMemo(
    () => pickThreadSource(cards, selectedSourceCardId),
    [cards, selectedSourceCardId]
  );

  const handleDismiss = async (id) => {
    await api.patch(`/inbox/${id}/status`, { status: 'dismissed' });
    loadInbox(activeTab);
  };

  const handleUseUpdate = (id) => {
    navigate('/generate/brief', { state: { cardIds: [id] } });
  };

  const toggleThread = (threadId) => {
    setOpenThreads((current) => ({
      ...current,
      [threadId]: !current[threadId],
    }));
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
              Forward completed stakeholder conversations to your BrandOS intake address. AI turns each thread into structured, brand-matched updates for review.
            </p>
          </header>

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
                  { id: 'updates', label: 'Extracted updates' },
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

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_420px]">
            <div className="space-y-4">
              {cards.length === 0 ? (
                <EmptyInboxState activeTab={activeTab} />
              ) : viewMode === 'updates' ? (
                cards.map((card, index) => (
                  <UpdateCard
                    key={card.id}
                    card={card}
                    index={index}
                    onUse={() => handleUseUpdate(card.id)}
                    onDismiss={() => handleDismiss(card.id)}
                    onViewSource={() => setSelectedSourceCardId(card.id)}
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
                    onUse={handleUseUpdate}
                    onDismiss={handleDismiss}
                    onViewSource={setSelectedSourceCardId}
                  />
                ))
              )}
            </div>

            <SourcePanel
              sourceThread={sourceThread}
              onUse={handleUseUpdate}
              onViewSourceCard={setSelectedSourceCardId}
            />
          </section>
        </div>
      )}
    </AppShell>
  );
}

function UpdateCard({ card, index, onUse, onDismiss, onViewSource }) {
  const type = inferUpdateType(card);
  const confidence = getConfidenceView(card.overallScore);
  const tags = getCardTags(card);

  return (
    <div
      className="animate-dashboard-enter rounded-[24px] border border-[#e7ebf3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      style={{ animationDelay: `${60 + (index * 45)}ms` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">{card.brandName}</span>
        <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-500">
          {type}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${confidence.classes}`}>
          {confidence.label}
        </span>
      </div>

      <h2 className="mt-3 font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
        {card.emailSubject}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {card.emailFrom} · {formatRelativeTime(card.createdAt)}
      </p>

      <p className="mt-4 max-w-4xl text-[1.02rem] leading-8 text-slate-600">
        {card.excerpt || 'AI extracted an update from this thread and matched it to the brand context.'}
      </p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={`${card.id}-${tag}`} className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-medium text-slate-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={onUse}>
          Use this update
        </Button>
        {card.status === 'pending' && (
          <button onClick={onDismiss} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            Dismiss
          </button>
        )}
        <button onClick={onViewSource} className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]">
          View original mail
        </button>
      </div>
    </div>
  );
}

function ThreadCard({ thread, index, open, onToggle, onUse, onDismiss, onViewSource }) {
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
            <span className="text-sm text-slate-500">{thread.brandName}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusView.classes}`}>
              {statusView.label}
            </span>
            <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-500">
              {thread.updateCount} extracted {thread.updateCount === 1 ? 'update' : 'updates'}
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

      {open && (
        <div className="border-t border-[#eef2f7] bg-[#fcfdff] px-5 py-5">
          <div className="space-y-4">
            {thread.cards.map((card) => (
              <div key={card.id} className="rounded-[20px] border border-[#e7ebf3] bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f6f8fb] px-3 py-1 text-xs font-semibold text-slate-500">
                    {inferUpdateType(card)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getConfidenceView(card.overallScore).classes}`}>
                    {getConfidenceView(card.overallScore).label}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button onClick={() => onUse(card.id)} className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]">
                    Use update
                  </button>
                  {card.status === 'pending' && (
                    <button onClick={() => onDismiss(card.id)} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                      Dismiss
                    </button>
                  )}
                  <button onClick={() => onViewSource(card.id)} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                    View source
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourcePanel({ sourceThread, onUse, onViewSourceCard }) {
  return (
    <div className="animate-dashboard-enter overflow-hidden rounded-[24px] border border-[#e7ebf3] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]" style={{ animationDelay: '180ms' }}>
      <div className="border-b border-[#eef2f7] px-5 py-4 sm:px-6">
        <h2 className="font-sans text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
          Original Mail
        </h2>
      </div>

      {sourceThread ? (
        <div className="px-5 py-5 sm:px-6">
          <h3 className="font-sans text-[1.15rem] font-semibold tracking-[-0.02em] text-slate-950">
            {sourceThread.subject}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {sourceThread.sourceLabel} · {formatLongDate(sourceThread.createdAt)}
          </p>

          <div className="mt-5 rounded-[20px] border border-[#eef2f7] bg-[#fbfcff] p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {sourceThread.emailBody || 'Original message body unavailable.'}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-900">Extracted updates</p>
            <div className="mt-3 space-y-3">
              {sourceThread.cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start justify-between gap-4 rounded-[18px] border border-[#eef2f7] bg-white p-4"
                >
                  <button
                    onClick={() => onViewSourceCard(card.id)}
                    className="flex-1 text-left transition-colors hover:text-slate-900"
                  >
                    <p className="text-sm font-medium text-slate-900">{inferUpdateType(card)}</p>
                    <p className="mt-1 text-sm text-slate-500">{card.excerpt}</p>
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onUse(card.id);
                    }}
                    className="shrink-0 text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-12 text-sm leading-7 text-slate-500">
          Select an update to inspect the original stakeholder thread without leaving BrandOS.
        </div>
      )}
    </div>
  );
}

function EmptyInboxState({ activeTab }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d8dfeb] bg-[#fbfcfe] px-6 py-14 text-center">
      <h2 className="font-sans text-[1.4rem] font-semibold tracking-[-0.03em] text-slate-950">
        No {activeTab} items
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
        Forward a completed stakeholder thread to your BrandOS intake address and AI will turn it into extracted updates for review.
      </p>
    </div>
  );
}

function inferUpdateType(card) {
  const fields = card.matchedFields || [];
  const extracted = card.extractedFields || {};

  if (extracted.toneShift || (fields.includes('tone') && !fields.includes('campaign'))) {
    return 'Brand voice update';
  }

  if (fields.includes('cta') || fields.includes('goal')) {
    return 'CTA / asset request';
  }

  if (fields.includes('audience')) {
    return 'Audience insight';
  }

  return 'Campaign brief';
}

function getCardTags(card) {
  const fields = (card.matchedFields || []).slice(0, 4);
  if (fields.length > 0) {
    return fields.map(formatFieldLabel);
  }

  return Object.values(card.extractedFields || {})
    .filter(Boolean)
    .slice(0, 3)
    .map((value) => String(value));
}

function formatFieldLabel(field) {
  return String(field)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getConfidenceView(score) {
  const value = Number(score || 0);

  if (value >= 0.75) {
    return { label: 'High confidence', classes: 'bg-[#eefaf3] text-[#2f9b63]' };
  }

  if (value >= 0.45) {
    return { label: 'Partial confidence', classes: 'bg-[#fff8ea] text-[#c48a20]' };
  }

  return { label: 'Low confidence', classes: 'bg-[#f6f8fb] text-slate-500' };
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

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
