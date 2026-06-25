import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Copy, CheckCircle, ChevronDown, ChevronUp, LifeBuoy, ShieldAlert, Zap, Truck, PhoneCall } from 'lucide-react';

const HelpDirectoryPage = () => {
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const hotlines = [
    { name: 'Panggilan Darurat Nasional', number: '112', icon: <LifeBuoy size={24} /> },
    { name: 'Polisi', number: '110', icon: <ShieldAlert size={24} /> },
    { name: 'Ambulans', number: '118', icon: <Truck size={24} /> },
    { name: 'Pemadam Kebakaran', number: '113', icon: <Zap size={24} /> }, // Replace Zap with Fire if available, but Zap works as emergency
    { name: 'PLN (Gangguan Listrik)', number: '123', icon: <Zap size={24} /> },
  ];

  const faqs = [
    {
      question: 'Bagaimana cara kerja Lalapor!?',
      answer: 'Lalapor! bekerja dengan menerima aduan dari masyarakat, kemudian kami akan meneruskannya ke instansi yang berwenang untuk ditindaklanjuti. Anda dapat memantau status aduan Anda melalui dashboard.'
    },
    {
      question: 'Berapa lama batas waktu peninjauan laporan?',
      answer: 'Laporan biasanya ditinjau dalam waktu kurang dari 24 jam. Jika laporan Anda bersifat darurat, kami menyarankan untuk menghubungi nomor hotline darurat langsung.'
    },
    {
      question: 'Apakah data pribadi saya aman?',
      answer: 'Ya, kami menjamin keamanan data pribadi Anda. Data pelapor dienkripsi dan hanya dapat diakses oleh petugas yang berwenang untuk keperluan tindak lanjut aduan.'
    }
  ];

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '600' }}>
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }} className="text-gradient">Bantuan & Nomor Darurat</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Temukan informasi hotline penting dan jawaban atas pertanyaan umum seputar Lalapor!</p>
      </div>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PhoneCall size={24} color="var(--primary)" />
          Hotline Darurat
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {hotlines.map((hotline, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '0.8rem', borderRadius: '50%' }}>
                  {hotline.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>{hotline.name}</h3>
                  <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{hotline.number}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleCopy(hotline.number)}
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                  title="Salin Nomor"
                >
                  {copiedNumber === hotline.number ? <CheckCircle size={20} color="var(--success)" /> : <Copy size={20} />}
                </button>
                <a 
                  href={`tel:${hotline.number}`}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Panggil"
                >
                  <Phone size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem' }}>Pertanyaan Umum (FAQ)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel" style={{ overflow: 'hidden' }}>
              <button 
                onClick={() => toggleFaq(idx)}
                style={{ 
                  width: '100%', 
                  padding: '1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-main)', 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {faq.question}
                {openFaq === idx ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="var(--primary)" />}
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HelpDirectoryPage;
