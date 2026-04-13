import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import OnboardingShell from '../../components/layout/OnboardingShell';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { KIT_LIVE_INTENT_QUESTION } from '../../lib/intent-capture';
import { buildKitLiveNextSteps } from '../../lib/kit-live-flow';

export default function S7KitLive() {
  const navigate = useNavigate();
  const ob = useOnboarding();
  const { user, refreshUser } = useAuth();
  const [intentHidden, setIntentHidden] = useState(false);
  const [linkedinAction, setLinkedinAction] = useState({ loading: false, message: '', error: false });
  const [linkedinStatus, setLinkedinStatus] = useState({ loading: true, connected: false });
  const nextSteps = useMemo(
    () => buildKitLiveNextSteps({ linkedinConnected: linkedinStatus.connected }),
    [linkedinStatus.connected]
  );

  const chips = [
    ob.kitCards?.voiceAdjectives?.join(' · '),
    ob.kitCards?.restrictedWords?.length && `${ob.kitCards.restrictedWords.length} restricted words`,
    'LinkedIn + Blog rules active',
    ob.contentGoal,
    [ob.brandLanguage, ob.primaryMarket].filter(Boolean).join(' · '),
    ob.publishingFrequency,
  ].filter(Boolean);

  const hasAnsweredKitLiveIntent = user?.intentState?.answeredQuestionKeys?.includes(KIT_LIVE_INTENT_QUESTION.questionKey);

  useEffect(() => {
    let cancelled = false;

    api.get('/linkedin/status')
      .then((res) => {
        if (cancelled) return;
        setLinkedinStatus({
          loading: false,
          connected: Boolean(res.data.linkedin?.connected),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLinkedinStatus({ loading: false, connected: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ob.confidenceTestResult) return <Navigate to="/onboarding/confidence-test" replace />;

  const handleIntentAnswer = async (answer) => {
    await api.post('/intent', {
      moment: 'kit_live',
      question_key: KIT_LIVE_INTENT_QUESTION.questionKey,
      answer,
    });
    setIntentHidden(true);
    await refreshUser();
  };

  const handleGoToDashboard = () => {
    setIntentHidden(true);
    navigate('/dashboard');
  };

  const handleStepAction = async (actionId) => {
    if (actionId === 'open-inbox-settings') {
      navigate('/settings');
      return;
    }

    if (actionId === 'open-dashboard') {
      handleGoToDashboard();
      return;
    }

    if (actionId === 'open-linkedin-settings') {
      navigate('/settings');
      return;
    }

    if (actionId === 'connect-linkedin') {
      setLinkedinAction({ loading: true, message: '', error: false });

      try {
        const res = await api.get('/linkedin/connect');
        window.location.href = res.data.authUrl;
      } catch (err) {
        setLinkedinAction({
          loading: false,
          message: err.response?.data?.message || 'Unable to start the LinkedIn connection right now.',
          error: true,
        });
      }
    }
  };

  return (
    <OnboardingShell phase="Setup complete">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900">{ob.brandName || 'Your brand'}'s kit is live.</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ready to generate on-brand content — every time, without re-explaining the brief.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {chips.map((chip, i) => (
          <span key={i} className="chip chip-green text-xs">{chip}</span>
        ))}
      </div>

      {!hasAnsweredKitLiveIntent && !intentHidden && (
        <div className="mb-8 rounded-[20px] border border-brand bg-brand-surface-subtle px-4 py-4 text-left animate-dashboard-enter">
          <p className="text-sm font-medium text-brand">{KIT_LIVE_INTENT_QUESTION.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {KIT_LIVE_INTENT_QUESTION.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleIntentAnswer(option)}
                className="rounded-full bg-brand-surface px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:text-brand"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button variant="primary" className="w-full" onClick={handleGoToDashboard}>
          Go to dashboard
        </Button>
        <button onClick={() => navigate('/onboarding/brand-name')} className="text-sm text-center text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-text)] hover:underline">
          Add another brand
        </button>
      </div>

      {linkedinAction.message ? (
        <div className={`mt-6 rounded-[18px] border px-4 py-3 text-sm ${
          linkedinAction.error
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-[#dbe6f3] bg-[#f8fbff] text-slate-700'
        }`}>
          {linkedinAction.message}
        </div>
      ) : null}

      {/* Phase 3 signpost */}
      <div className="mt-8 rounded-[20px] bg-[var(--brand-surface-subtle)] border border-[#e7ebf3] shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4">
        <p className="text-xs font-semibold text-[var(--brand-text-muted)] uppercase tracking-widest mb-2">Complete your setup</p>
        <div className="space-y-3">
          {nextSteps.map((step) => (
            <div key={step.title} className="rounded-[18px] border border-[#e7ecf3] bg-white px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-700">{step.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                </div>
                <Button
                  variant={step.actionId === 'connect-linkedin' ? 'primary' : 'secondary'}
                  disabled={linkedinStatus.loading || (linkedinAction.loading && step.actionId === 'connect-linkedin')}
                  onClick={() => handleStepAction(step.actionId)}
                >
                  {linkedinStatus.loading && (step.actionId === 'connect-linkedin' || step.actionId === 'open-linkedin-settings')
                    ? 'Checking LinkedIn…'
                    : linkedinAction.loading && step.actionId === 'connect-linkedin'
                      ? 'Opening LinkedIn…'
                      : step.actionLabel}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OnboardingShell>
  );
}
