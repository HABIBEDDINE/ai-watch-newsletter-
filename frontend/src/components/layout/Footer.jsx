// src/components/layout/Footer.jsx

const FOOTER_LINKS = ['About', 'Privacy', 'API docs', 'Contact', 'LinkedIn'];

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0a0a',
      padding: '40px 80px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Left: Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 3,
              color: '#E35B1A',
            }}>
              DXC
            </span>
            <span style={{
              fontSize: 13,
              color: '#555555',
              marginLeft: 8,
            }}>
              AI Watch
            </span>
          </div>
          <span style={{
            display: 'block',
            fontSize: 10,
            color: '#333333',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            IMPOSSIBLE. DELIVERED.
          </span>
        </div>

        {/* Center: Links */}
        <div style={{
          display: 'flex',
          gap: 24,
        }}>
          {FOOTER_LINKS.map((link) => (
            <span
              key={link}
              style={{
                fontSize: 12,
                color: '#444444',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#888888'}
              onMouseLeave={e => e.currentTarget.style.color = '#444444'}
            >
              {link}
            </span>
          ))}
        </div>

        {/* Right: Copyright */}
        <span style={{
          fontSize: 11,
          color: '#2a2a2a',
        }}>
          © 2026 DXC Technology · AI Watch v4.0
        </span>
      </div>
    </footer>
  );
}
