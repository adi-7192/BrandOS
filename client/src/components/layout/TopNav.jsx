import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <Link to="/dashboard" className="text-lg font-bold tracking-tight text-gray-900">
        BrandOS
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="primary" onClick={() => navigate('/inbox')} className="text-sm">
          + New content
        </Button>
        {user && (
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
