import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Building,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from '../components/checkout/PaymentModal';
import { Loader } from '../components/common/Loader';

export const CheckoutPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingData, setBookingData] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isCalculating, setIsCalculating] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Read session booking data
  useEffect(() => {
    const rawData = sessionStorage.getItem('imovies_active_booking');
    if (!rawData) {
      navigate('/movies');
      return;
    }
    const parsed = JSON.parse(rawData);
    if (parsed.showId !== showId) {
      navigate('/movies');
      return;
    }
    setBookingData(parsed);
  }, [showId, navigate]);

  // 2. Fetch order calculations from backend
  const calculateOrder = async (code = '') => {
    if (!bookingData) return;
    try {
      setIsCalculating(true);
      const res = await bookingService.calculateOrder({
        showId: bookingData.showId,
        selectedSeats: bookingData.selectedSeats,
        couponCode: code,
      });
      setOrderSummary(res.summary);
      if (code && res.summary.discount > 0) {
        setAppliedCoupon(code);
        setDiscountAmount(res.summary.discount);
        setCouponError('');
      } else if (code) {
        setCouponError('Invalid coupon code. Try "IMOVIES50" for 20% off.');
        setAppliedCoupon('');
        setDiscountAmount(0);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to calculate order summary.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (bookingData) {
      calculateOrder();
    }
  }, [bookingData]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      calculateOrder(couponCode.trim().toUpperCase());
    }
  };

  // 3. Initiate checkout payment
  const handleStartPayment = () => {
    setIsPaymentModalOpen(true);
  };

  // 4. On completing payment verification modal
  const handleCompletePayment = async ({ paymentMethod, gatewayPaymentId }) => {
    try {
      setIsProcessing(true);
      setIsPaymentModalOpen(false);

      const payload = {
        showId: bookingData.showId,
        selectedSeats: bookingData.selectedSeats,
        paymentMethod,
        discount: discountAmount,
        gatewayOrderId: `ORDER_${Date.now()}`,
        gatewayPaymentId,
      };

      const res = await bookingService.confirmBooking(payload);

      if (res.success && res.booking?._id) {
        // Clear session booking
        sessionStorage.removeItem('imovies_active_booking');
        navigate(`/booking/confirmation/${res.booking._id}`, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Payment confirmation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!bookingData || isCalculating) {
    return <Loader message="Preparing your secure booking checkout..." />;
  }

  const { showData, selectedSeats } = bookingData;

  return (
    <div className="max-w-layout" style={{ paddingTop: '28px', paddingBottom: '70px' }}>
      {/* Return button */}
      <Link
        to={`/seat-selection/${showId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#cbd5e1',
          fontSize: '0.85rem',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Back to Seat Selection
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>
        Review Order & Checkout
      </h1>

      {errorMessage && (
        <div
          style={{
            background: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid #e50914',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ff525d',
            fontSize: '0.9rem',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Left: Movie & Showtime Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: '#121620',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              gap: '20px',
            }}
          >
            <img
              src={showData.movieId?.poster}
              alt={showData.movieId?.title}
              style={{ width: '100px', height: '145px', objectFit: 'cover', borderRadius: '10px' }}
            />
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                {showData.movieId?.certification || 'UA'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {showData.movieId?.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '12px' }}>
                {showData.movieId?.language} • {showData.screenId?.screenType}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={14} color="#e50914" />
                  <span>{showData.theatreId?.name} ({showData.screenId?.screenName})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#e50914" />
                  <span>{showData.showDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#e50914" />
                  <span>{showData.startTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div
            style={{
              background: '#121620',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px 24px',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              Reserved Seats ({selectedSeats.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedSeats.map((s) => (
                <div
                  key={s.seatNumber}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong style={{ color: '#fff' }}>{s.seatNumber}</strong>{' '}
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({s.category})</span> —{' '}
                  <span style={{ color: '#ff525d' }}>₹{s.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div
            style={{
              background: '#121620',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px 24px',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
              Booking Contact
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              <strong>Name:</strong> {user?.name}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
              Digital ticket & QR entry code will be dispatched to this email immediately upon payment.
            </p>
          </div>
        </div>

        {/* Right: Payment & Price Breakdown */}
        <div>
          <div
            style={{
              background: '#121620',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '18px' }}>
              Payment Summary
            </h3>

            {/* Price breakdown rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Ticket Subtotal</span>
                <span style={{ fontWeight: 600 }}>₹{orderSummary?.subtotal || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Convenience Fee</span>
                <span style={{ fontWeight: 600 }}>₹{orderSummary?.convenienceFee || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Integrated GST (18%)</span>
                <span style={{ fontWeight: 600 }}>₹{orderSummary?.taxes || 0}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Discount ({appliedCoupon})</span>
                  <span style={{ fontWeight: 700 }}>- ₹{discountAmount}</span>
                </div>
              )}

              {/* Total Payable */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '16px',
                  marginTop: '8px',
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Amount Payable</span>
                <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#e50914' }}>
                  ₹{orderSummary?.totalAmount || 0}
                </span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Promo code (try IMOVIES50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input-field"
                  style={{ textTransform: 'uppercase', padding: '10px 14px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                  Apply
                </button>
              </form>
              {appliedCoupon && (
                <p style={{ color: '#34d399', fontSize: '0.78rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> Coupon {appliedCoupon} applied!
                </p>
              )}
              {couponError && (
                <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '6px' }}>{couponError}</p>
              )}
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartPayment}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                marginTop: '24px',
                borderRadius: '12px',
              }}
            >
              {isProcessing ? 'Processing Transaction...' : `Proceed to Pay ₹${orderSummary?.totalAmount || 0}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px', color: '#64748b', fontSize: '0.75rem' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Safe & Secure 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={orderSummary?.totalAmount || 0}
        onCompletePayment={handleCompletePayment}
        isProcessing={isProcessing}
      />
    </div>
  );
};

