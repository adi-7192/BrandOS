import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getPostAuthRoute } from '../../lib/auth-flow';
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
  const { signUp } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', companyName: '', password: '' });
  const [intentAnswers, setIntentAnswers] = useState(() => {
    const pending = loadPendingSignupIntent();
    return Object.fromEntries(pending.map((entry) => [entry.questionKey, entry.answer]));
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
          <p className="mt-1 text-sm text-gray-500">Enterprise content generation, calibrated to your brands.</p>
        </div>

        <Button variant="secondary" className="w-full mb-5" onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}>
          Continue with Google Workspace
        </Button>

        <div className="flex items-center gap-3 mb-5">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">or sign up with work email</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
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

          <Button type="submit" variant="primary" disabled={loading} className="w-full mt-1">
            {loading ? 'Creating workspace…' : 'Create workspace'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-1 text-xs text-gray-400 text-center">
          <span>SSO configurable post-setup · GDPR compliant · Enterprise SLA available</span>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-gray-900 font-medium underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
