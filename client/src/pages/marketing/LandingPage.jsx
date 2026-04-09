import { Link } from 'react-router-dom';

const proofPoints = [
  { icon: 'groups', label: 'Built for multi-brand enterprise teams' },
  { icon: 'inventory', label: 'Brand voice stored once, reused every session' },
  { icon: 'share', label: 'LinkedIn and blog workflows in V1' },
  { icon: 'checklist', label: 'Structured review before generation' },
];

const workflowSteps = [
  {
    title: 'Capture the brand',
    body: 'Store brand voice, vocabulary, restrictions, language, and channel rules once so every generation starts with the right context.',
  },
  {
    title: 'Bring in the brief',
    body: 'Turn tagged campaign emails into structured inputs instead of copying, pasting, and re-explaining the same brief every time.',
  },
  {
    title: 'Generate with context',
    body: 'Produce LinkedIn and blog drafts calibrated to the selected brand, ready for review and refinement inside one workflow.',
  },
];

const productDetails = [
  {
    title: 'Brand kits that persist',
    body: 'Each brand keeps its own voice, vocabulary, restrictions, and channel rules so teams stop starting from zero every session.',
  },
  {
    title: 'Brief confirmation before generation',
    body: 'Review extracted context before content is created, so marketers stay in control of what the model is acting on.',
  },
  {
    title: 'Reviewer-first output workflow',
    body: 'BrandOS is designed for review and iteration, not blank-page authoring, so teams move faster without losing oversight.',
  },
];

const brandCards = [
  {
    name: 'BHV Marais',
    market: 'France',
    language: 'French',
    status: 'Active kit',
    statusTone: 'primary',
    tones: ['Editorial', 'Warm'],
    initials: 'BM',
  },
  {
    name: 'La Redoute',
    market: 'Europe',
    language: 'English',
    status: 'Awaiting brief',
    statusTone: 'muted',
    tones: ['Commercial', 'Direct'],
    initials: 'LR',
  },
  {
    name: 'AM.PM',
    market: 'Global',
    language: 'English',
    status: 'Generating draft',
    statusTone: 'info',
    tones: ['Premium', 'Calm'],
    initials: 'A',
  },
];

function MarketingButton({ to, children, variant = 'primary' }) {
  const base =
    'inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200';
  const styles = {
    primary:
      'border border-transparent bg-[var(--brand-primary)] text-white shadow-[0_18px_32px_rgba(37,99,235,0.28)] hover:bg-[var(--brand-primary-hover)]',
    secondary:
      'border border-brand bg-white text-slate-700 shadow-sm hover:bg-slate-50',
  };

  return (
    <Link to={to} className={`${base} ${styles[variant]}`}>
      {children}
    </Link>
  );
}

function SectionEyebrow({ children, tone = 'primary' }) {
  const tones = {
    primary: 'border-[var(--brand-primary-soft)] bg-[rgba(37,99,235,0.05)] text-[var(--brand-primary)]',
    muted: 'border-brand bg-slate-100 text-slate-600',
    surface: 'border-[var(--brand-primary-soft)] bg-white text-[var(--brand-primary)] shadow-sm',
  };

  return (
    <div className={`mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tones[tone]}`}>
      {children}
    </div>
  );
}

