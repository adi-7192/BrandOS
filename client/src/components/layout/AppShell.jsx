import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: 'grid', end: true },
  { to: '/settings/brands', label: 'Brand Kits', icon: 'layers', end: false },
  { to: '/inbox', label: 'Inbox', icon: 'inbox', end: true },
  { to: '/settings', label: 'Settings', icon: 'settings', end: true },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <div className="grid min-h-dvh lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="border-b border-[#1b2333] bg-[#0b1020] text-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b border-[#1b2333] px-4 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2563eb,#5b8cff)] text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
                  <span className="text-lg font-semibold">B</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em] text-white">BrandOS</p>
                  <p className="text-xs text-[#8e9ab0]">Content marketing</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto px-3 py-5 lg:overflow-visible">
              <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#657089]">Main</p>
              <div className="flex gap-2 lg:flex-col">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex min-w-fit items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#171f31] text-white'
                          : 'text-[#c2cad8] hover:bg-[#12192a] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <SidebarIcon name={item.icon} active={isActive} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-[#1b2333] px-4 py-5">
              <div className="rounded-2xl bg-[#12192a] px-3 py-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Content manager'}
                </p>
                <p className="mt-1 text-xs text-[#8e9ab0]">{user?.companyName || user?.email || 'Workspace'}</p>
              </div>

              <button
                onClick={handleSignOut}
                className="mt-4 text-sm font-medium text-[#8e9ab0] transition-colors hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="bg-white">
          <div className="border-b border-[#e9edf5]" />
          <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarIcon({ name, active }) {
  const stroke = active ? '#ffffff' : '#a9b4c7';
  const className = 'h-5 w-5 shrink-0';
  return <IconSvg name={name} stroke={stroke} className={className} />;
}

function IconSvg({ name, stroke, className }) {
  if (name === 'grid') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === 'layers') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="m12 4 8 4-8 4-8-4 8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
      </svg>
    );
  }

  if (name === 'inbox') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
        <path d="M4 5.5h16v10.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5Z" />
        <path d="M4 13h4.8a2 2 0 0 0 1.7.95h3a2 2 0 0 0 1.7-.95H20" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3.75v2.5" />
      <path d="m18.187 5.813-1.768 1.768" />
      <path d="M20.25 12h-2.5" />
      <path d="m18.187 18.187-1.768-1.768" />
      <path d="M12 17.75a5.75 5.75 0 1 0 0-11.5 5.75 5.75 0 0 0 0 11.5Z" />
      <path d="m7.581 16.419-1.768 1.768" />
      <path d="M3.75 12h2.5" />
      <path d="m7.581 7.581-1.768-1.768" />
      <path d="M12 17.75v2.5" />
    </svg>
  );
}
