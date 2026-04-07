export default function Input({ label, tooltip, error, required, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
          {tooltip && (
            <span className="group relative ml-1 cursor-help text-gray-400 hover:text-gray-600">
              ?
              <span className="absolute left-0 top-6 z-10 hidden w-56 rounded-md bg-gray-900 p-2 text-xs text-white group-hover:block">
                {tooltip}
              </span>
            </span>
          )}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-soft)] disabled:bg-gray-50 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
