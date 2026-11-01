import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Film, Building, Calendar, Clock, AlertCircle } from 'lucide-react';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { SeatGrid } from '../components/seat/SeatGrid';
import { SeatLegend } from '../components/seat/SeatLegend';
import { SeatSummary } from '../components/seat/SeatSummary';
import { Loader } from '../components/common/Loader';

export const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { socket, joinShow, leaveShow } = useSocket();

  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(null);
  const [seatCategories, setSeatCategories] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch show and initial seat data
  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        setLoading(true);
        const [showRes, seatsRes] = await Promise.all([
          showService.getShowById(showId),
          showService.getShowSeats(showId),
        ]);

        setShowData(showRes.show);
        setSeatCategories(seatsRes.seatCategories || []);
        setBookedSeats(seatsRes.bookedSeats || []);
        setLockedSeats(seatsRes.lockedSeats || []);

        if (seatsRes.myLockedSeats && seatsRes.myLockedSeats.length > 0) {
          // Restore user's active locks
          const restoredSeats = seatsRes.myLockedSeats.map((seatNum) => {
            const row = seatNum.charAt(0);
            let catName = 'Silver';
            let price = showRes.show.pricing?.silver || 220;

            seatsRes.seatCategories.forEach((cat) => {
              if (cat.rows.includes(row)) {
                catName = cat.name;
                if (cat.name.includes('VIP')) price = showRes.show.pricing?.vip || 450;
                else if (cat.name.includes('Gold')) price = showRes.show.pricing?.gold || 320;
              }
            });

            return { seatNumber: seatNum, category: catName, price };
          });
          setSelectedSeats(restoredSeats);
          setLockExpiry(seatsRes.myLockExpiry);
        }
      } catch (err) {
        setErrorMessage('Failed to load screen layout for this show.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeatData();
  }, [showId]);

  // 2. Real-time Socket.IO Show Room Sync
  useEffect(() => {
    if (!socket || !showId) return;

    joinShow(showId);

    // Initial state event
    socket.on('show_seat_state', (data) => {
      if (data.showId === showId) {
        const othersLocked = data.lockedSeats
          .filter((l) => !user || l.userId !== user.id)
          .map((l) => l.seatNumber);
        setLockedSeats(othersLocked);
      }
    });

    // When other users lock seats
    socket.on('seats_locked', (data) => {
      if (data.showId === showId) {
        if (!user || data.userId !== user.id) {
          setLockedSeats((prev) => Array.from(new Set([...prev, ...data.seats])));
        }
      }
    });

    // When seats are released or expired
    socket.on('seats_released', (data) => {
      if (data.showId === showId) {
        setLockedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
      }
    });

    socket.on('seats_expired', (data) => {
      if (data.showId === showId) {
        setLockedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
        // If my seats expired
        setSelectedSeats((prev) => {
          const remaining = prev.filter((s) => !data.seats.includes(s.seatNumber));
          if (remaining.length !== prev.length) {
            setErrorMessage('Your temporary seat hold has expired. Please reselect your seats.');
            setLockExpiry(null);
          }
          return remaining;
        });
      }
    });

    // When a booking completes
    socket.on('seats_booked', (data) => {
      if (data.showId === showId) {
        setBookedSeats((prev) => Array.from(new Set([...prev, ...data.seats])));
        setLockedSeats((prev) => prev.filter((s) => !data.seats.includes(s)));
      }
    });

    return () => {
      leaveShow(showId);
      socket.off('show_seat_state');
      socket.off('seats_locked');
      socket.off('seats_released');
      socket.off('seats_expired');
      socket.off('seats_booked');
    };
  }, [socket, showId, user]);

  // 3. Toggle seat selection & send temporary lock to backend
  const handleToggleSeat = async (seat) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/seat-selection/${showId}`);
      return;
    }

    setErrorMessage('');
    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
    let updatedSeats;

    if (exists) {
      updatedSeats = selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber);
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMessage('Maximum 8 seats allowed per booking transaction.');
        return;
      }
      updatedSeats = [...selectedSeats, seat];
    }

    setSelectedSeats(updatedSeats);

    if (updatedSeats.length > 0) {
      try {
        const res = await bookingService.lockSeats(
          showId,
          updatedSeats.map((s) => s.seatNumber),
          socket?.id
        );
        setLockExpiry(res.expiresAt);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Could not lock selected seat. It may have been taken.');
        // Revert to previously valid
        setSelectedSeats(selectedSeats);
      }
    } else {
      // Released all
      try {
        await bookingService.releaseSeats(showId);
        setLockExpiry(null);
      } catch (err) {
        //
      }
    }
  };

  const handleRemoveSeat = async (seatNumber) => {
    const updated = selectedSeats.filter((s) => s.seatNumber !== seatNumber);
    setSelectedSeats(updated);
    if (updated.length > 0) {
      try {
        const res = await bookingService.lockSeats(
          showId,
          updated.map((s) => s.seatNumber),
          socket?.id
        );
        setLockExpiry(res.expiresAt);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Could not update seat hold.');
      }
    } else {
      await bookingService.releaseSeats(showId);
      setLockExpiry(null);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }

    // Save temporary booking state in session and navigate to checkout
    sessionStorage.setItem(
      'imovies_active_booking',
      JSON.stringify({
        showId,
        selectedSeats,
        showData,
        lockExpiry,
      })
    );

    navigate(`/checkout/${showId}`);
  };

  if (loading || !showData) {
    return <Loader message="Rendering interactive cinema seat map..." />;
  }

  return (
    <div className="max-w-layout" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Back button and Show Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <Link
          to={`/movie/${showData.movieId?._id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#cbd5e1',
            fontSize: '0.88rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '8px 14px',
            borderRadius: '8px',
          }}
        >
          <ArrowLeft size={16} /> Change Showtime
        </Link>

        {/* Show Snapshot details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              {showData.movieId?.title}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {showData.theatreId?.name} • <span style={{ color: '#e50914' }}>{showData.screenId?.screenName}</span>
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#121620',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <Calendar size={14} color="#e50914" />
              <span>{showData.showDate}</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
              <Clock size={14} color="#e50914" />
              <span>{showData.startTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert message */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid #e50914',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ff525d',
            fontSize: '0.88rem',
            marginBottom: '20px',
          }}
          className="animate-slide-down"
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Seat Map Area */}
      <div
        style={{
          background: '#0d1017',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '30px 20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <SeatGrid
          seatCategories={seatCategories}
          pricing={showData.pricing}
          bookedSeats={bookedSeats}
          lockedSeats={lockedSeats}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
        />

        <SeatLegend />

        {/* Bottom Floating/Attached Summary */}
        <div style={{ maxWidth: '650px', margin: '30px auto 0' }}>
          <SeatSummary
            selectedSeats={selectedSeats}
            lockExpiry={lockExpiry}
            onProceed={handleProceedToCheckout}
            onRemoveSeat={handleRemoveSeat}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

