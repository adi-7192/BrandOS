const STEPS = ['Brand content', 'Audience & campaign', 'Extracting', 'Review kit', 'Confidence test'];

export default function KitProgressBar({ activeStep }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`h-1.5 w-full rounded-full transition-colors ${
              i + 1 < activeStep ? 'bg-[var(--brand-primary)]' : i + 1 === activeStep ? 'bg-[var(--brand-primary-soft)]' : 'bg-gray-200'
            }`}
          />
          <span className={`text-[10px] hidden sm:block text-center ${i + 1 === activeStep ? 'text-[var(--brand-primary)] font-medium' : 'text-[var(--brand-text-muted)]'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
