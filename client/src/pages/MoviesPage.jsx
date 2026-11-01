import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film } from 'lucide-react';
import { movieService } from '../services/movieService';
import { MovieCard } from '../components/common/MovieCard';
import { TrailerModal } from '../components/common/TrailerModal';
import { Loader } from '../components/common/Loader';

export const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Trailer modal
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, url: '', title: '' });

  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Animation', 'Biography', 'Crime', 'Thriller'];
  const languages = ['All', 'English', 'Hindi'];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          sort,
        };
        if (search) params.search = search;
        if (status !== 'All') params.status = status;
        if (genre !== 'All') params.genre = genre;
        if (language !== 'All') params.language = language;

        const res = await movieService.getMovies(params);
        setMovies(res.movies || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, status, genre, language, sort, page]);

  return (
    <div className="max-w-layout" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>Explore Movies</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
          Browse now showing releases, advance ticket bookings, and upcoming premieres
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Top Row: Search & Status Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'now_showing', 'upcoming'].map((s) => {
              const label = s === 'All' ? 'All Movies' : s === 'now_showing' ? 'Now Showing' : 'Upcoming';
              const active = status === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#e50914' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#fff' : '#cbd5e1',
                    border: active ? '1px solid #ff4757' : '1px solid transparent',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '260px', flexGrow: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search by title, director, cast..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field"
              style={{ paddingLeft: '38px', borderRadius: '10px' }}
            />
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        {/* Bottom Row: Genre, Language, Sort */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '16px',
          }}
        >
          {/* Genre select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Genre:</span>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              style={{
                background: '#1a202c',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.82rem',
              }}
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Language:</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              style={{
                background: '#1a202c',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.82rem',
              }}
            >
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Sort select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sort By:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                background: '#1a202c',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.82rem',
              }}
            >
              <option value="rating">Top Rated</option>
              <option value="newest">Release Date (Newest)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <Loader message="Loading movie listings..." />
      ) : movies.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#121620',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <Film size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>No movies found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
            Try tweaking your filters or search keywords.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onPlayTrailer={(url, title) => setTrailerModal({ isOpen: true, url, title })}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

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

