import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', end: true },
    { to: '/inbox', label: 'Inbox', end: true },
    { to: '/settings/brands', label: 'Brands', end: false },
    { to: '/settings', label: 'Settings', end: true },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <nav className="border-b border-brand bg-brand-surface px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <NavLink to="/dashboard" className="font-brand-heading text-xl font-bold tracking-tight text-brand">
            BrandOS
          </NavLink>
          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]'
                      : 'text-brand-muted hover:bg-brand-surface-subtle hover:text-brand'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-brand">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Workspace'}
            </p>
            <p className="text-xs text-brand-muted">{user?.companyName}</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/inbox')} className="text-sm">
            + New content
          </Button>
          {user && (
            <button onClick={handleSignOut} className="text-sm text-brand-muted hover:text-brand">
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
