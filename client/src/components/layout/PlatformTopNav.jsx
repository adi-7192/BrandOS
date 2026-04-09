import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PLATFORM_NAV_ITEMS } from '../../lib/platform-nav';

export default function PlatformTopNav({ eyebrow, meta }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <nav className="border-b border-[#e7ebf3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2563eb,#5b8cff)] text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)]">
              <span className="text-lg font-semibold">B</span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-slate-950">BrandOS</p>
              <p className="text-xs text-slate-400">Content marketing</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 lg:flex">
            {PLATFORM_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#eef4ff] text-[var(--brand-primary)]'
                      : 'text-slate-500 hover:bg-[#f8fafc] hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {(eyebrow || meta) && (
            <div className="hidden text-right md:block">
              {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p>}
              {meta && <p className="mt-1 text-sm text-slate-500">{meta}</p>}
            </div>
          )}

          <div className="hidden text-right xl:block">
            <p className="text-sm font-medium text-slate-900">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Workspace'}
            </p>
            <p className="text-xs text-slate-400">{user?.companyName || user?.email || 'Workspace'}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
