import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signIn(form);
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding/team');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign-in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to BrandOS</h1>
        </div>

        <Button variant="secondary" className="w-full mb-3">
          Continue with SSO — Okta · OneLogin · SAML 2.0
        </Button>
        <Button variant="secondary" className="w-full mb-5">
          Continue with Google Workspace
        </Button>

        <div className="flex items-center gap-3 mb-5">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">or sign in with work email</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input name="email" type="email" label="Work email" value={form.email} onChange={handleChange} required />
          <Input name="password" type="password" label="Password" value={form.password} onChange={handleChange} required />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading} className="w-full mt-1">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <a href="#" className="hover:underline">Forgot password?</a>
          <a href="#" className="hover:underline">Contact IT admin</a>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/signup" className="text-gray-900 font-medium underline">Create workspace</Link>
        </p>
      </div>
    </div>
  );
}
