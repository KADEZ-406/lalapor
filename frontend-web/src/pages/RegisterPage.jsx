import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle, Award, Megaphone } from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Left Panel: Hero & Stats */}
      <div style={{
        flex: 1.2,
        backgroundImage: "linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(49, 46, 129, 0.95) 100%), url('/auth_illustration.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }} className="hide-on-mobile">
        {/* Abstract shapes in the background */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.15)',
          top: '-10%',
          left: '-10%',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.2)',
          bottom: '-10%',
          right: '-10%',
          filter: 'blur(80px)'
        }} />

        {/* Logo/Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
          <Megaphone size={32} style={{ transform: 'rotate(-10deg)' }} />
          <span style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Lalapor!</span>
        </div>

        {/* Main Pitch */}
        <div style={{ maxWidth: '520px', zIndex: 1, margin: '4rem 0' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', color: '#ffffff' }}>
            Bergabung & Bantu Lingkungan Anda.
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#ddd6fe', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Daftarkan diri Anda untuk menjadi bagian dari solusi. Laporan Anda berharga demi kenyamanan dan keamanan lingkungan bersama.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                <CheckCircle size={20} color="#a78bfa" />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: '500' }}>Registrasi instan dan 100% gratis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                <Award size={20} color="#a78bfa" />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: '500' }}>Pantau setiap progres laporan secara transparan</span>
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <div style={{ display: 'flex', gap: '3rem', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>98%</div>
            <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Laporan Selesai</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>5rb+</div>
            <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Warga Terbantu</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>&lt; 24j</div>
            <div style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Waktu Respons Rata-rata</div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800' }}>Buat Akun Baru</h2>
            <p className="text-muted" style={{ fontSize: '0.95rem' }}>Ayo bergabung demi lingkungan yang lebih baik</p>
          </div>

          {error && (
            <div className="badge badge-rejected" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.925rem' }}>
            <span className="text-muted">Sudah punya akun? </span>
            <Link to="/login" style={{ fontWeight: '700', color: 'var(--primary)' }}>Masuk di sini</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

