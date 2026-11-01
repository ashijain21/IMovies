import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Tag,
  Building,
  Film,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';
import { useCity } from '../context/CityContext';
import { MovieCard } from '../components/common/MovieCard';
import { TrailerModal } from '../components/common/TrailerModal';
import { Loader } from '../components/common/Loader';

export const HomePage = () => {
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Trailer Modal State
  const [trailerModal, setTrailerModal] = useState({
    isOpen: false,
    url: '',
    title: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, theatresRes] = await Promise.all([
          movieService.getFeatured(),
          theatreService.getTheatres({ city: selectedCity }),
        ]);

        setFeaturedMovies(featuredRes.featured || []);
        setNowShowing(featuredRes.nowShowing || []);
        setUpcoming(featuredRes.upcoming || []);
        setTheatres(theatresRes.theatres || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  // Rotate hero every 7 seconds
  useEffect(() => {
    if (featuredMovies.length > 1) {
      const timer = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [featuredMovies.length]);

  const activeHero = featuredMovies[currentHeroIndex] || nowShowing[0];

  const handlePlayTrailer = (url, title) => {
    setTrailerModal({ isOpen: true, url, title });
  };

  if (loading) {
    return <Loader message="Setting up the red carpet..." />;
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      {/* 1. CINEMATIC HERO SECTION */}
      {activeHero && (
        <section
          style={{
            position: 'relative',
            height: '75vh',
            minHeight: '520px',
            maxHeight: '750px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Backdrop Image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${activeHero.backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              transform: 'scale(1.02)',
              transition: 'background-image 0.8s ease-in-out',
            }}
          />

          {/* Cinematic Dark Gradient Layers */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, #080a0f 0%, rgba(8, 10, 15, 0.85) 45%, rgba(8, 10, 15, 0.3) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '180px',
              background: 'linear-gradient(to top, #080a0f, transparent)',
            }}
          />

          {/* Hero Content */}
          <div className="max-w-layout" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <div style={{ maxWidth: '640px' }}>
              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span className="badge badge-primary">Featured Premiere</span>
                <span className="badge badge-gold">
                  <Star size={12} fill="#fbbf24" color="#fbbf24" /> {activeHero.rating.toFixed(1)} / 10
                </span>
                <span className="badge badge-blue">
                  {activeHero.certification}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.6rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: '16px',
                  color: '#fff',
                  textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                }}
              >
                {activeHero.title}
              </h1>

              {/* Meta */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '0.9rem',
                  color: '#cbd5e1',
                  marginBottom: '16px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={15} color="#e50914" /> {Math.floor(activeHero.duration / 60)}h{' '}
                  {activeHero.duration % 60}m
                </span>
                <span>•</span>
                <span>{Array.isArray(activeHero.genre) ? activeHero.genre.join(', ') : activeHero.genre}</span>
                <span>•</span>
                <span style={{ textTransform: 'uppercase' }}>{activeHero.language}</span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  marginBottom: '26px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {activeHero.description}
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  to={`/movie/${activeHero._id}`}
                  className="btn-primary"
                  style={{ padding: '13px 30px', fontSize: '1rem' }}
                >
                  <Ticket size={20} />
                  <span>Book Tickets</span>
                </Link>

                {activeHero.trailerUrl && (
                  <button
                    onClick={() => handlePlayTrailer(activeHero.trailerUrl, activeHero.title)}
                    className="btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                  >
                    <Play size={18} fill="#fff" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hero Indicator Dots */}
          {featuredMovies.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '40px',
                display: 'flex',
                gap: '8px',
                zIndex: 20,
              }}
            >
              {featuredMovies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroIndex(idx)}
                  style={{
                    width: currentHeroIndex === idx ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: currentHeroIndex === idx ? '#e50914' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. NOW SHOWING SECTION */}
      <section className="max-w-layout" style={{ marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#e50914', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              In Theatres Now
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              Now Showing in {selectedCity}
            </h2>
          </div>
          <Link
            to="/movies?status=now_showing"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#e50914',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {nowShowing.slice(0, 8).map((movie) => (
            <MovieCard key={movie._id} movie={movie} onPlayTrailer={handlePlayTrailer} />
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONAL OFFERS BANNER */}
      <section id="offers" className="max-w-layout" style={{ marginTop: '60px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #181d29 0%, #11151f 100%)',
            border: '1px solid rgba(229, 9, 20, 0.35)',
            borderRadius: '20px',
            padding: '34px 40px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 5, maxWidth: '600px' }}>
            <span className="badge badge-gold" style={{ marginBottom: '10px' }}>
              <Tag size={12} /> Special Festive Promo
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Flat 20% OFF with code: <span style={{ color: '#e50914' }}>IMOVIES50</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.6 }}>
              Enjoy luxury recliner seats, IMAX 3D blockbusters, and gourmet snacks. Apply promo coupon at checkout for instant discount!
            </p>
            <Link to="/movies" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              Book Movies Now
            </Link>
          </div>

          <div
            style={{
              position: 'absolute',
              right: '-40px',
              bottom: '-40px',
              opacity: 0.1,
              transform: 'rotate(-15deg)',
            }}
          >
            <Film size={260} color="#fff" />
          </div>
        </div>
      </section>

      {/* 4. UPCOMING MOVIES SECTION */}
      <section className="max-w-layout" style={{ marginTop: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Coming Soon
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              Anticipated Blockbusters
            </h2>
          </div>
          <Link
            to="/movies?status=upcoming"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#60a5fa',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>Explore All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
          {upcoming.map((movie) => (
            <MovieCard key={movie._id} movie={movie} onPlayTrailer={handlePlayTrailer} />
          ))}
        </div>
      </section>

      {/* 5. TOP THEATRES IN CITY */}
      <section className="max-w-layout" style={{ marginTop: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Cinemas & Multiplexes
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              Popular Theatres in {selectedCity}
            </h2>
          </div>
          <Link
            to="/theatres"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#34d399',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>View Theatres</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {theatres.map((theatre) => (
            <div
              key={theatre._id}
              style={{
                background: '#121620',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '10px', color: '#10b981' }}>
                  <Building size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{theatre.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{theatre.address}</p>
                </div>
              </div>

              {/* Facilities */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {theatre.facilities.map((fac) => (
                  <span
                    key={fac}
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                    }}
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, url: '', title: '' })}
        trailerUrl={trailerModal.url}
        movieTitle={trailerModal.title}
      />
    </div>
  );
};

