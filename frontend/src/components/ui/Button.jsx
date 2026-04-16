// src/components/ui/Button.jsx

const SIZES = {
  sm: { padding: '6px 12px', fontSize: 12 },
  md: { padding: '10px 20px', fontSize: 14 },
  lg: { padding: '14px 28px', fontSize: 16 },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  disabled = false,
  style = {},
  ...props
}) {
  const sizeStyles = SIZES[size] || SIZES.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 6,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles,
  };

  const variants = {
    primary: {
      background: 'var(--orange)',
      color: '#ffffff',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1.5px solid var(--text-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
  };

  const variantStyle = variants[variant] || variants.primary;

  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.background = 'var(--orange-hover, #c94f16)';
    } else if (variant === 'outline') {
      e.currentTarget.style.background = 'var(--text-primary)';
      e.currentTarget.style.color = '#ffffff';
    } else if (variant === 'ghost') {
      e.currentTarget.style.color = 'var(--orange)';
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.background = 'var(--orange)';
    } else if (variant === 'outline') {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--text-primary)';
    } else if (variant === 'ghost') {
      e.currentTarget.style.color = 'var(--text-secondary)';
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
