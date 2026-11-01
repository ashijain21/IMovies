import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Film, Sparkles, ChevronRight } from 'lucide-react';
import { theatreService } from '../services/theatreService';
import { useCity } from '../context/CityContext';
import { Loader } from '../components/common/Loader';

export const TheatresPage = () => {
  const { selectedCity } = useCity();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        setLoading(true);
        const res = await theatreService.getTheatres({ city: selectedCity });
        setTheatres(res.theatres || []);
      } catch (err) {
        console.error('Failed to load theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity]);

  if (loading) {
    return <Loader message="Locating luxury cinemas and multiplexes..." />;
  }

  return (
    <div className="max-w-layout" style={{ paddingTop: '30px', paddingBottom: '70px' }}>
      <div style={{ marginBottom: '30px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
          {selectedCity} Multiplexes
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
          Theatres & Cinemas in {selectedCity}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
          Experience movies in IMAX Laser, 4DX, and Dolby Atmos with premium recliners and gourmet dining
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {theatres.map((theatre) => (
          <div
            key={theatre._id}
            style={{
              background: '#121620',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Theatre Image */}
            <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={theatre.image || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800'}
                alt={theatre.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, #121620, transparent)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '16px',
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                {theatre.location}
              </span>
            </div>

            {/* Info */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                {theatre.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
                <MapPin size={14} color="#e50914" /> {theatre.address}
              </p>

              {/* Facilities */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {theatre.facilities && theatre.facilities.map((fac) => (
                  <span
                    key={fac}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      color: '#cbd5e1',
                    }}
                  >
                    {fac}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div style={{ marginTop: 'auto' }}>
                <Link
                  to={`/movies?city=${theatre.city}`}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                >
                  <span>Explore Movies in this Cinema</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

