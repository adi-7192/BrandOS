/**
 * Wrapper for all onboarding screens.
 * Shows phase label top-right and a step dot indicator.
 */
import { useNavigate } from 'react-router-dom';

export default function OnboardingShell({ phase, step, totalSteps, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e7ebf3]">
        <span className="text-lg font-bold tracking-tight text-slate-950">BrandOS</span>
        <div className="flex items-center gap-4">
          {phase && (
            <span className="text-xs font-medium text-[var(--brand-text-muted)] uppercase tracking-wide">
              {phase}
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </div>

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
      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-lg animate-dashboard-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
