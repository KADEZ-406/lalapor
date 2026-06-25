import { Link } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight, Tag, ImageOff, ThumbsUp, Hash } from 'lucide-react';
import { useState } from 'react';

export default function LaporanCard({ laporan, index }) {
  const statusColors = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected'
  };

  const statusText = {
    pending: 'Menunggu Proses',
    approved: 'Diterima',
    rejected: 'Ditolak'
  };

  const getCategoryStyles = (name) => {
    const category = name?.toLowerCase() || '';
    if (category.includes('infrastruktur')) {
      return { backgroundColor: 'var(--cat-infra-bg)', color: 'var(--cat-infra-text)', border: '1px solid rgba(59, 130, 246, 0.2)' };
    }
    if (category.includes('kebersihan')) {
      return { backgroundColor: 'var(--cat-clean-bg)', color: 'var(--cat-clean-text)', border: '1px solid rgba(16, 185, 129, 0.2)' };
    }
    if (category.includes('keamanan')) {
      return { backgroundColor: 'var(--cat-security-bg)', color: 'var(--cat-security-text)', border: '1px solid rgba(239, 68, 68, 0.2)' };
    }
    if (category.includes('layanan')) {
      return { backgroundColor: 'var(--cat-service-bg)', color: 'var(--cat-service-text)', border: '1px solid rgba(139, 92, 246, 0.2)' };
    }
    return { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
  };

  const categoryStyle = getCategoryStyles(laporan.category?.name);

  // Generate Ticket ID
  const ticketId = `LPR-${new Date(laporan.created_at).getFullYear()}-${laporan.id.toString().padStart(5, '0')}`;

  // Mock Upvote State — use lazy initializers to avoid setState in useEffect
  const [hasUpvoted, setHasUpvoted] = useState(() => localStorage.getItem(`upvote_${laporan.id}`) === 'true');
  const [upvotes, setUpvotes] = useState(() => {
    const voted = localStorage.getItem(`upvote_${laporan.id}`) === 'true';
    return (laporan.id * 17) % 150 + (voted ? 1 : 0);
  });

  const handleUpvote = (e) => {
    e.preventDefault(); // Prevent navigating to detail page
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
      localStorage.removeItem(`upvote_${laporan.id}`);
    } else {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      localStorage.setItem(`upvote_${laporan.id}`, 'true');
    }
  };

  return (
    <Link to={`/laporan/${laporan.id}`} className={`glass-panel card-entrance delay-${(index % 3) + 1}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textDecoration: 'none',
      color: 'inherit'
    }}
    onMouseOver={e => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
      e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.4)';
    }}
    onMouseOut={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}>
      {/* Image Preview with Hover effect */}
      {laporan.image ? (
        <div style={{ height: '200px', width: '100%', overflow: 'hidden', position: 'relative' }}>
          <img
            src={laporan.image.startsWith('http') ? laporan.image : `http://localhost:5000${laporan.image}`}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          <span className={`badge ${statusColors[laporan.status]}`} style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}>
            {statusText[laporan.status]}
          </span>
        </div>
      ) : (
        <div style={{
          height: '140px',
          background: 'linear-gradient(135deg, var(--bg-surface-hover) 0%, var(--border) 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ImageOff size={40} style={{ opacity: 0.25, color: 'var(--text-muted)' }} />
          <span className={`badge ${statusColors[laporan.status]}`} style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}>
            {statusText[laporan.status]}
          </span>
        </div>
      )}

      {/* Card Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Meta Info */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> {new Date(laporan.created_at).toLocaleDateString('id-ID')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-main)', fontWeight: '600' }}>
            <Hash size={12} /> {ticketId}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '700',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            ...categoryStyle
          }}>
            <Tag size={10} /> {laporan.category?.name || 'Umum'}
          </span>
        </div>
        
        {/* Title */}
        <h3 style={{
          fontSize: '1.2rem',
          marginBottom: '0.5rem',
          lineHeight: '1.4',
          fontWeight: '700'
        }}>
          {laporan.title}
        </h3>

        {/* Description */}
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.6',
          marginBottom: '1rem',
          flex: 1
        }}>
          {laporan.description}
        </p>

        {/* Reporter info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            border: '1px solid rgba(79, 70, 229, 0.15)'
          }}>
            {laporan.user?.name ? laporan.user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Dilaporkan oleh: <strong style={{ color: 'var(--text-main)' }}>{laporan.user?.name || 'Masyarakat'}</strong>
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-surface-hover)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
          <button 
            onClick={handleUpvote}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: hasUpvoted ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              padding: '0.25rem'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseOut={e => e.currentTarget.style.color = hasUpvoted ? 'var(--primary)' : 'var(--text-muted)'}
          >
            <ThumbsUp size={16} fill={hasUpvoted ? 'var(--primary)' : 'none'} />
            <span style={{ color: hasUpvoted ? 'var(--primary)' : 'inherit' }}>{upvotes}</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={15} />
            <span>{laporan.comments?.length || 0}</span>
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.9rem',
          fontWeight: '700',
          color: 'var(--primary)'
        }}>
          Detail <ArrowRight size={14} style={{ transition: 'transform 0.2s ease' }} />
        </div>
      </div>
    </Link>
  );
}


