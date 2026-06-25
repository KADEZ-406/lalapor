import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Award, Clock, ArrowRight, AlertCircle, Camera } from 'lucide-react';
import api from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [laporanList, setLaporanList] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  
  // Local edit states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(() => {
    return user?.id ? (localStorage.getItem(`lalapor_avatar_${user.id}`) || null) : null;
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setLocalAvatar(base64);
        if (user?.id) {
          localStorage.setItem(`lalapor_avatar_${user.id}`, base64);
          window.dispatchEvent(new Event('avatarChanged'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const res = await api.get('/laporan', { params: { user_id: user?.id, limit: 100 } });
        setLaporanList(res.data.data);
      } catch (err) {
        console.error('Failed to fetch user reports', err);
      } finally {
        setLoadingReports(false);
      }
    };
    if (user?.id) {
      fetchUserReports();
    }
  }, [user]);

  const { login } = useAuth();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.put('/users/profile', { name, email });
      const { token } = res.data;
      
      login(token);
      setSaveSuccess(true);
      setIsEditing(false);

      window.dispatchEvent(new Event('avatarChanged'));
    } catch (err) {
      console.error('Failed to update profile', err);
      alert(err.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Stats calculation
  const totalReports = laporanList.length;
  const approvedReports = laporanList.filter(r => r.status === 'approved').length;
  const pendingReports = laporanList.filter(r => r.status === 'pending').length;

  const statusColors = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected'
  };

  const statusText = {
    pending: 'Menunggu',
    approved: 'Diterima',
    rejected: 'Ditolak'
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Profil Saya</h1>
        <p className="text-muted">Kelola akun dan tinjau riwayat laporan Anda.</p>
      </div>

      {/* Profile Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2rem' }} className="dashboard-grid">
        
        {/* Left Column: Avatar & Basic Details Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Background glowing decorations */}
            <div style={{ position: 'absolute', width: '120px', height: '120px', background: 'var(--primary-glow-strong)', borderRadius: '50%', top: '-20px', left: '-20px', filter: 'blur(30px)', opacity: 0.5 }} />
            
            {/* Animated Avatar */}
            <div className="profile-avatar-wrapper" style={{ marginBottom: '1.5rem', zIndex: 1, cursor: 'pointer', position: 'relative' }} onClick={() => document.getElementById('avatar-upload-input').click()} title="Klik untuk ubah foto profil">
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'var(--bg-surface-solid)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.8rem',
                fontWeight: '800',
                border: '2px solid var(--border)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {localAvatar ? (
                  <img src={localAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  name ? name.charAt(0).toUpperCase() : 'U'
                )}
                
                {/* Camera overlay on hover */}
                <div className="avatar-hover-overlay" style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}>
                  <Camera size={24} />
                </div>
              </div>
              <input 
                type="file" 
                id="avatar-upload-input" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleAvatarChange}
              />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem', zIndex: 1 }}>{name}</h3>
            <span className="badge badge-approved" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '750', letterSpacing: '0.04em', marginBottom: '1.5rem', zIndex: 1 }}>
              {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Masyarakat'}
            </span>

            {/* Profile Info fields */}
            <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={16} className="text-muted" />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Email</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', wordBreak: 'break-all' }}>{email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={16} className="text-muted" />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Peran Akun</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', textTransform: 'capitalize' }}>{user?.role || 'User'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={16} className="text-muted" />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Kontribusi</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{totalReports} Laporan dikirim</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Edit Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Edit Detail Profil</h4>
            
            {saveSuccess && (
              <div className="badge badge-approved animate-fade-in" style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
                Detail profil berhasil disimpan (Simulasi)
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Nama Pengguna</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.4rem', paddingRight: '0.8rem', height: '38px', fontSize: '0.9rem' }}
                    required
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Alamat Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.4rem', paddingRight: '0.8rem', height: '38px', fontSize: '0.9rem' }}
                    required
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 1, height: '38px', fontSize: '0.85rem' }} 
                    onClick={() => {
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                      setIsEditing(false);
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1, height: '38px', fontSize: '0.85rem' }}
                    disabled={saving}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', height: '38px', fontSize: '0.85rem' }} 
                  onClick={() => setIsEditing(true)}
                >
                  Ubah Info Profil
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Statistics Grid & My Reports List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="stats-grid">
            <div className="glass-panel profile-stat-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dikirim</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '0.25rem', marginBottom: 0 }}>{totalReports}</h2>
            </div>
            <div className="glass-panel profile-stat-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--badge-approved-text)' }}>Disetujui</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '0.25rem', marginBottom: 0, color: 'var(--badge-approved-text)' }}>{approvedReports}</h2>
            </div>
            <div className="glass-panel profile-stat-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--badge-pending-text)' }}>Menunggu</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '0.25rem', marginBottom: 0, color: 'var(--badge-pending-text)' }}>{pendingReports}</h2>
            </div>
          </div>

          {/* User's Reports List Card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <Clock size={18} className="text-gradient" /> Riwayat Laporan Saya
            </h4>

            {loadingReports ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat riwayat laporan...</div>
            ) : laporanList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flexGrow: 1, justifyContent: 'center' }}>
                <AlertCircle size={36} style={{ opacity: 0.3, color: 'var(--primary)' }} />
                <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>Anda belum pernah mengirimkan laporan pengaduan.</p>
                {user?.role === 'user' && (
                  <Link to="/laporan/baru" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Kirim Laporan Pertama
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {laporanList.map((laporan) => (
                  <div 
                    key={laporan.id} 
                    className="glass-panel animate-fade-in" 
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-surface-solid)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.25s ease',
                      gap: '1rem',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> {new Date(laporan.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                        {laporan.title}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <span className={`badge ${statusColors[laporan.status]}`} style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem', fontWeight: 'bold' }}>
                        {statusText[laporan.status]}
                      </span>
                      <Link to={`/laporan/${laporan.id}`} style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
