import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Ticket,
  Clock,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export const UserDashboardPage = () => {
  const { user, updateUser } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule conflict');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Profile edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getMyBookings();
        setBookings(res.bookings || []);
      } catch (err) {
        console.error('Failed to load user bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await authService.updateProfile({ name, phone });
      updateUser(res.user);
      setNotificationMsg('Profile updated successfully!');
      setTimeout(() => setNotificationMsg(''), 4000);
    } catch (err) {
      //
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOpenCancel = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    try {
      setCancellingId(selectedBookingToCancel._id);
      const res = await bookingService.cancelBooking(selectedBookingToCancel._id, cancelReason);
      setBookings((prev) =>
        prev.map((b) => (b._id === selectedBookingToCancel._id ? res.booking : b))
      );
      setCancelModalOpen(false);
      setNotificationMsg(`Booking ${selectedBookingToCancel.bookingId} cancelled. Refund processed!`);
      setTimeout(() => setNotificationMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && (b.showId?.showDate >= todayStr || !b.showId)
  );

  const pastBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && b.showId?.showDate < todayStr
  );

  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'cancelled');

  let displayedBookings = upcomingBookings;
  if (activeTab === 'past') displayedBookings = pastBookings;
  if (activeTab === 'cancelled') displayedBookings = cancelledBookings;

  return (
    <div className="max-w-layout" style={{ paddingTop: '30px', paddingBottom: '70px' }}>
      {/* Header Profile Summary */}
      <div
        style={{
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
            alt={user?.name}
            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e50914' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{user?.name}</h2>
              {user?.role === 'admin' && <span className="badge badge-primary">Administrator</span>}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user?.email} • {user?.phone || 'No phone added'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{bookings.length}</span>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Reservations</p>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{upcomingBookings.length}</span>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Upcoming Shows</p>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#34d399',
            fontSize: '0.9rem',
            marginBottom: '24px',
          }}
          className="animate-slide-down"
        >
          {notificationMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeTab === 'upcoming' ? '#e50914' : 'transparent',
            color: activeTab === 'upcoming' ? '#fff' : '#94a3b8',
            fontWeight: activeTab === 'upcoming' ? 700 : 500,
            fontSize: '0.9rem',
          }}
        >
          Upcoming Bookings ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeTab === 'past' ? '#e50914' : 'transparent',
            color: activeTab === 'past' ? '#fff' : '#94a3b8',
            fontWeight: activeTab === 'past' ? 700 : 500,
            fontSize: '0.9rem',
          }}
        >
          Past Bookings ({pastBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeTab === 'cancelled' ? '#e50914' : 'transparent',
            color: activeTab === 'cancelled' ? '#fff' : '#94a3b8',
            fontWeight: activeTab === 'cancelled' ? 700 : 500,
            fontSize: '0.9rem',
          }}
        >
          Cancelled ({cancelledBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeTab === 'settings' ? '#e50914' : 'transparent',
            color: activeTab === 'settings' ? '#fff' : '#94a3b8',
            fontWeight: activeTab === 'settings' ? 700 : 500,
            fontSize: '0.9rem',
          }}
        >
          Account Settings
        </button>
      </div>

      {/* Account Settings Tab View */}
      {activeTab === 'settings' && (
        <div
          style={{
            background: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '540px',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '18px' }}>
            Personal Profile & Preferences
          </h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Booking List */}
      {activeTab !== 'settings' && (
        loading ? (
          <Loader message="Loading your tickets & reservations..." />
        ) : displayedBookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#121620',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <Ticket size={44} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>No {activeTab} bookings found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
              Ready to watch a new blockbuster? Browse movies now!
            </p>
            <Link to="/movies" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
              Discover Movies
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {displayedBookings.map((b) => (
              <div
                key={b._id}
                style={{
                  background: '#121620',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* Left Poster & Info */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img
                    src={b.movieId?.poster}
                    alt={b.movieId?.title}
                    style={{ width: '80px', height: '115px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e50914' }}>{b.bookingId}</span>
                      {b.bookingStatus === 'confirmed' ? (
                        <span className="badge badge-green">Confirmed</span>
                      ) : (
                        <span className="badge badge-primary">Cancelled</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{b.movieId?.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                      {b.theatreId?.name} ({b.theatreId?.city})
                    </p>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#e50914" /> {b.showId?.showDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#e50914" /> {b.showId?.startTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle Seats & Amount */}
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Seats Reserved:</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    {b.selectedSeats.map((s) => s.seatNumber).join(', ')}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
                    Total: ₹{b.totalAmount}
                  </p>
                </div>

                {/* Right Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                  <Link
                    to={`/booking/confirmation/${b._id}`}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.82rem', width: '100%' }}
                  >
                    <FileText size={14} /> View Ticket / QR
                  </Link>

                  {b.bookingStatus === 'confirmed' && activeTab === 'upcoming' && (
                    <button
                      onClick={() => handleOpenCancel(b)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && selectedBookingToCancel && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Cancel Reservation</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              Are you sure you want to cancel booking <strong>{selectedBookingToCancel.bookingId}</strong> for{' '}
              <strong>{selectedBookingToCancel.movieId?.title}</strong>?
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '10px', margin: '16px 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              <p>Refund Policy: 80% refundable (20% cancellation charges apply).</p>
              <p style={{ color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
                Estimated Refund: ₹{Math.round(selectedBookingToCancel.totalAmount * 0.8)}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setCancelModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                Keep Ticket
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  background: '#dc2626',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                {cancellingId ? 'Processing...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

