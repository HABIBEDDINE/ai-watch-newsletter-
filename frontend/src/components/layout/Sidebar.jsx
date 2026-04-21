// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { icon: '◎', label: 'News Feed', path: '/feed' },
  { icon: '◈', label: 'AI Trends', path: '/trends' },
  { icon: '📰', label: 'DXC Newsletter', path: '/newsletter-dashboard-c', matchPaths: ['/newsletter-dashboard-c', '/dxc-newsletter'] },
  // { icon: '▦', label: 'Data Table', path: '/data' },
  // { icon: '📄', label: 'My Reports', path: '/reports' },
  { icon: '🔖', label: 'Saved Items', path: '/saved' },
  { icon: '✉', label: 'Email Builder', path: '/newsletter' },
  { icon: '◉', label: 'My Profile', path: '/profile' },
];

export default function Sidebar({ isCollapsed = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Check if current path matches any of the item's matchPaths (for DXC Newsletter)
  const isItemActive = (item) => {
    if (item.matchPaths) {
      return item.matchPaths.some(mp => location.pathname.startsWith(mp));
    }
    return location.pathname === item.path;
  };

  return (
    <aside style={{
      width: isCollapsed ? 60 : 220,
      minWidth: isCollapsed ? 60 : 220,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 250ms ease, min-width 250ms ease',
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 100,
    }}>
      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed ? 0 : 12,
                padding: isCollapsed ? '12px 0' : '11px 14px',
                marginBottom: 4,
                borderRadius: 8,
                textDecoration: 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                fontSize: isCollapsed ? 18 : 16,
                width: isCollapsed ? 'auto' : 20,
                textAlign: 'center',
              }}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span style={{
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: User info + logout */}
      <div style={{
        padding: 16,
        borderTop: '1px solid var(--border)',
        background: 'transparent',
        marginTop: 'auto',
        display: 'flex',
        flexDirection: isCollapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: isCollapsed ? 8 : 10,
      }}>
        {/* Avatar */}
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {!isCollapsed && (
          <>
            {/* User info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.email || ''}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginLeft: 'auto',
                transition: 'color 0.15s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={16} />
            </button>
          </>
        )}

        {isCollapsed && (
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              transition: 'color 0.15s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
