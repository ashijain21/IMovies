import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building, Monitor, MapPin, X } from 'lucide-react';
import { theatreService } from '../../services/theatreService';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

export const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theatreModalOpen, setTheatreModalOpen] = useState(false);
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [selectedTheatreForScreen, setSelectedTheatreForScreen] = useState(null);

  // New Theatre Form
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    location: '',
    address: '',
    city: 'Mumbai',
    facilities: 'IMAX, Dolby Atmos, Recliner Seats, Valet Parking',
  });

  // New Screen Form
  const [screenForm, setScreenForm] = useState({
    screenName: 'Screen 1 - IMAX Laser',
    screenType: 'IMAX 3D',
    totalSeats: 70,
  });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await theatreService.getTheatres();
      setTheatres(res.theatres || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      await adminService.createTheatre({
        ...theatreForm,
        facilities: theatreForm.facilities.split(',').map((f) => f.trim()),
      });
      setTheatreModalOpen(false);
      fetchTheatres();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add theatre');
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheatreForScreen) return;
    try {
      await adminService.createScreen({
        theatreId: selectedTheatreForScreen._id,
        screenName: screenForm.screenName,
        screenType: screenForm.screenType,
        totalSeats: Number(screenForm.totalSeats),
      });
      setScreenModalOpen(false);
      fetchTheatres();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add screen');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre and all its screens?')) return;
    try {
      await adminService.deleteTheatre(id);
      setTheatres((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete theatre');
    }
  };

  const handleDeleteScreen = async (screenId) => {
    if (!window.confirm('Delete this screen?')) return;
    try {
      await adminService.deleteScreen(screenId);
      fetchTheatres();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete screen');
    }
  };

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Theatre & Screen Architecture</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Multiplex branches, auditorium configurations, and screen capacities</p>
        </div>

        <button onClick={() => setTheatreModalOpen(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
          <Plus size={18} /> Add New Theatre
        </button>
      </div>

      {loading ? (
        <Loader message="Loading theatre network..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {theatres.map((theatre) => (
            <div
              key={theatre._id}
              style={{
                background: '#121620',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{theatre.name}</h3>
                    <span className="badge badge-primary">{theatre.city}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                    {theatre.address} ({theatre.location})
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedTheatreForScreen(theatre);
                      setScreenModalOpen(true);
                    }}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    <Plus size={14} /> Add Screen
                  </button>
                  <button
                    onClick={() => handleDeleteTheatre(theatre._id)}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'none', borderRadius: '8px', padding: '8px 12px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Screens Grid */}
              <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Screens ({theatre.screens ? theatre.screens.length : 0})
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {theatre.screens && theatre.screens.map((sc) => (
                    <div
                      key={sc._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{sc.screenName}</p>
                        <p style={{ fontSize: '0.78rem', color: '#60a5fa', marginTop: '2px' }}>
                          {sc.screenType} • {sc.totalSeats} Seats
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteScreen(sc._id)}
                        style={{ background: 'transparent', color: '#f87171', border: 'none', padding: '4px' }}
                        title="Delete Screen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Theatre Modal */}
      {theatreModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121620', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Add New Theatre</h3>
              <button onClick={() => setTheatreModalOpen(false)} style={{ background: 'transparent', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Theatre Name</label>
                <input required type="text" value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} className="input-field" placeholder="e.g. Cinepolis: DLF Mall" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>City</label>
                  <input required type="text" value={theatreForm.city} onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Location/Area</label>
                  <input required type="text" value={theatreForm.location} onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })} className="input-field" placeholder="e.g. Sector 18" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Address</label>
                <input required type="text" value={theatreForm.address} onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Facilities (comma separated)</label>
                <input type="text" value={theatreForm.facilities} onChange={(e) => setTheatreForm({ ...theatreForm, facilities: e.target.value })} className="input-field" />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>Save Theatre</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {screenModalOpen && selectedTheatreForScreen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#121620', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Add Screen to {selectedTheatreForScreen.name}</h3>
              <button onClick={() => setScreenModalOpen(false)} style={{ background: 'transparent', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateScreen} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Screen Name</label>
                <input required type="text" value={screenForm.screenName} onChange={(e) => setScreenForm({ ...screenForm, screenName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Screen Type / Technology</label>
                <select value={screenForm.screenType} onChange={(e) => setScreenForm({ ...screenForm, screenType: e.target.value })} className="input-field">
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                  <option value="4DX">4DX</option>
                  <option value="Standard 2D">Standard 2D</option>
                  <option value="Standard 3D">Standard 3D</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Total Seats</label>
                <input required type="number" value={screenForm.totalSeats} onChange={(e) => setScreenForm({ ...screenForm, totalSeats: e.target.value })} className="input-field" />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>Add Screen</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

