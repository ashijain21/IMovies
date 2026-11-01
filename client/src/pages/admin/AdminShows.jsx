import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, Film, Building, X, AlertCircle } from 'lucide-react';
import { showService } from '../../services/showService';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

export const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Schedule Form
  const [form, setForm] = useState({
    movieId: '',
    theatreId: '',
    screenId: '',
    showDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    basePrice: 250,
  });

  const [availableScreens, setAvailableScreens] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        showService.getShows(),
        movieService.getMovies({ limit: 50 }),
        theatreService.getTheatres(),
      ]);

      setShows(showsRes.shows || []);
      setMovies(moviesRes.movies || []);
      setTheatres(theatresRes.theatres || []);

      if (moviesRes.movies?.length > 0 && theatresRes.theatres?.length > 0) {
        const firstTheatre = theatresRes.theatres[0];
        setForm((prev) => ({
          ...prev,
          movieId: moviesRes.movies[0]._id,
          theatreId: firstTheatre._id,
          screenId: firstTheatre.screens?.[0]?._id || '',
        }));
        setAvailableScreens(firstTheatre.screens || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTheatreChange = (theatreId) => {
    const selected = theatres.find((t) => t._id === theatreId);
    const screens = selected?.screens || [];
    setAvailableScreens(screens);
    setForm((prev) => ({
      ...prev,
      theatreId,
      screenId: screens[0]?._id || '',
    }));
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      await adminService.createShow({
        ...form,
        basePrice: Number(form.basePrice),
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule show due to conflict or error.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Cancel/Delete this scheduled show?')) return;
    try {
      await adminService.deleteShow(id);
      setShows((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete show');
    }
  };

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Showtime Scheduling</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Schedule movies into auditorium slots with automated conflict detection</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
          <Plus size={18} /> Schedule New Show
        </button>
      </div>

      {loading ? (
        <Loader message="Loading programmed show schedules..." />
      ) : (
        <div style={{ background: '#121620', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>Movie</th>
                <th style={{ padding: '14px 16px' }}>Theatre & Screen</th>
                <th style={{ padding: '14px 16px' }}>Date</th>
                <th style={{ padding: '14px 16px' }}>Time</th>
                <th style={{ padding: '14px 16px' }}>Base Price</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.slice(0, 50).map((s) => (
                <tr key={s._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>
                    {s.movieId?.title}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                    {s.theatreId?.name} ({s.screenId?.screenName || 'Screen'})
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{s.showDate}</td>
                  <td style={{ padding: '12px 16px', color: '#60a5fa', fontWeight: 700 }}>{s.startTime}</td>
                  <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>₹{s.basePrice}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteShow(s._id)}
                      style={{ background: 'transparent', color: '#f87171', padding: '6px' }}
                      title="Delete / Cancel Show"
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

      {/* Schedule Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121620', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Schedule Showtime</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Movie</label>
                <select value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })} className="input-field" required>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Theatre</label>
                <select value={form.theatreId} onChange={(e) => handleTheatreChange(e.target.value)} className="input-field" required>
                  {theatres.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Screen</label>
                <select value={form.screenId} onChange={(e) => setForm({ ...form, screenId: e.target.value })} className="input-field" required>
                  {availableScreens.map((s) => (
                    <option key={s._id} value={s._id}>{s.screenName} ({s.screenType})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Show Date</label>
                  <input type="date" required value={form.showDate} onChange={(e) => setForm({ ...form, showDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Base Ticket Price (₹)</label>
                  <input type="number" required value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="input-field" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Start Time</label>
                  <input type="text" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="e.g. 10:30 AM" className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>End Time</label>
                  <input type="text" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="e.g. 01:30 PM" className="input-field" />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>Schedule Showtime</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

