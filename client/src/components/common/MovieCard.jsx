import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Clock } from 'lucide-react';

export const MovieCard = ({ movie, onPlayTrailer }) => {
  return (
    <div
      style={{
        background: '#121620',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
      className="movie-card-hover"
    >
      {/* Poster Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '145%', overflow: 'hidden' }}>
        <img
          src={movie.poster}
          alt={movie.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          className="poster-img"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(18, 22, 32, 0.95) 0%, rgba(18, 22, 32, 0.2) 50%, transparent 100%)',
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
            <Star size={11} fill="#fbbf24" color="#fbbf24" />
            {movie.rating.toFixed(1)}
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
            {movie.certification}
          </span>
        </div>

        {/* Trailer Button Overlay on hover */}
        {movie.trailerUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onPlayTrailer && onPlayTrailer(movie.trailerUrl, movie.title);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(229, 9, 20, 0.9)',
              color: '#fff',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.6)',
              opacity: 0,
              transition: 'all 0.3s ease',
            }}
            className="trailer-play-btn"
            title="Watch Trailer"
          >
            <Play size={20} fill="#fff" />
          </button>
        )}

        {/* Bottom Format & Duration inside image */}
        <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="#94a3b8" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {movie.language}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Link to={`/movie/${movie._id}`}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 0.2s',
            }}
            className="movie-title-link"
            title={movie.title}
          >
            {movie.title}
          </h3>
        </Link>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <Link
            to={`/movie/${movie._id}`}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: '0.85rem',
              borderRadius: '8px',
            }}
          >
            Book Tickets
          </Link>
        </div>
      </div>

      <style>{`
        .movie-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 15px rgba(229, 9, 20, 0.15);
          border-color: rgba(229, 9, 20, 0.35);
        }
        .movie-card-hover:hover .poster-img {
          transform: scale(1.04);
        }
        .movie-card-hover:hover .trailer-play-btn {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.05);
        }
        .movie-title-link:hover {
          color: #e50914 !important;
        }
      `}</style>
    </div>
  );
};

