// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getArticles } from '../../services/api';
import { Sun, Moon, Bell, LogOut, Menu, PanelLeftClose } from 'lucide-react';

const pulseKeyframes = `
@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

const NAV_LINKS = [
  { label: 'News Feed', path: '/feed', requiresAuth: false },
  { label: 'AI Trends', path: '/trends', requiresAuth: true },
  { label: 'Newsletter', path: '/newsletter', requiresAuth: true },
];

export default function Navbar({
  variant = 'public',
  onLoginClick,
  onSubscribeClick,
  onTrendsClick,
  onNewsletterClick,
  onToggleCollapse,
  isCollapsed,
  isMobile,
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileView = isMobile || windowWidth < 768;

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getArticles({ signal: 'Strong', pageSize: 5 });
        const articles = response.items || [];
        setNotifications(articles.slice(0, 5).map(a => ({
          id: a.id,
          title: a.title,
          source: a.source,
          time: a.published_at,
          read: false,
        })));
      } catch {
        setNotifications([]);
      }
    };
    if (variant === 'dashboard') {
      fetchNotifications();
    }
  }, [variant]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const formatNotifDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNavClick = (link) => {
    if (link.requiresAuth && !user) {
      if (link.path === '/trends' && onTrendsClick) {
        onTrendsClick();
      } else if (link.path === '/newsletter' && onNewsletterClick) {
        onNewsletterClick();
      }
    } else {
      navigate(link.path);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PUBLIC NAVBAR
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === 'public') {
    return (
      <>
        <style>{pulseKeyframes}</style>
        <nav style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 60,
          background: '#0e0e0e',
          borderBottom: '1px solid #1d1d1d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobileView ? '0 16px' : '0 40px',
          gap: 12,
        }}>
          {/* Left: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobileView ? 8 : 12, flexShrink: 0 }}>
            <span style={{
              fontSize: isMobileView ? 18 : 22,
              fontWeight: 600,
              color: '#E35B1A',
              letterSpacing: isMobileView ? 2 : 3,
            }}>
              DXC
            </span>
            {!isMobileView && (
              <>
                <span style={{
                  width: 1,
                  height: 20,
                  background: '#2a2a2a',
                }} />
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#cccccc',
                }}>
                  AI Watch
                </span>
              </>
            )}
            {/* LIVE badge - smaller on mobile */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#1a0a00',
              border: '1px solid #3a1a00',
              borderRadius: 4,
              padding: isMobileView ? '3px 6px' : '4px 10px',
              marginLeft: isMobileView ? 4 : 8,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#E35B1A',
                animation: 'livePulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: isMobileView ? 9 : 10,
                fontWeight: 600,
                color: '#E35B1A',
                letterSpacing: 1,
              }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Center: Nav links - hidden on mobile */}
          {!isMobileView && (
            <div style={{ display: 'flex', gap: 32 }}>
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link)}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #E35B1A' : '2px solid transparent',
                      padding: '18px 0',
                      fontSize: 14,
                      color: isActive ? '#ffffff' : '#777777',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#777777'; }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobileView ? 8 : 12 }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888888',
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Login */}
            <button
              onClick={onLoginClick}
              style={{
                background: 'transparent',
                border: '1.5px solid #ffffff',
                borderRadius: 6,
                padding: isMobileView ? '6px 12px' : '8px 18px',
                fontSize: isMobileView ? 12 : 13,
                fontWeight: 500,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#0e0e0e';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              Login
            </button>

            {/* Subscribe - hidden on very small screens */}
            {windowWidth > 400 && (
              <button
                onClick={onSubscribeClick}
                style={{
                  background: '#E35B1A',
                  border: 'none',
                  borderRadius: 6,
                  padding: isMobileView ? '6px 12px' : '8px 18px',
                  fontSize: isMobileView ? 12 : 13,
                  fontWeight: 500,
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#c94f16'}
                onMouseLeave={e => e.currentTarget.style.background = '#E35B1A'}
              >
                Subscribe
              </button>
            )}
          </div>
        </nav>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DASHBOARD NAVBAR
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: 60,
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
    }}>
      {/* Left: Hamburger + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <span style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#E35B1A',
          letterSpacing: 2,
        }}>
          DXC
        </span>
        <span style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--text-primary)',
        }}>
          AI Watch
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Bell with notification dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: '#E35B1A',
                color: '#fff',
                borderRadius: '50%',
                width: 16,
                height: 16,
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 44,
              right: 0,
              width: 320,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              zIndex: 200,
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                <button
                  onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: '#185EA5',
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              </div>

              {/* Notification list */}
              {notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No new notifications
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <div
                    key={notif.id || i}
                    onClick={() => {
                      setNotifications(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x));
                      setShowNotifications(false);
                      navigate(`/article/${notif.id}`);
                    }}
                    style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid var(--surface)',
                      cursor: 'pointer',
                      background: notif.read ? 'var(--card-bg)' : '#f8f9ff',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: notif.read ? 'transparent' : '#E35B1A',
                        flexShrink: 0,
                        marginTop: 5,
                      }} />
                      <div>
                        <p style={{
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          marginBottom: 4,
                          fontWeight: notif.read ? 400 : 500,
                        }}>
                          {notif.title}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                          {notif.source} · {formatNotifDate(notif.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Footer */}
              <div style={{
                padding: '12px 18px',
                textAlign: 'center',
                borderTop: '1px solid var(--border-color)',
              }}>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/feed');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    color: '#185EA5',
                    cursor: 'pointer',
                  }}
                >
                  View all articles →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#E35B1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: '#ffffff',
          marginLeft: 4,
        }}>
          {getInitials(user?.full_name)}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
