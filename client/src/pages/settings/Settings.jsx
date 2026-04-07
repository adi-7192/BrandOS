import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';

export default function Settings() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-brand">
      <TopNav />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-brand mb-2">Settings</h1>
        <p className="text-sm text-brand-muted mb-8">Workspace configuration, brand management, and integration readiness.</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/settings/brands')}
            className="rounded-xl border border-brand bg-brand-surface p-5 text-left hover:border-[var(--brand-primary-soft)] transition-colors shadow-brand-sm">
            <p className="font-semibold text-brand">Brand kits</p>
            <p className="text-sm text-brand-muted mt-1">Manage all your brand kits, voice adjectives, restricted words, and channel rules.</p>
          </button>
          <div className="rounded-xl border border-brand bg-brand-surface p-5 shadow-brand-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand">Gmail integration</p>
                <p className="text-sm text-brand-muted mt-1">Use labelled emails to feed briefs into the inbox workflow.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Setup flow pending</span>
            </div>
          </div>
          <div className="rounded-xl border border-brand bg-brand-surface p-5 shadow-brand-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand">Group layer</p>
                <p className="text-sm text-brand-muted mt-1">Shared rules across brands for teams running a portfolio workflow.</p>
              </div>
              <span className="rounded-full bg-brand-surface-subtle px-3 py-1 text-xs font-semibold text-brand-muted">Next phase</span>
            </div>
          </div>
          <div className="rounded-xl border border-brand bg-brand-surface p-5 shadow-brand-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand">SSO configuration</p>
                <p className="text-sm text-brand-muted mt-1">Google OAuth is live. Enterprise SSO configuration still needs implementation.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Google only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
