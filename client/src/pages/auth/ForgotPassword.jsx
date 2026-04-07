import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-brand px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-[24px] border border-brand bg-brand-surface p-8 text-center shadow-brand-sm">
          <h1 className="font-brand-heading text-4xl font-bold tracking-[-0.03em] text-brand">
            Forgot password
          </h1>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Password reset email delivery is not live yet. Leave your work email so this screen behaves like a real request flow for now.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-brand bg-brand-surface-subtle px-5 py-5 text-left">
              <p className="text-sm font-semibold text-brand">Request captured</p>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                Reset links are coming soon. For now, contact your workspace admin and come back once reset delivery is enabled.
              </p>
              <Link to="/signin" className="mt-5 inline-flex text-sm font-medium text-[var(--brand-primary)] hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 text-left">
              <Input
                name="email"
                type="email"
                label="Work email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <Button type="submit" variant="primary" className="mt-2 w-full">
                Request reset
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
