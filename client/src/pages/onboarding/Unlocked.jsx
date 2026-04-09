import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import Button from '../../components/ui/Button';

export default function Unlocked() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brandName, team, contentTypes } = useOnboarding();

  const summaryRows = [
    { label: 'Workspace', value: user?.companyName || '—' },
    { label: 'Team', value: team || '—' },
    { label: 'First brand', value: brandName || '—' },
    { label: 'Formats selected', value: contentTypes.join(', ') || '—' },
  ];

  return (
    <OnboardingShell phase="">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900">You're in. Platform unlocked.</h1>
        <p className="mt-2 text-sm text-gray-500">
          Now let's build <strong>{brandName || 'your brand'}'s</strong> voice kit — so the AI knows exactly how to write for this brand, every time.
        </p>
      </div>

      {/* Phase 1 summary card */}
      <div className="rounded-[20px] border border-[#e7ebf3] bg-[var(--brand-surface-subtle)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 mb-8">
        {summaryRows.map(row => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#e7ebf3] last:border-0">
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
              {row.value}
              <span className="text-green-500 text-xs">✓</span>
            </span>
          </div>
        ))}
      </div>

      <Button variant="primary" className="w-full" onClick={() => navigate('/onboarding/brand-content')}>
        Build brand kit
      </Button>
      <p className="mt-3 text-center text-xs text-[var(--brand-text-muted)]">Phase 2 · 2 steps · takes about 5 minutes</p>
    </OnboardingShell>
  );
}
