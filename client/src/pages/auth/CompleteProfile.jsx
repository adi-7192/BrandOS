import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getPostAuthRoute } from '../../lib/auth-flow';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedUser = await updateProfile({ companyName });
      navigate(getPostAuthRoute(updatedUser), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save workspace details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-[24px] border border-brand bg-brand-surface p-8 shadow-brand-sm">
          <div className="text-center">
            <h1 className="font-brand-heading text-4xl font-bold tracking-[-0.03em] text-brand">
              Finish your workspace
            </h1>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Google sign-in worked. We just need your company details before onboarding starts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input label="Work email" value={user?.email || ''} disabled />
            <Input
              name="companyName"
              label="Company name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full">
              {loading ? 'Saving…' : 'Continue →'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
