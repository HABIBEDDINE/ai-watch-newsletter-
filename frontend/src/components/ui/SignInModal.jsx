// src/components/ui/SignInModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiRegister } from '../../services/api';

const ROLES = [
  { id: 'cto', label: 'CTO' },
  { id: 'innovation_manager', label: 'Innovation Manager' },
  { id: 'strategy_director', label: 'Strategy Director' },
  { id: 'other', label: 'Other' },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignInModal({
  isOpen = false,
  onClose,
  context = '',
  onSuccess,
}) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Determine initial mode from context
  const getInitialMode = () => context === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(getInitialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('cto');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset mode when context changes
  useEffect(() => {
    setMode(getInitialMode());
  }, [context]); // eslint-disable-line react-hooks/exhaustive-deps

  // Theme-based colors
  const colors = {
    modalBg: isDark ? '#1a1a1a' : '#ffffff',
    inputBg: isDark ? '#111111' : '#fafafa',
    inputBorder: isDark ? '#333333' : '#e0e0e0',
    labelColor: '#666666',
    footerNote: isDark ? '#666666' : '#999999',
    textPrimary: isDark ? '#ffffff' : '#111111',
    textSecondary: isDark ? '#aaaaaa' : '#666666',
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('cto');
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleClose = () => {
    resetForm();
    setMode(getInitialMode());
    onClose?.();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiRegister({ full_name: fullName, email, password, role });
      setSuccessMessage('Check your email to verify your account');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('409')) {
        setError('An account with this email already exists');
      } else if (msg.includes('422')) {
        setError("Password doesn't meet requirements");
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  // Title based on context and mode
  const getTitle = () => {
    if (mode === 'register') return 'Create your account';
    if (context === 'login' || !context) return 'Welcome back';
    return `Sign in to access ${context}`;
  };

  // Description based on context and mode
  const getDescription = () => {
    if (mode === 'register') {
      return 'Get full access to AI Trends, Newsletter, reports and more.';
    }
    if (context && context !== 'login') {
      return `${context} is available to signed-in users. It's free.`;
    }
    return 'Sign in to your AI Watch account.';
  };

  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    border: `1.5px solid ${colors.inputBorder}`,
    borderRadius: 6,
    fontSize: 14,
    color: colors.textPrimary,
    background: colors.inputBg,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: colors.labelColor,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  return (
    <div style={{
      display: isOpen ? 'flex' : 'none',
      background: 'rgba(0,0,0,0.7)',
      minHeight: '600px',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'absolute',
      inset: 0,
      zIndex: 200,
    }}>
      {/* Modal box */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.modalBg,
          borderRadius: 10,
          width: 420,
          maxWidth: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Orange stripe */}
        <div style={{
          height: 4,
          background: 'var(--orange)',
          width: '100%',
        }} />

        {/* Body */}
        <div style={{ padding: '36px 40px' }}>
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#cccccc',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Logo */}
          <div style={{ marginBottom: 20 }}>
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#E35B1A',
              letterSpacing: 3,
            }}>
              DXC
            </span>
            <span style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginLeft: 8,
            }}>
              AI Watch
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 8px',
          }}>
            {getTitle()}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 13,
            color: colors.textSecondary,
            margin: '0 0 24px',
          }}>
            {getDescription()}
          </p>

          {/* Success message */}
          {successMessage && (
            <div style={{
              background: '#e6f7ee',
              border: '1px solid #15803d30',
              borderLeft: '3px solid #15803d',
              borderRadius: 6,
              padding: '12px 14px',
              fontSize: 13,
              color: '#15803d',
              marginBottom: 20,
            }}>
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: '#fdf0ef',
              border: '1px solid #c0392b30',
              borderLeft: '3px solid #c0392b',
              borderRadius: 6,
              padding: '10px 14px',
              fontSize: 13,
              color: '#c0392b',
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          {!successMessage && (
            <>
              {/* ══════════════════════════════════════════════════════════════════
                  LOGIN FORM
                  ══════════════════════════════════════════════════════════════════ */}
              {mode === 'login' && (
                <form onSubmit={handleLogin}>
                  {/* Email */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      style={inputStyle}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Your password"
                        style={{ ...inputStyle, paddingRight: 56 }}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: colors.labelColor,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: 'right', marginBottom: 20 }}>
                    <a
                      href="/forgot-password"
                      style={{
                        fontSize: 13,
                        color: '#185FA5',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: 46,
                      background: loading ? '#999999' : '#E35B1A',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>

                  {/* Divider */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '20px 0',
                  }}>
                    <div style={{ flex: 1, height: 1, background: colors.inputBorder }} />
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>or</span>
                    <div style={{ flex: 1, height: 1, background: colors.inputBorder }} />
                  </div>

                  {/* Google button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%',
                      height: 46,
                      background: colors.modalBg,
                      border: `1.5px solid ${colors.inputBorder}`,
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  {/* Footer link */}
                  <p style={{
                    textAlign: 'center',
                    margin: '24px 0 0',
                    fontSize: 14,
                    color: colors.footerNote,
                  }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#E35B1A',
                        padding: 0,
                      }}
                    >
                      Create account
                    </button>
                  </p>
                </form>
              )}

              {/* ══════════════════════════════════════════════════════════════════
                  REGISTER FORM
                  ══════════════════════════════════════════════════════════════════ */}
              {mode === 'register' && (
                <form onSubmit={handleRegister}>
                  {/* Full Name */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      style={inputStyle}
                      autoComplete="name"
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      style={inputStyle}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Create a password"
                        style={{ ...inputStyle, paddingRight: 56 }}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: colors.labelColor,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Your Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      style={{
                        ...inputStyle,
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                      }}
                    >
                      {ROLES.map(r => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: 46,
                      background: loading ? '#999999' : '#E35B1A',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>

                  {/* Divider */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '20px 0',
                  }}>
                    <div style={{ flex: 1, height: 1, background: colors.inputBorder }} />
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>or</span>
                    <div style={{ flex: 1, height: 1, background: colors.inputBorder }} />
                  </div>

                  {/* Google button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%',
                      height: 46,
                      background: colors.modalBg,
                      border: `1.5px solid ${colors.inputBorder}`,
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  {/* Footer link */}
                  <p style={{
                    textAlign: 'center',
                    margin: '24px 0 0',
                    fontSize: 14,
                    color: colors.footerNote,
                  }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#E35B1A',
                        padding: 0,
                      }}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
