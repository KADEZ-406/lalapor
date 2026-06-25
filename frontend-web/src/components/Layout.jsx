import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Shield, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const loadAvatar = () => {
      if (user?.id) {
        setAvatar(localStorage.getItem(`lalapor_avatar_${user.id}`));
      }
    };
    loadAvatar();
    window.addEventListener('avatarChanged', loadAvatar);
    return () => window.removeEventListener('avatarChanged', loadAvatar);
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s ease'
      }}>
        <Link to="/dashboard" style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }} className="text-gradient">
          <img src="/logo_lalapor.png" alt="Lalapor! Logo" style={{ height: '32px' }} /> Lalapor!
        </Link>
        
        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hide-on-mobile">
          <Link to="/bantuan" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', height: '40px', textDecoration: 'none' }}>
            Bantuan & Kontak
          </Link>
          {/* User profile info */}
          {user && (
            <Link to="/profile" style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border)',
              marginRight: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                overflow: 'hidden',
                border: '1px solid var(--border)'
              }}>
                {avatar ? (
                  <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user.role}
                </span>
              </div>
            </Link>
          )}

          <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Ubah Tema">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {user?.role === 'super_admin' && (
            <Link to="/users" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '40px' }}>
              <Shield size={16} />
              <span>Manajemen User</span>
            </Link>
          )}
          
          <button className="btn btn-danger" onClick={logout} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '40px' }}>
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="mobile-nav-toggle show-on-mobile"
          aria-label="Toggle Menu"
          style={{
            transform: isMobileMenuOpen ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu show-on-mobile" style={{ display: 'flex' }}>
            {user && (
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border)',
                width: '100%',
                marginBottom: '0.25rem',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{user.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {user.role}
                  </span>
                </div>
              </Link>
            )}

            <Link to="/bantuan" className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', marginBottom: '0.5rem', textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
              Bantuan & Kontak
            </Link>

            <button onClick={toggleTheme} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {theme === 'light' ? <><Moon size={16} /> <span>Mode Gelap</span></> : <><Sun size={16} /> <span>Mode Terang</span></>}
            </button>

            {user?.role === 'super_admin' && (
              <Link to="/users" className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '42px' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Shield size={16} />
                <span>Manajemen User</span>
              </Link>
            )}

            <button className="btn btn-danger" onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '42px' }}>
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </nav>
      <main className="container page-wrapper">
        {children}
      </main>
    </>
  );
};

export default Layout;
