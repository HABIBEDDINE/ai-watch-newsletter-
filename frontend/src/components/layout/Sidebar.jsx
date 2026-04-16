// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { icon: '◎', label: 'News Feed', path: '/feed' },
  { icon: '◈', label: 'AI Trends', path: '/trends' },
  { icon: '▦', label: 'Data Table', path: '/data' },
  { icon: '📄', label: 'My Reports', path: '/reports' },
  { icon: '🔖', label: 'Saved Items', path: '/saved' },
  { icon: '✉', label: 'Newsletter', path: '/newsletter' },
  { icon: '◉', label: 'My Profile', path: '/profile' },
];

export default function Sidebar({ isCollapsed = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside style={{
      width: isCollapsed ? 60 : 220,
      minWidth: isCollapsed ? 60 : 220,
      height: 'calc(100vh - 60px)',
      position: 'sticky',
      top: 0,
      alignSelf: 'flex-start',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 250ms ease, min-width 250ms ease',
      overflow: 'hidden',
    }}>
      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: isCollapsed ? 0 : 12,
              padding: isCollapsed ? '12px 0' : '10px 14px',
              marginBottom: 4,
              borderRadius: 6,
              textDecoration: 'none',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderLeft: isActive ? '3px solid #185EA5' : '3px solid transparent',
              background: isActive ? '#EEF2FF' : 'transparent',
              color: isActive ? '#185EA5' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.15s ease',
            })}
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
        ))}
      </nav>

      {/* Bottom: User info + logout */}
      <div style={{
        padding: isCollapsed ? '12px 8px' : '16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: isCollapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: isCollapsed ? 8 : 12,
      }}>
        {/* Avatar */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--orange)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#ffffff',
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
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
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
              }}
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
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
