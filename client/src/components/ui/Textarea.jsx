export default function Textarea({ label, tooltip, error, required, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
          {tooltip && (
            <span className="group relative ml-1 cursor-help text-gray-400 hover:text-gray-600">
              ?
              <span className="absolute left-0 top-6 z-10 hidden w-64 rounded-md bg-gray-900 p-2 text-xs text-white group-hover:block">
                {tooltip}
              </span>
            </span>
          )}
        </label>
      )}
      <textarea
        rows={4}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
