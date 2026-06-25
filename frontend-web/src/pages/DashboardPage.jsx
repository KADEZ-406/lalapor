import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, ChevronLeft, ChevronRight, Map, LayoutGrid, Megaphone, Activity, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import LaporanCard from '../components/LaporanCard';
import MapView from '../components/MapView';
import { Link } from 'react-router-dom';
import api from '../services/api';

const radius = 36;
const circumference = 2 * Math.PI * radius;

export default function DashboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [laporanList, setLaporanList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'map'
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
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

  const fetchLaporan = useCallback(async (page = 1, currentSearch = search, currentFilter = filter) => {
    setLoading(true);
    try {
      const res = await api.get('/laporan', { 
        params: { 
          page, 
          limit: 6, // 6 fits much better in the 2-column split layout grid
          search: currentSearch, 
          status: currentFilter 
        } 
      });
      setLaporanList(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total
      });
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    let isMounted = true;
    const getStats = async () => {
      try {
        const res = await api.get('/laporan/stats');
        if (!isMounted) return;
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    getStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLaporan(1, search, filter);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, filter, fetchLaporan]);

  // Donut SVG properties
  const totalCount = stats.total;
  const approvedCount = stats.approved;
  const pendingCount = stats.pending;
  const rejectedCount = stats.rejected;
  const resolutionRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  
  const strokeWidth = 8;
  const [ringOffset, setRingOffset] = useState(circumference);

  useEffect(() => {
    const targetOffset = circumference - (resolutionRate / 100) * circumference;
    const timer = setTimeout(() => {
      setRingOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [resolutionRate]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel welcome-banner" style={{
        background: 'linear-gradient(135deg, var(--bg-surface-solid) 0%, var(--primary-glow) 100%)',
        padding: '2.25rem 2rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        {/* Animated fluid glow orbs */}
        <div className="banner-glow-orb" style={{ top: '-120px', right: '-40px', width: '260px', height: '260px' }} />
        <div className="banner-glow-orb" style={{ bottom: '-140px', left: '-60px', animationDelay: '-4s', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' }} />
        
        <div style={{ zIndex: 1, flex: 1, minWidth: '280px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
            Portal Aduan Lalapor!
          </h1>
          <p className="text-muted" style={{ fontSize: '0.95rem', maxWidth: '560px', lineHeight: 1.45 }}>
            Halo <strong>{user?.name || 'Masyarakat'}</strong>. Pantau aduan teraktif atau laporkan kendala fasilitas di sekitar Anda dengan transparan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', zIndex: 1, flexWrap: 'wrap' }}>
          {user?.role === 'user' && (
            <Link to="/laporan/baru" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '42px', padding: '0 1.25rem', borderRadius: 'var(--radius-sm)' }}>
              <Plus size={16} /> Laporan Baru
            </Link>
          )}
          <button
            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode(v => v === 'card' ? 'map' : 'card')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '42px', padding: '0 1.25rem', borderRadius: 'var(--radius-sm)' }}
            title={viewMode === 'map' ? 'Tampilan Kartu' : 'Tampilan Peta'}
          >
            {viewMode === 'map' ? <><LayoutGrid size={15} /> Mode Kartu</> : <><Map size={15} /> Mode Peta</>}
          </button>
        </div>
      </div>



      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: '2rem' }} className="dashboard-grid">
        
        {/* Left Column: Feed, Search, Filters */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Filters Toolbar */}
          <div className="glass-panel dashboard-toolbar">
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Cari aduan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', height: '40px', border: '1px solid var(--border)' }}
              />
            </div>
            <div className="dashboard-toolbar-buttons">
              <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', height: '40px' }}>Semua</button>
              <button className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('pending')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', height: '40px' }}>Menunggu</button>
              <button className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('approved')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', height: '40px' }}>Diterima</button>
            </div>
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="shimmer-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="shimmer-loader" style={{ height: '140px', width: '100%', borderRadius: 'var(--radius-sm)' }} />
                  <div className="shimmer-loader" style={{ height: '16px', width: '45%', borderRadius: '4px' }} />
                  <div className="shimmer-loader" style={{ height: '24px', width: '85%', borderRadius: '4px' }} />
                  <div className="shimmer-loader" style={{ height: '48px', width: '100%', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : viewMode === 'map' ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem' }}>
              <MapView laporanList={laporanList} />
            </div>
          ) : laporanList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Megaphone size={40} style={{ opacity: 0.3, color: 'var(--primary)' }} />
              <span>
                Tidak ada laporan ditemukan. {user?.role === 'user' 
                  ? 'Silakan buat laporan baru atau ubah kata kunci filter.' 
                  : 'Silakan ubah kata kunci filter.'}
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
                {laporanList.map((laporan, index) => (
                  <LaporanCard key={laporan.id} laporan={laporan} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => fetchLaporan(pagination.page - 1, search, filter)}
                    disabled={pagination.page <= 1}
                    style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem' }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="text-muted" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => fetchLaporan(pagination.page + 1, search, filter)}
                    disabled={pagination.page >= pagination.totalPages}
                    style={{ height: '38px', padding: '0 1rem', fontSize: '0.85rem' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* Right Column: Sidebar Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* User profile card */}
          <Link to="/profile" className="glass-panel animate-fade-in" style={{ 
            padding: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px var(--primary-glow-strong)',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              {avatar ? (
                <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '750', color: 'var(--text-main)' }}>{user?.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '1px' }}>
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Masyarakat'}
              </span>
            </div>
          </Link>

          {/* SVG Donut Chart Kinerja Sistem */}
          <div className="glass-panel animate-fade-in delay-1" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '750', marginBottom: '1.25rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <Activity size={15} style={{ color: 'var(--primary)' }} /> Kinerja Sistem
            </h4>
            
            <div style={{ position: 'relative', width: '96px', height: '96px', marginBottom: '1rem' }}>
              <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="var(--border)"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground circle */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                lineHeight: 1.1
              }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{resolutionRate}%</span>
                <br />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Selesai</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              Tingkat penyelesaian aduan yang disetujui dari keseluruhan laporan warga.
            </p>
          </div>

          {/* Status Breakdown Progress Bars */}
          <div className="glass-panel animate-fade-in delay-2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '750', width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: 0 }}>
              Distribusi Aduan
            </h4>
            
            {/* Approved progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--badge-approved-text)' }}>
                  <CheckCircle2 size={13} /> Diterima / Selesai
                </span>
                <span style={{ color: 'var(--text-main)' }}>{approvedCount}</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--success)',
                  width: `${totalCount > 0 ? (approvedCount / totalCount) * 100 : 0}%`,
                  transition: 'width 0.8s ease',
                  borderRadius: 'var(--radius-full)'
                }} />
              </div>
            </div>

            {/* Pending progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--badge-pending-text)' }}>
                  <AlertCircle size={13} /> Menunggu Proses
                </span>
                <span style={{ color: 'var(--text-main)' }}>{pendingCount}</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--warning)',
                  width: `${totalCount > 0 ? (pendingCount / totalCount) * 100 : 0}%`,
                  transition: 'width 0.8s ease',
                  borderRadius: 'var(--radius-full)'
                }} />
              </div>
            </div>

            {/* Rejected progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--badge-rejected-text)' }}>
                  <XCircle size={13} /> Ditolak
                </span>
                <span style={{ color: 'var(--text-main)' }}>{rejectedCount}</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--danger)',
                  width: `${totalCount > 0 ? (rejectedCount / totalCount) * 100 : 0}%`,
                  transition: 'width 0.8s ease',
                  borderRadius: 'var(--radius-full)'
                }} />
              </div>
            </div>
          </div>

          {/* Timeline Panduan Melapor */}
          <div className="glass-panel animate-fade-in delay-3" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '750', width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: 0 }}>
              Alur Pengaduan
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                left: '5px',
                top: '6px',
                bottom: '6px',
                width: '2px',
                background: 'var(--border)'
              }} />
              
              {/* Step 1 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  border: '2px solid var(--bg-surface-solid)'
                }} />
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>1. Kirim Aduan</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Isi judul, deskripsi, kategori, sertakan foto & lokasi pin maps.</div>
              </div>

              {/* Step 2 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  border: '2px solid var(--bg-surface-solid)'
                }} />
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>2. Verifikasi Data</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Petugas meninjau laporan Anda untuk dicocokkan & disetujui.</div>
              </div>

              {/* Step 3 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  border: '2px solid var(--bg-surface-solid)'
                }} />
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>3. Lapangan Ditangani</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Instansi terkait melakukan tindakan lapangan hingga laporan selesai.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {user?.role === 'user' && (
        <Link to="/laporan/baru" className="mobile-fab" title="Buat Laporan Baru">
          <Plus size={24} />
        </Link>
      )}

    </div>
  );
}
