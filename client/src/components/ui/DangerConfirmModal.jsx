import { useEffect, useRef, useState } from 'react';
import Button from './Button';

export default function DangerConfirmModal({
  open,
  title,
  subject,
  description,
  warningItems = [],
  confirmLabel = 'Delete permanently',
  cancelLabel = 'Cancel',
  loading = false,
  onCancel,
  onConfirm,
  // When provided, the confirm button is disabled until the user types this string exactly.
  confirmText,
}) {
  const [typedValue, setTypedValue] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTypedValue('');

    // Close on Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Move focus inside the dialog so keyboard users don't lose context
    const firstFocusable = dialogRef.current?.querySelector('button, input, [tabindex="0"]');
    firstFocusable?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]); // onCancel is always the same setter — safe to omit from deps

  if (!open) return null;

  const confirmed = !confirmText || typedValue === confirmText;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="danger-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
    >
      <div className="w-full max-w-lg rounded-[28px] border border-[#e7ebf3] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-500">Permanent delete</p>
            <h2 id="danger-modal-title" className="mt-2 font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-950">
              {title}
            </h2>
            {subject ? (
              <p className="mt-2 text-sm font-medium text-slate-900">{subject}</p>
            ) : null}
            {description ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
          >
            Close
          </button>
        </div>

        {warningItems.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">This will delete</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-red-700">
              {warningItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {confirmText ? (
          <div className="mt-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Type <span className="font-semibold text-slate-900">{confirmText}</span> to confirm
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full rounded-lg border border-[#e7ebf3] px-3 py-2 text-sm text-slate-900 placeholder-slate-300 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              placeholder={confirmText}
              autoComplete="off"
            />
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            {cancelLabel}
          </button>
          <Button type="button" variant="danger" disabled={loading || !confirmed} onClick={onConfirm}>
            {loading ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
