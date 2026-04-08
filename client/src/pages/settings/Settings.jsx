import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Input from '../../components/ui/Input';
import Dropdown from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { buildSettingsViewModel } from '../../lib/settings-view';

const CONTENT_FORMAT_OPTIONS = [
  'LinkedIn only',
  'Blog only',
  'Both',
];

const TONE_STRICTNESS_OPTIONS = [
  'Relaxed',
  'Balanced',
  'Strict',
];

const OUTPUT_LENGTH_OPTIONS = [
  'Concise',
  'Standard',
  'Detailed',
];

const INBOX_VIEW_OPTIONS = [
  'Updates',
  'Threads',
];

export default function Settings() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [settings, setSettings] = useState(null);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', companyName: '' });
  const [workspaceForm, setWorkspaceForm] = useState({ displayName: '' });
  const [inboxForm, setInboxForm] = useState({ forwardingEnabled: true, preferredInboxView: 'Updates', includeOriginalEmail: true });
  const [generationForm, setGenerationForm] = useState({ defaultContentFormat: 'LinkedIn only', toneStrictness: 'Balanced', preferredOutputLength: 'Standard' });
  const [saving, setSaving] = useState({});
  const [aiTest, setAiTest] = useState({ loading: false, result: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const viewModel = useMemo(() => buildSettingsViewModel(settings), [settings]);

  async function loadSettings() {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/settings');
      hydrateForms(res.data.settings);
      setSettings(res.data.settings);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load settings right now.');
    } finally {
      setLoading(false);
    }
  }

  function hydrateForms(nextSettings) {
    setProfileForm(nextSettings.profile);
    setWorkspaceForm({ displayName: nextSettings.workspace.displayName || '' });
    setInboxForm({
      forwardingEnabled: nextSettings.inbox.forwardingEnabled,
      preferredInboxView: titleCase(nextSettings.inbox.preferredInboxView || 'updates'),
      includeOriginalEmail: nextSettings.inbox.includeOriginalEmail,
    });
    setGenerationForm({
      defaultContentFormat: contentFormatLabel(nextSettings.generation.defaultContentFormat),
      toneStrictness: titleCase(nextSettings.generation.toneStrictness || 'balanced'),
      preferredOutputLength: titleCase(nextSettings.generation.preferredOutputLength || 'standard'),
    });
  }

  async function saveSection(section, payload, options = {}) {
    setSaving((current) => ({ ...current, [section]: true }));
    setError('');

    try {
      const res = await api.patch('/settings', payload);
      setSettings(res.data.settings);
      hydrateForms(res.data.settings);

      if (options.refreshAuth) {
        await refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save settings right now.');
    } finally {
      setSaving((current) => ({ ...current, [section]: false }));
    }
  }

  async function handleAiTest() {
    setAiTest({ loading: true, result: null });

    try {
      const res = await api.post('/settings/test-ai');
      setAiTest({
        loading: false,
        result: {
          ok: res.data.ok,
          message: `${res.data.message} ${res.data.latencyMs ? `(${res.data.latencyMs}ms)` : ''}`.trim(),
        },
      });
    } catch {
      setAiTest({
        loading: false,
        result: { ok: false, message: 'Unable to test the AI connection right now.' },
      });
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#667085]">
          Loading your settings...
        </div>
      </AppShell>
    );
  }

  if (!settings) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-[#e7ecf3] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <h1 className="font-brand-heading text-4xl text-[#111827]">Settings</h1>
          <p className="mt-3 text-sm text-[#667085]">{error || 'Unable to load settings right now.'}</p>
          <Button variant="secondary" className="mt-6" onClick={loadSettings}>Retry</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 border-b border-[#eef2f6] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-brand-heading text-4xl text-[#111827]">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#667085]">
              Manage your account, workspace setup, inbox defaults, and BrandOS generation behavior.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusPill status={viewModel.workspaceStatus} />
            <StatusPill status={viewModel.aiStatus} />
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#f3d2d2] bg-[#fff5f5] px-4 py-3 text-sm text-[#a73b3b]">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <SettingsSection
            title="Profile"
            description="Personal details used across your workspace and account identity."
            aside={<StatusPill status={{ label: 'Editable', tone: 'neutral', meta: 'Saved per user' }} />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First name" value={profileForm.firstName} onChange={(e) => setProfileForm((current) => ({ ...current, firstName: e.target.value }))} />
              <Input label="Last name" value={profileForm.lastName} onChange={(e) => setProfileForm((current) => ({ ...current, lastName: e.target.value }))} />
              <Input label="Work email" value={profileForm.email} disabled className="bg-[#f8fafc]" />
              <Input label="Company name" value={profileForm.companyName} onChange={(e) => setProfileForm((current) => ({ ...current, companyName: e.target.value }))} />
            </div>
            <SectionActions>
              <Button
                variant="primary"
                disabled={saving.profile}
                onClick={() => saveSection('profile', { profile: profileForm }, { refreshAuth: true })}
              >
                {saving.profile ? 'Saving...' : 'Save profile'}
              </Button>
            </SectionActions>
          </SettingsSection>

          <SettingsSection
            title="Workspace"
            description="Keep the workspace label and setup state aligned with how your team operates."
            aside={<StatusPill status={viewModel.workspaceStatus} />}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <Input label="Workspace name" value={workspaceForm.displayName} onChange={(e) => setWorkspaceForm({ displayName: e.target.value })} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <MetricCard label="Brands live" value={String(settings.workspace.brandCount)} />
                <MetricCard label="Onboarding" value={settings.workspace.onboardingComplete ? 'Complete' : 'In progress'} />
              </div>
            </div>
            <SectionActions>
              <Button
                variant="primary"
                disabled={saving.workspace}
                onClick={() => saveSection('workspace', { workspace: workspaceForm }, { refreshAuth: true })}
              >
                {saving.workspace ? 'Saving...' : 'Save workspace'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/settings/brands')}>
                Manage brand kits
              </Button>
            </SectionActions>
          </SettingsSection>

          <SettingsSection
            title="Inbox"
            description="Set the defaults for how forwarded stakeholder threads land inside BrandOS."
            aside={<StatusPill status={viewModel.inboxStatus} />}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <ReadonlyField
                  label="BrandOS intake address"
                  value={settings.inbox.intakeEmail || 'Not configured yet'}
                  action={settings.inbox.intakeEmail ? (
                    <button
                      type="button"
                      className="text-sm font-medium text-[var(--brand-primary)]"
                      onClick={() => navigator.clipboard.writeText(settings.inbox.intakeEmail)}
                    >
                      Copy
                    </button>
                  ) : null}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Dropdown
                    label="Default inbox view"
                    options={INBOX_VIEW_OPTIONS}
                    value={inboxForm.preferredInboxView}
                    onChange={(e) => setInboxForm((current) => ({ ...current, preferredInboxView: e.target.value }))}
                  />
                  <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
                    <p className="text-sm font-medium text-[#111827]">Forwarding behavior</p>
                    <div className="mt-4 space-y-3">
                      <CheckboxRow
                        label="Enable forwarded-thread intake"
                        description="Keeps the forwarding path active for this workspace."
                        checked={inboxForm.forwardingEnabled}
                        onChange={(checked) => setInboxForm((current) => ({ ...current, forwardingEnabled: checked }))}
                      />
                      <CheckboxRow
                        label="Keep original mail visible in BrandOS"
                        description="Lets reviewers inspect the source thread alongside extracted updates."
                        checked={inboxForm.includeOriginalEmail}
                        onChange={(checked) => setInboxForm((current) => ({ ...current, includeOriginalEmail: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
                <p className="text-sm font-medium text-[#111827]">Integration status</p>
                <div className="mt-4 space-y-3 text-sm text-[#667085]">
                  <StatusLine label="Gmail support" value={settings.inbox.gmailAvailable ? 'Available' : 'Not configured'} />
                  <StatusLine label="Workspace connection" value={titleCase(settings.inbox.gmailConnectionStatus)} />
                  <p className="rounded-xl bg-white px-3 py-3 text-xs leading-6 text-[#667085]">
                    Forward completed stakeholder threads to the BrandOS intake address and we will extract usable updates into the inbox.
                  </p>
                </div>
              </div>
            </div>
            <SectionActions>
              <Button
                variant="primary"
                disabled={saving.inbox}
                onClick={() => saveSection('inbox', {
                  inbox: {
                    forwardingEnabled: inboxForm.forwardingEnabled,
                    preferredInboxView: inboxForm.preferredInboxView.toLowerCase(),
                    includeOriginalEmail: inboxForm.includeOriginalEmail,
                  },
                })}
              >
                {saving.inbox ? 'Saving...' : 'Save inbox settings'}
              </Button>
            </SectionActions>
          </SettingsSection>

          <SettingsSection
            title="Content Preferences"
            description="Apply your default generation posture whenever you start a new content workflow."
            aside={<StatusPill status={{ label: 'User defaults', tone: 'neutral', meta: 'Applied per account' }} />}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Dropdown
                label="Default content format"
                options={CONTENT_FORMAT_OPTIONS}
                value={generationForm.defaultContentFormat}
                onChange={(e) => setGenerationForm((current) => ({ ...current, defaultContentFormat: e.target.value }))}
              />
              <Dropdown
                label="Tone strictness"
                options={TONE_STRICTNESS_OPTIONS}
                value={generationForm.toneStrictness}
                onChange={(e) => setGenerationForm((current) => ({ ...current, toneStrictness: e.target.value }))}
              />
              <Dropdown
                label="Output length"
                options={OUTPUT_LENGTH_OPTIONS}
                value={generationForm.preferredOutputLength}
                onChange={(e) => setGenerationForm((current) => ({ ...current, preferredOutputLength: e.target.value }))}
              />
            </div>
            <SectionActions>
              <Button
                variant="primary"
                disabled={saving.generation}
                onClick={() => saveSection('generation', {
                  generation: {
                    defaultContentFormat: contentFormatValue(generationForm.defaultContentFormat),
                    toneStrictness: generationForm.toneStrictness.toLowerCase(),
                    preferredOutputLength: generationForm.preferredOutputLength.toLowerCase(),
                  },
                })}
              >
                {saving.generation ? 'Saving...' : 'Save content preferences'}
              </Button>
            </SectionActions>
          </SettingsSection>

          <SettingsSection
            title="AI Status"
            description="BrandOS manages the provider stack for you. Use this section to verify readiness and connection health."
            aside={<StatusPill status={viewModel.aiStatus} />}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Mode" value={settings.ai.platformManaged ? 'Platform-managed' : 'Custom'} />
                <MetricCard label="Provider" value={settings.ai.provider} />
                <MetricCard label="Model" value={settings.ai.model} />
              </div>
              <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
                <p className="text-sm font-medium text-[#111827]">Connection test</p>
                <p className="mt-2 text-sm text-[#667085]">
                  Run a lightweight live check against the configured provider from your current workspace session.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="primary" disabled={aiTest.loading} onClick={handleAiTest}>
                    {aiTest.loading ? 'Testing...' : 'Test AI connection'}
                  </Button>
                  {aiTest.result && (
                    <span className={`text-sm ${aiTest.result.ok ? 'text-[#178A5B]' : 'text-[#c94b4b]'}`}>
                      {aiTest.result.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Security"
            description="Review the authentication methods available on your account and what is enabled at the workspace level."
            aside={<StatusPill status={{ label: 'Access', tone: 'neutral', meta: viewModel.securityMethods.join(' · ') || 'None' }} />}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <SecurityCard title="Google sign-in" active={settings.security.googleConnected} detail={settings.security.googleConnected ? 'Connected to this account' : 'Not connected'} />
              <SecurityCard title="Password sign-in" active={settings.security.passwordEnabled} detail={settings.security.passwordEnabled ? 'Email + password enabled' : 'Unavailable for this account'} />
              <SecurityCard title="Enterprise SSO" active={settings.security.ssoEnabled} detail={settings.security.ssoEnabled ? 'Enabled' : 'Not enabled yet'} />
            </div>
            <SectionActions>
              <Button variant="secondary" onClick={() => navigate('/forgot-password')}>
                Request password reset
              </Button>
            </SectionActions>
          </SettingsSection>
        </div>
      </div>
    </AppShell>
  );
}

function SettingsSection({ title, description, aside, children }) {
  return (
    <section className="rounded-[28px] border border-[#e7ecf3] bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="lg:pr-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-[#111827]">{title}</h2>
            {aside}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function SectionActions({ children }) {
  return (
    <div className="mt-5 flex flex-wrap gap-3 border-t border-[#eef2f6] pt-5">
      {children}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#98a2b3]">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function StatusLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-3">
      <span>{label}</span>
      <span className="font-medium text-[#111827]">{value}</span>
    </div>
  );
}

function ReadonlyField({ label, value, action }) {
  return (
    <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#111827]">{label}</p>
          <p className="mt-2 text-sm text-[#667085]">{value}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

function CheckboxRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-[#cfd8e3] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
      />
      <span>
        <span className="block text-sm font-medium text-[#111827]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[#667085]">{description}</span>
      </span>
    </label>
  );
}

function SecurityCard({ title, active, detail }) {
  return (
    <div className="rounded-2xl border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#111827]">{title}</p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? 'bg-[#e7f8ef] text-[#178A5B]' : 'bg-[#eef2f6] text-[#667085]'}`}>
          {active ? 'Active' : 'Off'}
        </span>
      </div>
      <p className="mt-3 text-sm text-[#667085]">{detail}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const toneClasses = {
    success: 'bg-[#e7f8ef] text-[#178A5B]',
    warning: 'bg-[#fff5df] text-[#b7791f]',
    neutral: 'bg-[#eef2f6] text-[#667085]',
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${toneClasses[status.tone] || toneClasses.neutral}`}>
      <span>{status.label}</span>
      {status.meta ? <span className="font-medium opacity-80">{status.meta}</span> : null}
    </span>
  );
}

function titleCase(value) {
  return String(value || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function contentFormatLabel(value) {
  if (value === 'blog') return 'Blog only';
  if (value === 'both') return 'Both';
  return 'LinkedIn only';
}

function contentFormatValue(value) {
  if (value === 'Blog only') return 'blog';
  if (value === 'Both') return 'both';
  return 'linkedin';
}
