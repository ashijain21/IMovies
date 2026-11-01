import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Film,
  Building,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { bookingService } from '../services/bookingService';
import { Loader } from '../components/common/Loader';

export const BookingConfirmationPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getBookingById(id);
        setBooking(res.booking);

        // Celebration confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !booking) {
    return <Loader message="Generating digital ticket & QR credentials..." />;
  }

  const { movieId: movie, theatreId: theatre, showId: show } = booking;

  return (
    <div className="max-w-layout" style={{ paddingTop: '30px', paddingBottom: '70px' }}>
      {/* Success Badge */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#10b981',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle size={36} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>Booking Confirmed!</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '6px' }}>
          Your digital movie pass has been booked and dispatched to your email.
        </p>
      </div>

      {/* Action buttons (Print / Download) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '30px' }} className="no-print">
        <button onClick={handlePrint} className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
          <Printer size={16} /> Print Ticket
        </button>
        <Link to="/dashboard" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
          <Ticket size={16} /> View My Bookings
        </Link>
      </div>

      {/* DIGITAL CINEMA TICKET */}
      <div
        id="cinema-ticket"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          position: 'relative',
        }}
      >
        {/* Ticket Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e50914, #990008)',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Film size={24} />
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em' }}>IMOVIES PASS</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(0,0,0,0.25)', padding: '4px 12px', borderRadius: '12px' }}>
            ID: {booking.bookingId}
          </span>
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
          {/* Left Details */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
              {movie?.certification || 'UA'} • {movie?.language}
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              {movie?.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} color="#e50914" />
                <span>
                  <strong>{theatre?.name}</strong> ({show?.screenId?.screenName || 'Screen 1'})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#e50914" />
                <span>{theatre?.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#e50914" />
                <span>{show?.showDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#e50914" />
                <span>{show?.startTime}</span>
              </div>
            </div>

            {/* Seats Box */}
            <div style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seats Booked</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                {booking.selectedSeats.map((s) => s.seatNumber).join(', ')}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                Category: {booking.selectedSeats[0]?.category} ({booking.selectedSeats.length} {booking.selectedSeats.length === 1 ? 'Ticket' : 'Tickets'})
              </p>
            </div>
          </div>

          {/* Right QR Code & Payment info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px dashed rgba(255, 255, 255, 0.12)', paddingLeft: '20px' }}>
            {booking.qrCode ? (
              <img
                src={booking.qrCode}
                alt="Digital Ticket QR Code"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '12px',
                  background: '#fff',
                  padding: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                }}
              />
            ) : (
              <div style={{ width: '180px', height: '180px', background: '#fff', borderRadius: '12px' }} />
            )}
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
              Scan at cinema turnstile gate for entry
            </p>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Paid:</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>₹{booking.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Ticket Footer Tear Stub */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
            padding: '14px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <span>Please arrive at least 15 minutes before showtime.</span>
          <span>Status: Confirmed / Paid</span>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          #cinema-ticket { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; color: #000 !important; }
          #cinema-ticket * { color: #000 !important; }
          header, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
};

