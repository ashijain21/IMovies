import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, X } from 'lucide-react';

export const SeatSummary = ({
  selectedSeats = [],
  lockExpiry,
  onProceed,
  onRemoveSeat,
  isProcessing = false,
}) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown timer for 5-minute temporary seat lock
  useEffect(() => {
    if (!lockExpiry || selectedSeats.length === 0) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const diff = new Date(lockExpiry).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00 (Expired)');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lockExpiry, selectedSeats.length]);

  const subtotal = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

  if (selectedSeats.length === 0) {
    return (
      <div
        style={{
          background: '#121620',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>No seats selected yet</p>
        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
          Click on any available seat on the grid to reserve your spot.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#121620',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header & Lock Timer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Selected Seats</h4>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
          </span>
        </div>

        {timeLeft && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '6px 12px',
              borderRadius: '20px',
              color: '#f59e0b',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <Timer size={14} />
            <span>Lock: {timeLeft}</span>
          </div>
        )}
      </div>

      {/* Seat Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {selectedSeats.map((seat) => (
          <div
            key={seat.seatNumber}
            style={{
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{seat.seatNumber}</span>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>({seat.category})</span>
            <span style={{ fontSize: '0.8rem', color: '#ff525d', fontWeight: 600 }}>₹{seat.price}</span>
            <button
              onClick={() => onRemoveSeat && onRemoveSeat(seat.seatNumber)}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Subtotal</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>₹{subtotal}</span>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={onProceed}
        className="btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
      >
        <span>{isProcessing ? 'Locking Seats...' : `Proceed to Pay (₹${subtotal})`}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

