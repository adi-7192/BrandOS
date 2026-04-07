import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', companyName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(form);
      navigate('/onboarding/team');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
          <p className="mt-1 text-sm text-gray-500">Enterprise content generation, calibrated to your brands.</p>
        </div>

        {/* SSO primary */}
        <Button variant="secondary" className="w-full mb-3">
          Continue with SSO — Okta · OneLogin · SAML 2.0
        </Button>
        <Button variant="secondary" className="w-full mb-5">
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
