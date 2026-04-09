import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import api from '../../services/api';
import { buildBrandDetailSections } from '../../lib/brand-kits-view';
import { buildResumeSessionItem, buildSessionRoute } from '../../lib/generation-session';
import { buildBrandDeleteConfirmation, buildCampaignDeleteConfirmation } from '../../lib/destructive-actions';
import DangerConfirmModal from '../../components/ui/DangerConfirmModal';
import Button from '../../components/ui/Button';

export default function BrandEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showResumePicker, setShowResumePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');
  const [brandDeleteState, setBrandDeleteState] = useState({ open: false, loading: false });
  const [sessionDeleteState, setSessionDeleteState] = useState({ open: false, loading: false, session: null });

  useEffect(() => {
    api.get(`/brands/${id}`)
      .then((res) => setBrand(res.data.brand))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.get(`/generate/sessions?brandId=${id}&status=in_progress`)
      .then((res) => setSessions(res.data.sessions || []))
      .catch(() => setSessions([]));
  }, [id]);

  const detail = useMemo(() => (brand ? buildBrandDetailSections(brand) : null), [brand]);
  const resumableSessions = useMemo(() => sessions.map(buildResumeSessionItem), [sessions]);
  const brandDeleteConfirmation = useMemo(
    () => buildBrandDeleteConfirmation({ brandName: brand?.name }),
    [brand?.name]
  );
  const sessionDeleteConfirmation = useMemo(
    () => buildCampaignDeleteConfirmation({ sessionTitle: sessionDeleteState.session?.sessionTitle || sessionDeleteState.session?.brandName }),
    [sessionDeleteState.session]
  );

  const closeBrandDelete = () => {
    if (brandDeleteState.loading) return;
    setBrandDeleteState({ open: false, loading: false });
  };

  const closeSessionDelete = () => {
    if (sessionDeleteState.loading) return;
    setSessionDeleteState({ open: false, loading: false, session: null });
  };

  const handleDeleteBrand = async () => {
    setDeleteError('');
    setBrandDeleteState({ open: true, loading: false });
  };

  const confirmDeleteBrand = async () => {
    setDeleteError('');
    setBrandDeleteState({ open: true, loading: true });

    try {
      await api.delete(`/brands/${brand.id}`);
      navigate('/settings/brands', { replace: true });
    } catch {
      setDeleteError('We could not delete this brand kit right now. Please try again.');
      setBrandDeleteState({ open: true, loading: false });
    }
  };

  const handleDeleteSession = (session) => {
    setDeleteError('');
    setSessionDeleteState({ open: true, loading: false, session });
  };

  const confirmDeleteSession = async () => {
    if (!sessionDeleteState.session?.id) return;

    setDeleteError('');
    setSessionDeleteState((current) => ({ ...current, loading: true }));

    try {
      await api.delete(`/generate/sessions/${sessionDeleteState.session.id}`);
      setSessions((current) => {
        const nextSessions = current.filter((session) => session.id !== sessionDeleteState.session.id);
        setShowResumePicker((isOpen) => (isOpen ? nextSessions.length > 0 : isOpen));
        return nextSessions;
      });
      closeSessionDelete();
    } catch {
      setDeleteError('We could not delete this campaign right now. Please try again.');
      setSessionDeleteState((current) => ({ ...current, loading: false }));
    }
  };

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
              onClick={() => {
                if (resumableSessions.length > 0) {
                  setShowResumePicker(true);
                  return;
                }

                navigate(`/generate/brief?brandId=${brand.id}`, { state: { mode: 'manual', brand } });
              }}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              Generate content
            </button>
          </div>

          {deleteError ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </div>
          ) : null}

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

          <div className="mt-8 rounded-[24px] border border-red-100 bg-red-50/70 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-500">Danger zone</p>
                <h2 className="mt-2 font-sans text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-950">
                  Delete brand kit
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  This permanently deletes this brand kit and all related campaign work, saved drafts, inbox briefs, and uploaded guideline files for {brand.name}.
                </p>
              </div>
              <Button type="button" variant="danger" onClick={handleDeleteBrand}>
                Delete brand kit
              </Button>
            </div>
          </div>

          {showResumePicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
              <div className="w-full max-w-xl rounded-[28px] border border-[#e7ebf3] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-sans text-[1.5rem] font-semibold tracking-[-0.03em] text-slate-950">
                      Resume work for {brand.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      You already have in-progress sessions for this brand. Resume one or start a new campaign.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResumePicker(false)}
                    className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {resumableSessions.map((session) => {
                    const fullSession = sessions.find((entry) => entry.id === session.id);

                    return (
                      <div
                        key={session.id}
                        className="rounded-2xl border border-[#e7ebf3] px-4 py-4 transition-colors hover:bg-[#fafcff]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{session.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{session.subtitle}</p>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{formatUpdatedAt(session.updatedAt)}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(buildSessionRoute(fullSession))}
                            className="text-sm font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                          >
                            Resume campaign
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(fullSession)}
                            className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                          >
                            Delete campaign
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setShowResumePicker(false)}
                    className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => navigate(`/generate/brief?brandId=${brand.id}`, { state: { mode: 'manual', brand } })}
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)]"
                  >
                    Start new session
                  </button>
                </div>
              </div>
            </div>
          )}

          <DangerConfirmModal
            open={brandDeleteState.open}
            title={brandDeleteConfirmation.title}
            subject={brandDeleteConfirmation.subject}
            description={brandDeleteConfirmation.description}
            warningItems={brandDeleteConfirmation.warningItems}
            confirmLabel={brandDeleteConfirmation.confirmLabel}
            loading={brandDeleteState.loading}
            onCancel={closeBrandDelete}
            onConfirm={confirmDeleteBrand}
          />

          <DangerConfirmModal
            open={sessionDeleteState.open}
            title={sessionDeleteConfirmation.title}
            subject={sessionDeleteConfirmation.subject}
            description={sessionDeleteConfirmation.description}
            warningItems={sessionDeleteConfirmation.warningItems}
            confirmLabel={sessionDeleteConfirmation.confirmLabel}
            loading={sessionDeleteState.loading}
            onCancel={closeSessionDelete}
            onConfirm={confirmDeleteSession}
          />
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

function formatUpdatedAt(value) {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
