import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { buildAuthEntryView, getPostAuthRoute } from '../../lib/auth-flow';
import {
  SIGNUP_INTENT_QUESTIONS,
  armPendingSignupIntent,
  flushPendingSignupIntent,
  loadPendingSignupIntent,
  savePendingSignupIntent,
  upsertPendingSignupIntent,
} from '../../lib/intent-capture';
import api from '../../services/api';

const GOOGLE_AUTH_URL = '/api/auth/google';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', companyName: '', password: '' });
  const [intentAnswers, setIntentAnswers] = useState(() => {
    const pending = loadPendingSignupIntent();
    return Object.fromEntries(pending.map((entry) => [entry.questionKey, entry.answer]));
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const entryView = buildAuthEntryView('signup');

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signUp(form);
      await flushPendingSignupIntent(api);
      navigate(getPostAuthRoute(user));
    } catch (err) {
      setError(err.response?.data?.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIntentSelect = (questionKey, answer) => {
    const nextAnswers = { ...intentAnswers, [questionKey]: answer };
    setIntentAnswers(nextAnswers);
    armPendingSignupIntent();
    savePendingSignupIntent(
      upsertPendingSignupIntent(loadPendingSignupIntent(), { questionKey, answer })
    );
  };

  return (
    <div className="min-h-screen bg-brand px-4 py-8">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-[24px] border border-brand bg-brand-surface p-8 shadow-brand-sm">
        <div className="mb-8 text-center">
          <h1 className="font-brand-heading text-4xl font-bold tracking-[-0.03em] text-brand">{entryView.title}</h1>
          <p className="mt-3 text-sm leading-7 text-brand-muted">{entryView.subtitle}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-brand-muted">{entryView.nextStep}</p>
        </div>

        <Button variant="secondary" className="mb-5 w-full" onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}>
          Continue with Google Workspace
        </Button>

        <div className="mb-5 flex items-center gap-3">
          <hr className="flex-1 border-brand" />
          <span className="text-xs text-brand-muted">or sign up with work email</span>
          <hr className="flex-1 border-brand" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="firstName" label="First name" value={form.firstName} onChange={handleChange} required />
            <Input name="lastName" label="Last name" value={form.lastName} onChange={handleChange} required />
          </div>
          <Input name="email" type="email" label="Work email" value={form.email} onChange={handleChange} required />
          <Input name="companyName" label="Company name" value={form.companyName} onChange={handleChange} required />
          <Input name="password" type="password" label="Password" value={form.password} onChange={handleChange} required />

          <div className="rounded-[20px] border border-brand bg-brand-surface-subtle px-4 py-4">
            <div className="space-y-4">
              {SIGNUP_INTENT_QUESTIONS.map((question) => (
                <div key={question.questionKey}>
                  <p className="text-sm font-medium text-brand">{question.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleIntentSelect(question.questionKey, option)}
                        className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                          intentAnswers[question.questionKey] === option
                            ? 'bg-[var(--brand-primary)] text-white'
                            : 'bg-brand-surface text-brand-muted hover:text-brand'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading} className="mt-1 w-full">
            {loading ? 'Creating workspace…' : 'Create workspace'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-1 text-center text-xs text-brand-muted">
          <span>SSO configurable post-setup · GDPR compliant · Enterprise SLA available</span>
        </div>

        <p className="mt-5 text-center text-sm text-brand-muted">
          {entryView.switchLabel}{' '}
          <Link to="/signin" className="font-medium text-brand underline">{entryView.switchCta}</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
