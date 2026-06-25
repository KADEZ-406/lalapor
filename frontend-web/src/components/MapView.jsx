import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';
import { Map } from 'lucide-react';

// Custom marker icons berdasarkan status
function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const statusIconMap = {
  pending: createIcon('gold'),
  approved: createIcon('green'),
  rejected: createIcon('red'),
};

const statusLabel = {
  pending: 'Menunggu Proses',
  approved: 'Diterima',
  rejected: 'Ditolak',
};

const statusBadgeColor = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

export default function MapView({ laporanList, singleMode = false }) {
  const navigate = useNavigate();

  // Filter hanya laporan yang punya koordinat
  const laporanWithCoords = useMemo(
    () => laporanList.filter((l) => l.latitude != null && l.longitude != null),
    [laporanList]
  );

  // Tentukan center peta
  const center = useMemo(() => {
    if (laporanWithCoords.length === 0) return [-2.548926, 118.0148634];
    if (singleMode && laporanWithCoords.length > 0) {
      return [parseFloat(laporanWithCoords[0].latitude), parseFloat(laporanWithCoords[0].longitude)];
    }
    const avgLat = laporanWithCoords.reduce((s, l) => s + parseFloat(l.latitude), 0) / laporanWithCoords.length;
    const avgLng = laporanWithCoords.reduce((s, l) => s + parseFloat(l.longitude), 0) / laporanWithCoords.length;
    return [avgLat, avgLng];
  }, [laporanWithCoords, singleMode]);

  const zoom = singleMode ? 14 : 6;

  if (laporanWithCoords.length === 0) {
    return (
      <div style={{
        height: singleMode ? '280px' : '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        gap: '0.5rem'
      }}>
        <Map size={36} style={{ opacity: 0.4, color: 'var(--text-muted)' }} />
        <p style={{ margin: 0 }}>Belum ada laporan dengan data lokasi.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Legenda (hanya di mode dashboard) */}
      {!singleMode && (
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          marginBottom: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap'
        }}>
          {Object.entries(statusLabel).map(([key, label]) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: statusBadgeColor[key], display: 'inline-block'
              }} />
              {label}
            </span>
          ))}
          <span style={{ marginLeft: 'auto' }}>
            {laporanWithCoords.length} dari {laporanList.length} laporan memiliki lokasi
          </span>
        </div>
      )}

      <div style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        height: singleMode ? '280px' : '480px',
      }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {laporanWithCoords.map((laporan) => (
            <Marker
              key={laporan.id}
              position={[parseFloat(laporan.latitude), parseFloat(laporan.longitude)]}
              icon={statusIconMap[laporan.status] ?? statusIconMap.pending}
            >
              <Popup>
                <div style={{ minWidth: '180px', fontFamily: 'inherit' }}>
                  <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                    {laporan.title}
                  </strong>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    background: statusBadgeColor[laporan.status],
                    color: '#fff',
                    marginBottom: '0.5rem'
                  }}>
                    {statusLabel[laporan.status]}
                  </span>
                  <p style={{ fontSize: '0.78rem', color: '#555', margin: '0 0 0.5rem' }}>
                    {laporan.category?.name || 'Umum'} &bull; {laporan.user?.name}
                  </p>
                  {!singleMode && (
                    <button
                      onClick={() => navigate(`/laporan/${laporan.id}`)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        background: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        width: '100%'
                      }}
                    >
                      Lihat Detail →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
