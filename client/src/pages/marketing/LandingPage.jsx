import { Link } from 'react-router-dom';

const proofPoints = [
  'Built for multi-brand enterprise teams',
  'Brand voice stored once, reused every session',
  'LinkedIn and blog workflows in V1',
  'Structured review before generation',
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
    tones: ['Editorial', 'Warm'],
  },
  {
    name: 'La Redoute',
    market: 'Europe',
    language: 'English',
    status: 'Awaiting brief',
    tones: ['Commercial', 'Direct'],
  },
  {
    name: 'AM.PM',
    market: 'Global',
    language: 'English',
    status: 'Generating draft',
    tones: ['Premium', 'Calm'],
  },
];

function MarketingButton({ to, children, variant = 'primary' }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)]';
  const styles = {
    primary:
      'bg-[var(--brand-primary)] text-white shadow-brand-sm hover:bg-[var(--brand-primary-hover)]',
    secondary:
      'border border-brand bg-brand-surface text-brand hover:bg-brand-surface-subtle',
  };

  return (
    <Link to={to} className={`${base} ${styles[variant]}`}>
      {children}
    </Link>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div className="mb-4 inline-flex rounded-full border border-[var(--brand-primary-soft)] bg-[var(--brand-primary-soft)]/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand text-brand">
      <header className="sticky top-0 z-40 border-b border-brand bg-[rgba(247,249,252,0.88)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="font-brand-heading text-xl font-extrabold tracking-[-0.03em] text-brand">
            BrandOS
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-brand-muted md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-brand">
              How it works
            </a>
            <a href="#for-teams" className="transition-colors hover:text-brand">
              For teams
            </a>
            <Link to="/signin" className="transition-colors hover:text-brand">
              Sign in
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/signin" className="hidden text-sm font-medium text-brand-muted transition-colors hover:text-brand sm:inline">
              Sign in
            </Link>
            <MarketingButton to="/signup">Start setup</MarketingButton>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.18),_transparent_45%),radial-gradient(circle_at_top_left,_rgba(143,180,255,0.22),_transparent_35%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="max-w-2xl">
              <SectionEyebrow>Brand Memory for Enterprise Content Teams</SectionEyebrow>
              <h1 className="max-w-3xl text-5xl font-extrabold tracking-[-0.045em] text-brand sm:text-6xl">
                AI with brand memory for teams managing multiple brands
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-muted sm:text-xl">
                BrandOS stores each brand&apos;s voice kit, turns tagged campaign briefs into structured
                inputs, and generates on-brand LinkedIn and blog drafts without re-explaining context every
                session.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MarketingButton to="/signup">Start setup</MarketingButton>
                <MarketingButton to="/signin" variant="secondary">
                  Sign in
                </MarketingButton>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {proofPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-brand bg-brand-surface/90 px-4 py-3 text-sm font-medium text-brand shadow-brand-sm"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_58%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-brand bg-brand-surface shadow-brand">
                <div className="flex items-center justify-between border-b border-brand bg-brand-surface-subtle px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                      Workspace
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-brand">BrandOS Portfolio</h2>
                  </div>
                  <div className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                    3 active brands
                  </div>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[0.84fr_1.16fr]">
                  <div className="rounded-2xl border border-brand bg-brand-surface-subtle p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                      Brand context
                    </p>
                    <div className="mt-4 space-y-3">
                      {brandCards.map((card) => (
                        <div key={card.name} className="rounded-2xl border border-brand bg-brand-surface p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-brand">{card.name}</p>
                              <p className="mt-1 text-xs text-brand-muted">
                                {card.market} · {card.language}
                              </p>
                            </div>
                            <span className="rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-primary)]">
                              {card.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-brand bg-brand-surface p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                          Incoming brief
                        </p>
                        <span className="rounded-full bg-[rgba(23,138,91,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-success)]">
                          Tagged from Gmail
                        </span>
                      </div>
                      <div className="mt-4 rounded-2xl bg-brand-surface-subtle p-4">
                        <p className="text-sm font-semibold text-brand">Spring campaign refresh</p>
                        <p className="mt-2 text-sm leading-6 text-brand-muted">
                          Key message confirmed, audience matched, and campaign context structured before
                          generation starts.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted">
                            Audience: Young professionals
                          </span>
                          <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted">
                            Goal: Brand visibility
                          </span>
                          <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted">
                            Tone: Keep baseline
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-brand bg-[#0f172a] p-4 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                          Generated output
                        </p>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
                          Reviewer first
                        </span>
                      </div>
                      <p className="mt-4 text-base font-semibold">
                        Drafts stay calibrated to the selected brand instead of drifting back to generic AI tone.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/10 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                            LinkedIn
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-100">
                            Structured hook, approved vocabulary, and channel rules already applied.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                            Blog
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-100">
                            Same brief, same brand kit, different format output with no context loss.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-brand bg-brand-surface px-6 py-8 shadow-brand-sm lg:px-10">
            <div className="grid gap-5 md:grid-cols-4">
              {proofPoints.map((point) => (
                <div key={`strip-${point}`} className="border-l border-brand pl-4 first:border-l-0 first:pl-0">
                  <p className="text-sm font-semibold text-brand">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-brand bg-brand-surface p-8 shadow-brand-sm">
              <SectionEyebrow>Why teams struggle</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand">Every session starts blank.</h2>
              <ul className="mt-6 space-y-4 text-base leading-7 text-brand-muted">
                <li>Teams re-explain tone, audience, and restrictions for every brand.</li>
                <li>Campaign context gets copied from email into disconnected tools.</li>
                <li>Outputs drift toward generic AI language instead of brand-specific voice.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] border border-[var(--brand-primary-soft)] bg-[linear-gradient(180deg,rgba(219,234,254,0.7),rgba(255,255,255,0.96))] p-8 shadow-brand-sm">
              <SectionEyebrow>The BrandOS workflow</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand">
                One system keeps each brand&apos;s context intact.
              </h2>
              <ul className="mt-6 space-y-4 text-base leading-7 text-brand-muted">
                <li>Each brand keeps a persistent voice kit instead of starting from zero.</li>
                <li>Tagged briefs become structured inputs before generation begins.</li>
                <li>Drafts start closer to final because the model works from real brand memory.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow>How it works</SectionEyebrow>
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-brand">
                From brand setup to on-brand drafts in one structured workflow
              </h2>
              <p className="mt-4 text-lg leading-8 text-brand-muted">
                BrandOS is built for marketers who need a clear, repeatable workflow rather than another blank AI
                canvas.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="rounded-[1.75rem] border border-brand bg-brand-surface p-8 shadow-brand-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary-soft)] text-lg font-bold text-[var(--brand-primary)]">
                    {index + 1}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-brand">{step.title}</h3>
                  <p className="mt-4 text-base leading-7 text-brand-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="for-teams" className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <SectionEyebrow>For teams</SectionEyebrow>
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-brand">One workspace. Distinct voices.</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-muted">
                Keep every brand&apos;s market, language, and tone separate without managing separate systems.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {brandCards.map((card, index) => (
                <div
                  key={`team-${card.name}`}
                  className={`rounded-[1.9rem] border p-6 shadow-brand-sm transition-transform duration-200 hover:-translate-y-1 ${
                    index === 0
                      ? 'border-[var(--brand-primary-soft)] bg-[linear-gradient(180deg,rgba(219,234,254,0.75),rgba(255,255,255,0.98))]'
                      : 'border-brand bg-brand-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-sm font-bold text-[var(--brand-primary)]">
                      {card.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                      {card.status}
                    </div>
                  </div>

                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-brand">{card.name}</h3>

                  <div className="mt-5 grid gap-3 rounded-2xl border border-brand bg-brand-surface/80 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-brand-muted">Market</span>
                      <span className="font-semibold text-brand">{card.market}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-brand-muted">Language</span>
                      <span className="font-semibold text-brand">{card.language}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tones.map((tone) => (
                      <span
                        key={`${card.name}-${tone}`}
                        className="rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]"
                      >
                        {tone}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-brand bg-brand-surface-subtle px-6 py-5 shadow-brand-sm">
              <p className="text-sm font-medium leading-7 text-brand-muted">
                BrandOS keeps brand context separated, so outputs stay aligned instead of blending into one generic
                voice.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow>Product detail</SectionEyebrow>
            <div className="grid gap-6 lg:grid-cols-3">
              {productDetails.map((detail) => (
                <div key={detail.title} className="rounded-[1.75rem] border border-brand bg-brand-surface p-8 shadow-brand-sm">
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-brand">{detail.title}</h2>
                  <p className="mt-4 text-base leading-7 text-brand-muted">{detail.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 pt-8 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-brand bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(255,255,255,0.96))] p-8 shadow-brand lg:p-12">
            <div className="max-w-3xl">
              <SectionEyebrow>Start now</SectionEyebrow>
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-brand">Start building your first brand kit</h2>
              <p className="mt-4 text-lg leading-8 text-brand-muted">
                Enter BrandOS through setup, store your first brand&apos;s voice kit, and move into generation with
                context already in place.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MarketingButton to="/signup">Start setup</MarketingButton>
              <MarketingButton to="/signin" variant="secondary">
                Sign in
              </MarketingButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
