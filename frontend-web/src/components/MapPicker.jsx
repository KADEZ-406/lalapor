import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, X } from 'lucide-react';

// Sub-komponen untuk handle klik di peta
function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? [value.lat, value.lng] : null
  );
  const [geoLoading, setGeoLoading] = useState(false);

  // Center default: Indonesia
  const defaultCenter = [-2.548926, 118.0148634];
  const defaultZoom = 5;

  const handleMapClick = (lat, lng) => {
    setPosition([lat, lng]);
    onChange({ lat, lng });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser kamu tidak mendukung Geolocation.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onChange({ lat: latitude, lng: longitude });
        setGeoLoading(false);
      },
      () => {
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
        setGeoLoading(false);
      }
    );
  };

  const handleClearLocation = () => {
    setPosition(null);
    onChange({ lat: null, lng: null });
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={geoLoading}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Navigation size={15} />
          {geoLoading ? 'Mendeteksi...' : 'Gunakan Lokasi Saya'}
        </button>

        {position && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}
          >
            <X size={15} /> Hapus Lokasi
          </button>
        )}

        {position && (
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginLeft: 'auto'
          }}>
            <MapPin size={13} color="var(--primary)" />
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
        )}
      </div>

      {/* Peta */}
      <div style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        height: '320px',
        position: 'relative'
      }}>
        <MapContainer
          center={position ?? defaultCenter}
          zoom={position ? 14 : defaultZoom}
          style={{ height: '100%', width: '100%' }}
          key={position ? 'has-pos' : 'no-pos'}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector onSelect={handleMapClick} />
          {position && <Marker position={position} />}
        </MapContainer>

        {/* Overlay hint kalau belum ada lokasi */}
        {!position && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.65)',
            color: '#fff',
            padding: '0.4rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}>
            📍 Klik di peta untuk menandai lokasi kejadian
          </div>
        )}
      </div>
    </div>
  );
}
