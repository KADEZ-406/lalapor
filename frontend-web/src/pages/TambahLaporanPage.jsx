import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Image as ImageIcon, Upload, FileText, Tag, ArrowLeft, MapPin, Sparkles, Bot, CheckCircle } from 'lucide-react';
import api from '../services/api';
import MapPicker from '../components/MapPicker';

export default function TambahLaporanPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '1',
    description: ''
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // AI Helper State
  const [draftKeywords, setDraftKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateDraft = () => {
    if (!draftKeywords.trim()) return;
    setIsGenerating(true);
    
    // Simulate smart client-side heuristics
    setTimeout(() => {
      const kw = draftKeywords.toLowerCase();
      let matchedCategoryId = categories.length > 0 ? categories[0].id : '1';
      let title;
      let categoryName = '';
      
      // Heuristic rules for smart city reporting
      if (kw.includes('jalan') || kw.includes('lubang') || kw.includes('aspal') || kw.includes('jembatan') || kw.includes('lampu') || kw.includes('rusak')) {
        const infCat = categories.find(c => c.name.toLowerCase().includes('infrastruktur'));
        if (infCat) { matchedCategoryId = infCat.id; categoryName = infCat.name; }
        title = `Perbaikan Infrastruktur: ${draftKeywords}`;
      } else if (kw.includes('sampah') || kw.includes('banjir') || kw.includes('selokan') || kw.includes('kotor') || kw.includes('bau')) {
        const kebCat = categories.find(c => c.name.toLowerCase().includes('kebersihan'));
        if (kebCat) { matchedCategoryId = kebCat.id; categoryName = kebCat.name; }
        title = `Laporan Masalah Kebersihan & Lingkungan: ${draftKeywords}`;
      } else if (kw.includes('maling') || kw.includes('rampok') || kw.includes('keamanan') || kw.includes('mabuk') || kw.includes('preman')) {
        const kamCat = categories.find(c => c.name.toLowerCase().includes('keamanan'));
        if (kamCat) { matchedCategoryId = kamCat.id; categoryName = kamCat.name; }
        title = `Aduan Keamanan Ketertiban Masyarakat: ${draftKeywords}`;
      } else {
        title = `Laporan Warga Terkait: ${draftKeywords}`;
        categoryName = categories.find(c => c.id == matchedCategoryId)?.name || 'Umum';
      }

      const description = `Kepada Yth. Pihak Terkait,

Melalui laporan ini, saya ingin menyampaikan aduan terkait kondisi di lapangan mengenai: ${draftKeywords}.

Kondisi tersebut saat ini sangat mengganggu kenyamanan dan aktivitas warga sekitar. Jika tidak segera ditangani, dikhawatirkan dapat menimbulkan dampak yang lebih buruk atau membahayakan keselamatan umum.

Oleh karena itu, saya memohon bantuan dan tindakan responsif dari instansi berwenang untuk segera meninjau dan menyelesaikan permasalahan ini.

Terima kasih atas perhatian dan pelayanan yang diberikan.`;

      setGeneratedDraft({
        title,
        categoryId: matchedCategoryId,
        categoryName: categoryName || (categories.find(c => c.id == matchedCategoryId)?.name || 'Umum'),
        description
      });
      setIsGenerating(false);
    }, 800);
  };

  const applyDraft = () => {
    if (generatedDraft) {
      setFormData({
        title: generatedDraft.title,
        categoryId: generatedDraft.categoryId,
        description: generatedDraft.description
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category_id', formData.categoryId);
      if (imageFile) {
        data.append('image', imageFile);
      }
      if (location.lat && location.lng) {
        data.append('latitude', location.lat);
        data.append('longitude', location.lng);
      }

      await api.post('/laporan', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create laporan', error);
      alert('Gagal membuat laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Buat Laporan Baru</h1>
        <p className="text-muted">Laporkan masalah di lingkungan sekitar Anda agar segera ditindaklanjuti.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label className="form-label">Judul Laporan</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Misal: Jalan berlubang di depan pasar..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <div style={{ position: 'relative' }}>
                <Tag size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select 
                  name="categoryId" 
                  className="form-control"
                  style={{ paddingLeft: '2.75rem', appearance: 'none' }}
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} style={{ color: 'black' }}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi Lengkap</label>
              <textarea
                name="description"
                className="form-control"
                rows="5"
                placeholder="Jelaskan detail masalah, lokasi akurat, dan situasi saat ini..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--primary)" /> Lokasi Kejadian
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(opsional — klik peta atau gunakan GPS)</span>
              </label>
              <MapPicker value={location} onChange={setLocation} />
            </div>

            <div className="form-group">
              <label className="form-label">Bukti Foto</label>
              
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                background: 'rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                
                {imagePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }} />
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Klik atau drop gambar untuk mengganti</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={30} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Upload foto bukti</p>
                      <p className="text-muted" style={{ fontSize: '0.9rem' }}>PNG, JPG atau WEBP (Maks. 5MB)</p>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      <Upload size={16} /> Pilih File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/dashboard" className="btn btn-secondary">
                Batal
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Kirim Laporan'}
              </button>
            </div>
            
          </form>
        </div>

        {/* Template Generator Panel */}
        <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
              <Bot size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.2rem 0' }}>Generate Template</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Bantu tulis template laporan otomatis</p>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Bingung cara menulis laporan formal? Masukkan saja kata kunci inti masalahnya, biarkan sistem merangkai template untuk Anda secara instan.
          </p>

          <div className="form-group">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Misal: jalan berlubang di margonda bikin motor jatuh"
              value={draftKeywords}
              onChange={e => setDraftKeywords(e.target.value)}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            ></textarea>
          </div>

          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            onClick={handleGenerateDraft}
            disabled={!draftKeywords.trim() || isGenerating}
          >
            <Sparkles size={18} />
            {isGenerating ? 'Menyusun Template...' : 'Buat Template Laporan'}
          </button>

          {generatedDraft && (
            <div style={{ 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '1.25rem', 
              border: '1px solid var(--border)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Saran Kategori</span>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: '600' }}>{generatedDraft.categoryName}</p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Draf Judul</span>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: '600' }}>{generatedDraft.title}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Draf Deskripsi</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {generatedDraft.description}
                </p>
              </div>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--success)', color: 'white', borderColor: 'var(--success)' }}
                onClick={applyDraft}
              >
                <CheckCircle size={18} /> Gunakan Draf Ini
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
