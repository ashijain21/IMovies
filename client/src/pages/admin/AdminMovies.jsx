import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Film, Star, X } from 'lucide-react';
import { movieService } from '../../services/movieService';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

export const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    trailerUrl: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    duration: 150,
    releaseDate: '2026-11-01',
    cast: 'Timothée Chalamet, Zendaya',
    director: 'Denis Villeneuve',
    rating: 8.5,
    certification: 'UA',
    status: 'now_showing',
    featured: false,
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieService.getMovies({ search, limit: 50 });
      setMovies(res.movies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      genre: 'Action, Sci-Fi',
      language: 'English',
      duration: 150,
      releaseDate: new Date().toISOString().split('T')[0],
      cast: 'Timothée Chalamet, Zendaya',
      director: 'Denis Villeneuve',
      rating: 8.5,
      certification: 'UA',
      status: 'now_showing',
      featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      backdrop: movie.backdrop,
      trailerUrl: movie.trailerUrl || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      language: movie.language,
      duration: movie.duration,
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : '',
      director: movie.director || '',
      rating: movie.rating || 8.0,
      certification: movie.certification || 'UA',
      status: movie.status || 'now_showing',
      featured: movie.featured || false,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await adminService.deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        rating: Number(formData.rating),
        genre: formData.genre.split(',').map((g) => g.trim()),
        cast: formData.cast.split(',').map((c) => c.trim()),
      };

      if (editingMovie) {
        await adminService.updateMovie(editingMovie._id, payload);
      } else {
        await adminService.createMovie(payload);
      }
      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save movie');
    }
  };

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Movie Management</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Catalogue, posters, statuses, and release schedules</p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
          <Plus size={18} /> Add New Movie
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by title, genre, director..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '38px', borderRadius: '10px' }}
        />
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Movie Table */}
      {loading ? (
        <Loader message="Loading movie catalogue..." />
      ) : (
        <div style={{ background: '#121620', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>Movie</th>
                <th style={{ padding: '14px 16px' }}>Genre</th>
                <th style={{ padding: '14px 16px' }}>Language</th>
                <th style={{ padding: '14px 16px' }}>Rating</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={m.poster} alt={m.title} style={{ width: '40px', height: '56px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff' }}>{m.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.duration} mins • {m.certification}</p>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                    {Array.isArray(m.genre) ? m.genre.slice(0, 2).join(', ') : m.genre}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{m.language}</td>
                  <td style={{ padding: '12px 16px', color: '#fbbf24', fontWeight: 700 }}>
                    <Star size={13} fill="#fbbf24" style={{ display: 'inline', marginRight: '4px' }} />
                    {m.rating?.toFixed(1)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {m.status === 'now_showing' ? (
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Now Showing</span>
                    ) : (
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Upcoming</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      style={{ background: 'transparent', color: '#60a5fa', padding: '6px', marginRight: '6px' }}
                      title="Edit Movie"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      style={{ background: 'transparent', color: '#f87171', padding: '6px' }}
                      title="Delete Movie"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#121620',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Movie Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Poster URL</label>
                  <input
                    type="url"
                    required
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Backdrop URL</label>
                  <input
                    type="url"
                    required
                    value={formData.backdrop}
                    onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Language</label>
                  <input
                    type="text"
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Certification</label>
                  <select
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="input-field"
                  >
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Genres (comma separated)</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Trailer YouTube URL</label>
                  <input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '12px', padding: '12px' }}>
                {editingMovie ? 'Update Movie' : 'Save & Publish Movie'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

