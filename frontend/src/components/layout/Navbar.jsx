// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getArticles } from '../../services/api';
import { Sun, Moon, Bell, Menu, PanelLeftClose } from 'lucide-react';

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
  const { user } = useAuth();
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
          height: 64,
          background: 'var(--dxc-darker)',
          borderBottom: '1px solid var(--dxc-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobileView ? '0 16px' : '0 40px',
          gap: 12,
        }}>
          {/* Left: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobileView ? 8 : 12, flexShrink: 0 }}>
            <img
              src="/DXC-logo.png"
              alt="DXC"
              style={{
                height: isMobileView ? 24 : 28,
                width: 'auto',
              }}
            />
            {!isMobileView && (
              <>
                <span style={{
                  width: 1,
                  height: 20,
                  background: 'var(--dxc-border)',
                }} />
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--dxc-muted)',
                }}>
                  AI Watch
                </span>
              </>
            )}
            {/* LIVE badge - smaller on mobile */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255, 180, 118, 0.1)',
              border: '1px solid rgba(255, 180, 118, 0.2)',
              borderRadius: 20,
              padding: isMobileView ? '3px 8px' : '4px 12px',
              marginLeft: isMobileView ? 4 : 10,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--dxc-orange)',
                animation: 'livePulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: isMobileView ? 9 : 10,
                fontWeight: 600,
                color: 'var(--dxc-orange)',
                letterSpacing: 0.5,
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
                      borderBottom: isActive ? '2px solid var(--dxc-orange)' : '2px solid transparent',
                      padding: '20px 0',
                      fontSize: 14,
                      color: isActive ? 'var(--dxc-white)' : 'var(--dxc-muted)',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--dxc-white)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--dxc-muted)'; }}
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
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--dxc-border)',
                borderRadius: 8,
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dxc-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--dxc-orange)';
                e.currentTarget.style.color = 'var(--dxc-orange)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--dxc-border)';
                e.currentTarget.style.color = 'var(--dxc-muted)';
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Login */}
            <button
              onClick={onLoginClick}
              style={{
                background: 'transparent',
                border: '1px solid var(--dxc-border)',
                borderRadius: 8,
                padding: isMobileView ? '6px 12px' : '8px 20px',
                fontSize: isMobileView ? 12 : 13,
                fontWeight: 500,
                color: 'var(--dxc-white)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--dxc-orange)';
                e.currentTarget.style.color = 'var(--dxc-orange)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--dxc-border)';
                e.currentTarget.style.color = 'var(--dxc-white)';
              }}
            >
              Login
            </button>

            {/* Subscribe - hidden on very small screens */}
            {windowWidth > 400 && (
              <button
                onClick={onSubscribeClick}
                style={{
                  background: 'var(--gradient-brand)',
                  border: 'none',
                  borderRadius: 8,
                  padding: isMobileView ? '7px 14px' : '9px 20px',
                  fontSize: isMobileView ? 12 : 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, filter 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
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
  const sidebarWidth = isMobileView ? 0 : (isCollapsed ? 60 : 220);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      zIndex: 99,
      height: 60,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      transition: 'left 250ms ease',
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
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img
            src="/DXC-logo.png"
            alt="DXC"
            style={{
              height: 24,
              width: 'auto',
            }}
          />
          <span style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}>
            AI Watch
          </span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
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
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Bell size={18} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: 'var(--gradient-brand)',
                color: '#FFFFFF',
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
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow)',
              zIndex: 200,
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
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
                    color: 'var(--accent-orange)',
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              </div>

              {/* Notification list */}
              {notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
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
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: notif.read ? 'var(--bg-card)' : 'var(--signal-strong-bg)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: notif.read ? 'transparent' : 'var(--accent-orange)',
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
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
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
                borderTop: '1px solid var(--border)',
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
                    color: 'var(--accent-orange)',
                    cursor: 'pointer',
                  }}
                >
                  View all articles →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