function StatusChip({ tone = 'primary', children }) {
  const tones = {
    primary: 'bg-[rgba(37,99,235,0.1)] text-[var(--brand-primary)]',
    muted: 'bg-slate-100 text-slate-500',
    success: 'bg-[rgba(23,138,91,0.12)] text-[var(--brand-success)]',
    info: 'bg-[rgba(37,99,235,0.08)] text-[#3568d4]',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function FeatureIcon({ name }) {
  const className = 'h-4 w-4 text-[var(--brand-primary)]';

  if (name === 'groups') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M16 20a4 4 0 0 0-8 0" />
        <circle cx="12" cy="11" r="3" />
        <path d="M21 20a4 4 0 0 0-3-3.87" />
        <path d="M3 20a4 4 0 0 1 3-3.87" />
      </svg>
    );
  }

  if (name === 'inventory') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M4 7.5h16V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z" />
        <path d="M9 3.5h6" />
        <path d="M8 7.5V5.5h8v2" />
      </svg>
    );
  }

  if (name === 'share') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.9 7.6-4.2" />
        <path d="m8.2 13.1 7.6 4.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M5 12.5 9 16.5 19 6.5" />
      <path d="M19 12v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-[rgba(37,99,235,0.14)] selection:text-[var(--brand-primary)]">
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-[rgba(248,250,252,0.9)] backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-brand-heading text-2xl font-bold tracking-[-0.03em] text-slate-900">
            BrandOS
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900" href="#how-it-works">
              How it works
            </a>
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900" href="#for-teams">
              For teams
            </a>
            <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900" to="/signin">
              Sign in
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/signin" className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-[rgba(37,99,235,0.2)] transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              Start setup
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pb-16 pt-20 lg:pb-24 lg:pt-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="max-w-2xl">
                <SectionEyebrow>Brand memory for enterprise content teams</SectionEyebrow>
                <h1 className="font-brand-heading text-5xl font-bold leading-[1.1] tracking-[-0.04em] text-slate-900 sm:text-6xl lg:text-7xl">
                  One AI workspace that remembers every brand your team manages
                </h1>
                <p className="mb-10 mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                  BrandOS stores each brand&apos;s voice kit, turns tagged campaign briefs into structured inputs, and generates on-brand LinkedIn and blog drafts without re-explaining context every session.
                </p>

                <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                  <MarketingButton to="/signup">Start setup</MarketingButton>
                  <MarketingButton to="/signin" variant="secondary">
                    Sign in
                  </MarketingButton>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  {proofPoints.map((point) => (
                    <div
                      key={point.label}
                      className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white/60 px-4 py-3 backdrop-blur-sm"
                    >
                      <FeatureIcon name={point.icon} />
                      <span>{point.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex w-full items-center justify-center lg:min-h-[700px] lg:justify-end">
                <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_45%)] blur-3xl" />
                <div className="relative w-full max-w-[500px] rounded-[2rem] border border-[#e2e8f0] bg-slate-50 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.16)] transition-transform duration-500 ease-out lg:-rotate-2">
                  <div className="mb-6 flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
                      <h3 className="font-brand-heading text-lg font-semibold text-slate-900">BrandOS Portfolio</h3>
                    </div>
                    <StatusChip tone="primary">3 active brands</StatusChip>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Brand Context</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.05)] p-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">BHV Marais</p>
                            <p className="text-xs text-slate-500">France · French</p>
                          </div>
                          <span className="rounded border border-[rgba(37,99,235,0.2)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--brand-primary)] shadow-sm">
                            Active kit
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] p-3 opacity-60">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">La Redoute</p>
                            <p className="text-xs text-slate-500">Europe · English</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Incoming Brief</h4>
                        <StatusChip tone="success">Tagged from Gmail</StatusChip>
                      </div>

                      <div className="rounded-lg border border-[#e2e8f0] bg-slate-50 p-3">
                        <h5 className="mb-1 text-sm font-semibold text-slate-900">Spring campaign refresh</h5>
                        <p className="mb-3 text-xs leading-relaxed text-slate-600">
                          Key message confirmed, audience matched, and campaign context structured before generation starts.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded border border-[#e2e8f0] bg-white px-2 py-1 text-[10px] text-slate-600">Audience: Young professionals</span>
                          <span className="rounded border border-[#e2e8f0] bg-white px-2 py-1 text-[10px] text-slate-600">Goal: Brand visibility</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[rgba(37,99,235,0.2)] blur-3xl" />
                      <div className="relative z-10 mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Generated Output</h4>
                        <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                          Reviewer first
                        </span>
                      </div>
                      <p className="relative z-10 mb-4 text-sm font-medium text-white">
                        Drafts stay calibrated to the selected brand instead of drifting back to generic AI tone.
                      </p>
                      <div className="relative z-10 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">LinkedIn</p>
                          <p className="text-xs leading-tight text-slate-300">Structured hook, approved vocabulary, and channel rules already applied.</p>
                        </div>
                        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">Blog</p>
                          <p className="text-xs leading-tight text-slate-300">Same brief, same brand kit, different format output with no context loss.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e2e8f0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="rounded-3xl border border-[#e2e8f0] bg-white p-8 shadow-sm lg:p-12">
                <SectionEyebrow tone="muted">Why teams struggle</SectionEyebrow>
                <h2 className="font-brand-heading mb-6 text-3xl font-bold text-slate-900">Every session starts blank.</h2>
                <ul className="space-y-4 text-base text-slate-600 lg:text-lg">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 text-slate-400">−</span>
                    Teams re-explain tone, audience, and restrictions for every brand.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 text-slate-400">−</span>
                    Campaign context gets copied from email into disconnected tools.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 text-slate-400">−</span>
                    Outputs drift toward generic AI language instead of brand-specific voice.
                  </li>
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.05)] p-8 shadow-sm lg:p-12">
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(37,99,235,0.12)] blur-3xl" />
                <div className="relative z-10">
                  <SectionEyebrow>The BrandOS workflow</SectionEyebrow>
                  <h2 className="font-brand-heading mb-6 text-3xl font-bold text-slate-900">One system keeps each brand&apos;s context intact.</h2>
                  <ul className="space-y-4 text-base text-slate-700 lg:text-lg">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-[var(--brand-primary)]">✓</span>
                      Each brand keeps a persistent voice kit instead of starting from zero.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-[var(--brand-primary)]">✓</span>
                      Tagged briefs become structured inputs before generation begins.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-[var(--brand-primary)]">✓</span>
                      Drafts start closer to final because the model works from real brand memory.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-3xl text-center mx-auto">
              <SectionEyebrow>How it works</SectionEyebrow>
              <h2 className="font-brand-heading mb-6 text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                From brand setup to on-brand drafts in one structured workflow
              </h2>
              <p className="text-lg text-slate-600">
                BrandOS is built for marketers who need a clear, repeatable workflow rather than another blank AI canvas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="rounded-3xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(37,99,235,0.1)] text-lg font-bold text-[var(--brand-primary)]">
                    {index + 1}
                  </div>
                  <h3 className="font-brand-heading mb-4 text-2xl font-bold text-slate-900">{step.title}</h3>
                  <p className="leading-relaxed text-slate-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="for-teams" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 max-w-2xl text-center mx-auto">
              <SectionEyebrow>For teams</SectionEyebrow>
              <h2 className="font-brand-heading mb-4 text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                One workspace. Distinct voices.
              </h2>
              <p className="text-lg text-slate-600">
                Keep every brand&apos;s market, language, and tone separate without managing separate systems.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {brandCards.map((card) => (
                <div
                  key={card.name}
                  className="group relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-colors hover:border-[rgba(37,99,235,0.45)] lg:p-8"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {card.initials}
                    </div>
                    <StatusChip tone={card.statusTone}>{card.status}</StatusChip>
                  </div>
                  <h3 className="font-brand-heading mb-6 text-2xl font-bold text-slate-900">{card.name}</h3>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] py-2 text-sm">
                      <span className="text-slate-500">Market</span>
                      <span className="font-medium text-slate-900">{card.market}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] py-2 text-sm">
                      <span className="text-slate-500">Language</span>
                      <span className="font-medium text-slate-900">{card.language}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {card.tones.map((tone) => (
                      <span key={`${card.name}-${tone}`} className="rounded border border-[#e2e8f0] bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                BrandOS keeps brand context separated, so outputs stay aligned instead of blending into one generic voice.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e2e8f0] bg-[rgba(248,250,252,0.8)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <SectionEyebrow tone="muted">Product Detail</SectionEyebrow>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {productDetails.map((detail) => (
                <div key={detail.title} className="rounded-3xl border border-[#e2e8f0] bg-white p-8">
                  <h3 className="font-brand-heading mb-4 text-xl font-bold text-slate-900">{detail.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{detail.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[3rem] border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.05)] p-12 text-center shadow-lg lg:p-20">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(37,99,235,0.05))]" />
              <div className="relative z-10 flex flex-col items-center">
                <SectionEyebrow tone="surface">Start Now</SectionEyebrow>
                <h2 className="font-brand-heading mb-6 text-4xl font-bold text-slate-900 lg:text-5xl">
                  Start building your first brand kit
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
                  Enter BrandOS through setup, store your first brand&apos;s voice kit, and move into generation with context already in place.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <MarketingButton to="/signup">Start setup</MarketingButton>
                  <MarketingButton to="/signin" variant="secondary">
                    Sign in
                  </MarketingButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
          <span className="font-brand-heading text-xl font-bold text-slate-900">BrandOS</span>
          <p className="text-sm text-slate-500">© 2024 BrandOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
