export default function Button({ children, variant = 'primary', disabled, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-[var(--brand-primary)]',
    secondary: 'bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:bg-[var(--brand-surface-subtle)] focus:ring-[var(--brand-primary)]',
    teal: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500',
    ghost: 'bg-transparent text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-surface-subtle)] focus:ring-[var(--brand-border)]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
