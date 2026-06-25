import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Megaphone, Shield, Activity, CheckCircle, ChevronRight, Users, MessageSquare, ArrowRight, Menu, X, Hash, Clock, Tag } from 'lucide-react';
import api from '../services/api';

export default function LandingPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [publicStats, setPublicStats] = useState({ total: '5.2k+', completion: '98%', avgTime: '< 24 Jam' });
  const [latestFeed, setLatestFeed] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch live feed & dynamic stats
    const fetchPublicData = async () => {
      try {
        const res = await api.get('/laporan', { params: { limit: 100 } });
        const list = res.data.data;
        if (list && list.length > 0) {
          const approved = list.filter(l => l.status === 'approved').length;
          setPublicStats({
            total: list.length.toString(),
            completion: Math.round((approved / list.length) * 100) + '%',
            avgTime: '< 24 Jam' // Mocked for now until timestamps are calculated
          });
          // Ambil 3 laporan terbaru untuk live feed
          setLatestFeed(list.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch public data", err);
      }
    };
    fetchPublicData();
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.3s ease' }}>
      {/* Navbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo_lalapor.png" alt="Lalapor! Logo" width="32" height="32" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: '800' }} className="text-gradient">Lalapor!</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="hide-on-mobile">
          <a href="#tentang" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Tentang</a>
          <a href="#alur" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Alur Kerja</a>
          <a href="#statistik" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Statistik Publik</a>
          <a href="#feed" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Live Feed</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hide-on-mobile">
          <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Ubah Tema">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', height: '40px' }}>
              <span>Dashboard</span>
              <ChevronRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', height: '40px' }}>
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', height: '40px' }}>
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="mobile-nav-toggle show-on-mobile"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu show-on-mobile" style={{ display: 'flex' }}>
            <a href="#tentang" style={{ fontSize: '1rem', color: 'var(--text-main)', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }} onClick={() => setIsMobileMenuOpen(false)}>Tentang</a>
            <a href="#alur" style={{ fontSize: '1rem', color: 'var(--text-main)', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }} onClick={() => setIsMobileMenuOpen(false)}>Alur Kerja</a>
            <a href="#statistik" style={{ fontSize: '1rem', color: 'var(--text-main)', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }} onClick={() => setIsMobileMenuOpen(false)}>Statistik Publik</a>
            <a href="#feed" style={{ fontSize: '1rem', color: 'var(--text-main)', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }} onClick={() => setIsMobileMenuOpen(false)}>Live Feed</a>
            
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {theme === 'light' ? <><Moon size={16} /> <span>Mode Gelap</span></> : <><Sun size={16} /> <span>Mode Terang</span></>}
            </button>

            {user ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem 1.25rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setIsMobileMenuOpen(false)}>
                <span>Dashboard</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.25rem' }}>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1, height: '42px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  Masuk
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1, height: '42px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
      <header className="hero-header">
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(120px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div className="animate-fade-in" style={{ zIndex: 1, maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--primary-glow)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--primary)'
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', animation: 'pulse 2s infinite' }}></span>
            Layanan Pengaduan Masyarakat Digital Terintegrasi
          </div>

          <h1 className="hero-title">
            Suarakan Aspirasi, Bangun <span className="text-gradient">Lingkungan Terbaik</span> Bersama.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            Laporkan kendala infrastruktur, kebersihan, keamanan, atau layanan publik di sekitar Anda secara cepat, transparan, dan langsung ditindaklanjuti oleh instansi berwenang.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(!user || user.role === 'user') && (
              <Link to={user ? "/laporan/baru" : "/login"} className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Buat Laporan Baru
                <ArrowRight size={18} />
              </Link>
            )}
            <Link 
              to={user ? "/dashboard" : "/login"} 
              className={(!user || user.role === 'user') ? "btn btn-secondary" : "btn btn-primary"} 
              style={{ padding: '0.9rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {(!user || user.role === 'user') ? "Lihat Aduan Warga" : "Masuk ke Dashboard"}
              {user && (user.role === 'admin' || user.role === 'super_admin') && <ArrowRight size={18} />}
            </Link>
          </div>
        </div>
      </header>

      <section id="statistik" className="container landing-section">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          zIndex: 1
        }}>
          <div className="glass-panel reveal-on-scroll" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Megaphone size={24} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{publicStats.completion}</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tingkat Penyelesaian Laporan</p>
          </div>

          <div className="glass-panel reveal-on-scroll reveal-delay-1" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Users size={24} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{publicStats.total}</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Total Aduan Warga Aktif</p>
          </div>

          <div className="glass-panel reveal-on-scroll reveal-delay-2" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Activity size={24} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{publicStats.avgTime}</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Waktu Respons Rata-rata</p>
          </div>
        </div>
      </section>

      {/* Public Transparency Feed Section */}
      <section id="feed" className="landing-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800' }} className="text-gradient">Public Transparency Feed</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0.5rem auto 0 auto' }}>Pantau aduan warga terbaru secara real-time. Transparansi adalah komitmen utama kami.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {latestFeed.length > 0 ? latestFeed.map((laporan, idx) => (
              <div key={laporan.id} className={`glass-panel reveal-on-scroll reveal-delay-${idx}`} style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', borderLeft: `4px solid ${laporan.status === 'approved' ? '#10b981' : laporan.status === 'pending' ? '#f59e0b' : '#ef4444'}` }}>
                {laporan.image && (
                  <img src={laporan.image.startsWith('http') ? laporan.image : `http://localhost:5000${laporan.image}`} alt="Preview" width="80" height="80" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12} /> {new Date(laporan.created_at).toLocaleDateString('id-ID')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}><Hash size={12} /> LPR-{new Date(laporan.created_at).getFullYear()}-{laporan.id.toString().padStart(5, '0')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--bg-surface-hover)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}><Tag size={12} /> {laporan.category?.name || 'Umum'}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', fontWeight: '700' }}>{laporan.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{laporan.description}</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span className={`badge ${laporan.status === 'pending' ? 'badge-pending' : laporan.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}>
                    {laporan.status === 'pending' ? 'Menunggu' : laporan.status === 'approved' ? 'Selesai' : 'Ditolak'}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data feed...</div>
            )}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/dashboard" className="btn btn-secondary">Lihat Semua Laporan Warga</Link>
          </div>
        </div>
      </section>

      {/* Alur Kerja Section */}
      <section id="alur" className="landing-section" style={{ backgroundColor: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800' }}>Bagaimana Lalapor! Bekerja?</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0.5rem auto 0 auto' }}>4 langkah mudah dalam menyalurkan aspirasi dan penyelesaian masalah di lingkungan Anda.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem'
          }}>
            <div style={{ position: 'relative' }} className="reveal-on-scroll">
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                fontSize: '4rem',
                fontWeight: '900',
                color: 'var(--border)',
                zIndex: 0,
                opacity: 0.5
              }}>01</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Megaphone size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: '700' }}>Tulis Laporan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Laporkan masalah dengan deskripsi jelas, kategori, foto, dan pin lokasi maps secara akurat.</p>
              </div>
            </div>

            <div style={{ position: 'relative' }} className="reveal-on-scroll reveal-delay-1">
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                fontSize: '4rem',
                fontWeight: '900',
                color: 'var(--border)',
                zIndex: 0,
                opacity: 0.5
              }}>02</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Shield size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: '700' }}>Verifikasi Petugas</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Laporan akan divalidasi oleh petugas admin untuk menghindari spam atau aduan fiktif.</p>
              </div>
            </div>

            <div style={{ position: 'relative' }} className="reveal-on-scroll reveal-delay-2">
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                fontSize: '4rem',
                fontWeight: '900',
                color: 'var(--border)',
                zIndex: 0,
                opacity: 0.5
              }}>03</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Activity size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: '700' }}>Proses Lapangan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Instansi yang berwenang terjun langsung ke lapangan untuk menindaklanjuti kendala Anda.</p>
              </div>
            </div>

            <div style={{ position: 'relative' }} className="reveal-on-scroll reveal-delay-3">
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                fontSize: '4rem',
                fontWeight: '900',
                color: 'var(--border)',
                zIndex: 0,
                opacity: 0.5
              }}>04</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--success)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <CheckCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: '700' }}>Selesai & Transparan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Status aduan berubah menjadi 'Diterima' / Selesai dengan laporan tindak lanjut transparan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature / Tentang Section */}
      <section id="tentang" className="container landing-section">
        <div className="tentang-flex">
          <div style={{ flex: 1, minWidth: '300px' }} className="reveal-on-scroll">
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex'
                }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: '700' }}>Aman & Anonimitas Terjaga</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Kami memastikan data pribadi pelapor terlindungi dengan enkripsi tingkat tinggi.</p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex'
                }}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: '700' }}>Pelacakan Status Realtime</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dapatkan notifikasi progres terbaru langsung dari sistem secara transparan.</p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--primary-glow)',
                  color: 'var(--primary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex'
                }}>
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: '700' }}>Interaksi & Komentar</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Warga lain bisa memberikan dukungan serta berdiskusi tentang laporan yang ada.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1.2, minWidth: '320px' }} className="reveal-on-scroll reveal-delay-1">
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1.5rem' }}>
              Portal Pengaduan Modern, Bersih & Bebas Ribet.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Dengan Lalapor!, warga tidak perlu mengantre di kantor kecamatan atau mengeluh di media sosial tanpa kejelasan tindak lanjut.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Kami menjembatani hubungan antara aspirasi masyarakat langsung ke bagian penanganan teknis daerah dengan cara yang cerdas dan efisien.
            </p>
            <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary" style={{ padding: '0.9rem 2rem' }}>
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '3rem 2rem',
        backgroundColor: 'var(--bg-surface-solid)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo_lalapor.png" alt="Lalapor! Logo" width="24" height="24" style={{ height: '24px', width: 'auto' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: '850', letterSpacing: '-0.02em' }} className="text-gradient">Lalapor!</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            &copy; {new Date().getFullYear()} Lalapor! Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#tentang" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tentang Kami</a>
            <a href="#alur" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Kebijakan Privasi</a>
          </div>
        </div>
      </footer>

      {/* Embedded Animations Style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
