/**
 * Wrapper for all onboarding screens.
 * Shows phase label top-right and a step dot indicator.
 */
export default function OnboardingShell({ phase, step, totalSteps, children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="text-lg font-bold tracking-tight text-gray-900">BrandOS</span>
        {phase && (
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {phase}
          </span>
        )}
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
                  ? 'border-gray-900 bg-gray-900'
                  : i + 1 < step
                  ? 'border-gray-900 bg-gray-100'
                  : 'border-gray-300 bg-white'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
