import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getPostAuthRoute } from '../../lib/auth-flow';

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/auth/google`;

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(
    searchParams.get('error') === 'google_failed' ? 'Google sign-in failed. Please try again.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signIn(form);
      navigate(getPostAuthRoute(user));
    } catch (err) {
      setError(err.response?.data?.message || 'Sign-in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-[24px] border border-brand bg-brand-surface p-8 shadow-brand-sm">
          <div className="mb-8 text-center">
            <h1 className="font-brand-heading text-4xl font-bold tracking-[-0.03em] text-brand">Sign in to BrandOS</h1>
            <p className="mt-3 text-sm leading-7 text-brand-muted">Continue with Google Workspace or sign in with your work email.</p>
          </div>

          <Button variant="secondary" className="mb-5 w-full" onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}>
            Continue with Google Workspace
          </Button>

          <div className="mb-5 flex items-center gap-3">
            <hr className="flex-1 border-brand" />
            <span className="text-xs text-brand-muted">or sign in with work email</span>
            <hr className="flex-1 border-brand" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="email" type="email" label="Work email" value={form.email} onChange={handleChange} required />
            <Input name="password" type="password" label="Password" value={form.password} onChange={handleChange} required />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading} className="mt-1 w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-left text-sm text-brand-muted">
            <Link to="/forgot-password" className="hover:underline">Forgot password?</Link>
          </div>

          <p className="mt-6 text-center text-sm text-brand-muted">
            No account?{' '}
            <Link to="/signup" className="font-medium text-brand underline">Create workspace</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
