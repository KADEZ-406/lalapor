import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, MapPin, MessageSquare, Send, User, CheckCircle, XCircle, Trash2, Bot, ThumbsUp, Hash } from 'lucide-react';
import api from '../services/api';
import MapView from '../components/MapView';

export default function DetailLaporanPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Derive ticketId from laporan via useMemo (no setState needed)
  const ticketId = useMemo(() => {
    if (!laporan) return '';
    return `LPR-${new Date(laporan.created_at).getFullYear()}-${laporan.id.toString().padStart(5, '0')}`;
  }, [laporan]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/laporan/${id}`);
        const data = res.data;
        setLaporan(data);
        setUpvotes(data.upvotesCount || 0);
        setHasUpvoted(!!data.hasUpvoted);
      } catch (error) {
        console.error('Failed to fetch', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpvote = async () => {
    if (!laporan) return;
    try {
      const res = await api.post(`/laporan/${laporan.id}/upvote`);
      setUpvotes(res.data.upvotesCount);
      setHasUpvoted(res.data.hasUpvoted);
    } catch (error) {
      console.error('Failed to upvote', error);
      alert('Gagal mengirimkan dukungan');
    }
  };

  const statusColors = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected'
  };

  const statusText = {
    pending: 'MENUNGGU PROSES',
    approved: 'DITERIMA',
    rejected: 'DITOLAK'
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) return (
    <div className="spinner-container">
      <div className="spinner-ring" />
    </div>
  );
  if (!laporan) return <div style={{ padding: '4rem', textAlign: 'center' }}>Laporan tidak ditemukan.</div>;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      const res = await api.post(`/laporan/${laporan.id}/comments`, { content: commentText });
      const newComment = res.data.data;

      setLaporan({ 
        ...laporan, 
        comments: [...laporan.comments, { ...newComment, created_at: new Date().toISOString(), user: { name: user.name } }]
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to comment', error);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/laporan/${laporan.id}/status`, { status: newStatus });
      setLaporan({ ...laporan, status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDeleteLaporan = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini secara permanen?')) return;
    try {
      await api.delete(`/laporan/${laporan.id}`);
      alert('Laporan berhasil dihapus');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete laporan', error);
      alert(error.response?.data?.message || 'Gagal menghapus laporan');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Kembali ke Halaman Utama
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-gradient detail-title" style={{ marginBottom: '0.2rem', lineHeight: '1.2', fontWeight: '800' }}>{laporan.title}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: '700', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              <Hash size={18} /> {ticketId}
            </span>
          </div>
          <span className={`badge ${statusColors[laporan.status]}`} style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', boxShadow: 'var(--shadow-sm)' }}>
            {statusText[laporan.status]}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={15} /> Dilaporkan oleh: <strong>{laporan.user?.name}</strong></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={15} /> {new Date(laporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700' }}><MapPin size={15} /> {laporan.category?.name || 'Umum'}</div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-surface-solid)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <button 
            onClick={handleUpvote}
            className={`btn ${hasUpvoted ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '48px', fontSize: '1.05rem', padding: '0 2rem' }}
          >
            <ThumbsUp size={20} fill={hasUpvoted ? '#fff' : 'none'} />
            {hasUpvoted ? 'Dukungan Terkirim' : 'Saya Juga Mengalami'}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{upvotes}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Warga mendukung laporan ini</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          {laporan.image && (
            <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <img src={laporan.image.startsWith('http') ? laporan.image : `http://localhost:5000${laporan.image}`} alt={laporan.title} style={{ width: '100%', height: 'auto', maxHeight: '550px', objectFit: 'contain', background: '#000000' }} />
            </div>
          )}
          
          <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontSize: '1.4rem', fontWeight: '800' }}>Deskripsi Laporan</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.05rem' }}>{laporan.description}</p>
        </div>

        {laporan.latitude && laporan.longitude && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', fontWeight: '800' }}>
              <MapPin size={20} color="var(--primary)" /> Lokasi Kejadian
            </h3>
            <MapView laporanList={[laporan]} singleMode={true} />
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={14} /> Koordinat: {parseFloat(laporan.latitude).toFixed(6)}, {parseFloat(laporan.longitude).toFixed(6)}
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '800' }}>Aksi Khusus Petugas (Admin)</h3>
            <div className="detail-admin-actions">
              {laporan.status !== 'approved' && (
                <button className="btn btn-primary" onClick={() => handleUpdateStatus('approved')} style={{ background: '#10b981', color: 'white', border: 'none', height: '44px' }}>
                  <CheckCircle size={18} /> Terima Laporan
                </button>
              )}
              {laporan.status !== 'rejected' && (
                <button className="btn btn-danger" onClick={() => handleUpdateStatus('rejected')} style={{ height: '44px' }}>
                  <XCircle size={18} /> Tolak Laporan
                </button>
              )}
              {user?.role === 'super_admin' && (
                <button className="btn btn-danger" onClick={handleDeleteLaporan} style={{ background: '#ef4444', color: 'white', marginLeft: 'auto', height: '44px' }}>
                  <Trash2 size={18} /> Hapus Laporan
                </button>
              )}
            </div>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: '800' }}>
            <MessageSquare size={22} color="var(--primary)" /> Diskusi & Tanggapan ({laporan.comments?.length || 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {laporan.comments?.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>Belum ada tanggapan atau komentar.</p>
            ) : (
              laporan.comments?.map(comment => {
                const isBot = comment.user?.name === 'Lalapor Bot' || comment.user?.name === 'Lalapor';
                return (
                  <div key={comment.id} className="animate-fade-in" style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: isBot ? 'var(--primary-glow)' : 'var(--bg-surface-solid)',
                    border: isBot ? '1px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isBot ? 'var(--primary)' : 'var(--bg-surface-hover)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      color: isBot ? '#fff' : 'var(--primary)',
                      fontSize: '0.95rem',
                      flexShrink: 0
                    }}>
                      {isBot ? <Bot size={20} /> : (comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U')}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.925rem', color: isBot ? 'var(--primary)' : 'var(--text-main)' }}>
                          {comment.user?.name || 'Masyarakat'}
                          {isBot && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--primary)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>Sistem</span>}
                        </span>
                        {comment.created_at && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(comment.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '2px solid var(--border)', paddingTop: '2rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Tulis Tanggapan Anda</h4>
            <div className="comment-form-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <textarea 
                className="form-control" 
                placeholder="Berikan tanggapan yang konstruktif atau informasi tambahan..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1, minHeight: '90px', resize: 'vertical', padding: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" disabled={!commentText.trim()} style={{ height: '46px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0 1.5rem' }}>
                <Send size={16} /> Kirim
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
