import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Play,
  Calendar,
  Building,
  MapPin,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { useCity } from '../context/CityContext';
import { TrailerModal } from '../components/common/TrailerModal';
import { Loader } from '../components/common/Loader';

export const MovieDetailsPage = () => {
  const { id } = useParams();
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateList, setDateList] = useState([]);

  // Trailer Modal
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, url: '', title: '' });

  // Generate 4 consecutive dates (Today, Tomorrow, ...)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      dates.push({
        iso: isoDate,
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateFormatted: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      });
    }
    setDateList(dates);
    setSelectedDate(dates[0].iso);
  }, []);

  // Fetch Movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await movieService.getMovieById(id);
        setMovie(res.movie);
      } catch (err) {
        console.error('Failed to load movie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Fetch shows when movie, selectedDate, or selectedCity changes
  useEffect(() => {
    const fetchShows = async () => {
      if (!id || !selectedDate) return;
      try {
        const res = await showService.getShows({
          movieId: id,
          showDate: selectedDate,
          city: selectedCity,
        });
        setShows(res.shows || []);
      } catch (err) {
        console.error('Failed to load shows:', err);
      }
    };
    fetchShows();
  }, [id, selectedDate, selectedCity]);

  // Group shows by Theatre
  const groupedShowsByTheatre = shows.reduce((acc, show) => {
    const theatreId = show.theatreId?._id;
    if (!theatreId) return acc;

    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatreId,
        shows: [],
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  if (loading || !movie) {
    return <Loader message="Fetching movie schedules & details..." />;
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* 1. BACKDROP & HERO BANNER */}
      <div
        style={{
          position: 'relative',
          height: '55vh',
          minHeight: '420px',
          backgroundImage: `url(${movie.backdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #080a0f 0%, rgba(8, 10, 15, 0.75) 50%, rgba(8, 10, 15, 0.4) 100%)',
          }}
        />

        {/* Content overlapping backdrop */}
        <div className="max-w-layout" style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Poster thumbnail */}
            <div
              style={{
                width: '180px',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'none',
              }}
              className="details-poster"
            >
              <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            {/* Title & Metadata */}
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <span className="badge badge-gold">
                  <Star size={12} fill="#fbbf24" color="#fbbf24" /> {movie.rating.toFixed(1)} / 10
                </span>
                <span className="badge badge-primary">{movie.certification}</span>
                <span className="badge badge-blue">{movie.language}</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', gap: '16px', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={15} color="#e50914" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span>•</span>
                <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
              </div>

              {movie.trailerUrl && (
                <button
                  onClick={() => setTrailerModal({ isOpen: true, url: movie.trailerUrl, title: movie.title })}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <Play size={16} fill="#fff" /> Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SYNOPSIS & CAST ROW */}
      <div className="max-w-layout" style={{ marginTop: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>About the Movie</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.7 }}>{movie.description}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Cast & Crew</h3>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Director: </span>
              <span style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>{movie.director || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Starring: </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {movie.cast && movie.cast.map((actor) => (
                  <span
                    key={actor}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                    }}
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SHOWTIMES & THEATRE SCHEDULE SELECTION */}
      <section className="max-w-layout" style={{ marginTop: '50px' }}>
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Theatres & Showtimes</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Showing schedules in <strong style={{ color: '#e50914' }}>{selectedCity}</strong>
              </p>
            </div>

            {/* Date Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {dateList.map((item) => {
                const isSelected = selectedDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    onClick={() => setSelectedDate(item.iso)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: isSelected ? '#e50914' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1px solid #ff4757' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#fff' : '#cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '78px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.8 }}>{item.dayName}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.dateFormatted}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showtimes Listings */}
          {Object.keys(groupedShowsByTheatre).length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#121620',
                borderRadius: '16px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
              }}
            >
              <Building size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>No shows available on this date</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Please select another date above or check other nearby cities.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.values(groupedShowsByTheatre).map(({ theatre, shows: theatreShows }) => (
                <div
                  key={theatre._id}
                  style={{
                    background: '#121620',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Theatre Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{theatre.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={13} color="#e50914" /> {theatre.address}
                      </p>
                    </div>

                    {/* Facilities badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {theatre.facilities && theatre.facilities.slice(0, 3).map((f) => (
                        <span key={f} className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {theatreShows.map((show) => {
                      return (
                        <button
                          key={show._id}
                          onClick={() => navigate(`/seat-selection/${show._id}`)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                          className="showtime-btn"
                        >
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{show.startTime}</span>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            {show.screenId?.screenType || '2D'} • ₹{show.basePrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, url: '', title: '' })}
        trailerUrl={trailerModal.url}
        movieTitle={trailerModal.title}
      />

      <style>{`
        @media (min-width: 768px) {
          .details-poster { display: block !important; }
        }
        .showtime-btn:hover {
          background: rgba(229, 9, 20, 0.18) !important;
          border-color: #e50914 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
        }
      `}</style>
    </div>
  );
};

