import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  LineChart,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workouts',  label: 'Workouts',  icon: Dumbbell },
  { to: '/meals',     label: 'Nutrition', icon: UtensilsCrossed },
  { to: '/insights',  label: 'Insights',  icon: LineChart },
  { to: '/settings',  label: 'Settings',  icon: Settings }
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="app-shell">
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <Dumbbell size={20} />
          </div>
          <div>
            <div className="sidebar-brand-name">FitLog</div>
            <div className="sidebar-brand-sub">Training Log</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">{initial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'Athlete'}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm w-full"
            style={{ justifyContent: 'flex-start', gap: 8 }}
          >
            <LogOut size={14} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header" aria-label="FitLog header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-md)',
                background: 'var(--track)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Dumbbell size={16} aria-hidden="true" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--ink)'
              }}
            >
              FitLog
            </span>
          </div>

          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            <LogOut size={16} aria-hidden="true" />
          </button>
        </header>

        {/* Page content */}
        <main className="page-main">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="mobile-tab-bar" aria-label="Mobile navigation">
          <div className="mobile-tab-bar-inner">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
