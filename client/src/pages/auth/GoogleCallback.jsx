import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { handleGoogleToken } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/signin?error=google_failed', { replace: true });
      return;
    }

    handleGoogleToken(token).then((user) => {
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding/team', { replace: true });
    }).catch(() => {
      navigate('/signin?error=google_failed', { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Signing you in…</p>
    </div>
  );
}
