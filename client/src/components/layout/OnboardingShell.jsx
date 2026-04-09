/**
 * Wrapper for all onboarding screens.
 * Shows phase label top-right and a step dot indicator.
 */
import PlatformTopNav from './PlatformTopNav';

export default function OnboardingShell({ phase, step, totalSteps, children }) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col">
      <PlatformTopNav
        eyebrow={phase || 'Brand setup'}
        meta={totalSteps ? `Step ${step || 1} of ${totalSteps}` : 'Focused flow'}
      />

      {/* Step dots */}
      {totalSteps && (
        <div className="flex justify-center gap-2 pt-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`block h-4 w-4 rounded-full border-2 transition-colors ${
                i + 1 === step
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
                  : i + 1 < step
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]'
                  : 'border-[#e7ebf3] bg-white'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl animate-dashboard-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
