// src/components/layout/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCollapse = () => {
    if (isMobile) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        variant="dashboard"
        onToggleCollapse={handleToggleCollapse}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
      />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Desktop sidebar */}
        {!isMobile && <Sidebar isCollapsed={isCollapsed} />}

        {/* Mobile sidebar overlay */}
        {isMobile && mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                top: 60,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 40,
              }}
            />
            <div style={{
              position: 'fixed',
              top: 60,
              left: 0,
              bottom: 0,
              width: 220,
              zIndex: 45,
              animation: 'slideIn 0.25s ease',
            }}>
              <Sidebar isCollapsed={false} />
            </div>
          </>
        )}

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
          <div
            className="page-content"
            style={{
              padding: isMobile ? 16 : 32,
              background: 'var(--page-bg)',
              minHeight: 'calc(100vh - 60px)',
              flex: 1,
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
