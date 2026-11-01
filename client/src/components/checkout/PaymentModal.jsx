import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  onCompletePayment,
  isProcessing = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardName, setCardName] = useState('John Doe');
  const [upiId, setUpiId] = useState('john@okhdfcbank');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onCompletePayment({
      paymentMethod: selectedMethod,
      gatewayPaymentId: `PAY_${Date.now()}`,
    });
  };

  const methods = [
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone },
    { id: 'netbanking', name: 'Net Banking', icon: Building2 },
    { id: 'mock', name: 'Instant Mock Sandbox', icon: CheckCircle2 },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-down"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '6px' }}>
              <ShieldCheck size={12} /> 256-Bit SSL Encrypted
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Payment Gateway</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount to Pay Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.15), rgba(18, 22, 32, 0.5))',
            border: '1px solid rgba(229, 9, 20, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Total Payable Amount</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>₹{totalAmount}</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Includes all taxes & fees</span>
        </div>

        {/* Method Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {methods.map((m) => {
            const Icon = m.icon;
            const active = selectedMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: active ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: active ? '1px solid #e50914' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: active ? '#fff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <Icon size={16} color={active ? '#e50914' : '#94a3b8'} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Payment Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {selectedMethod === 'card' && (
            <>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Card Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 0000 0000 0000"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Valid Thru</label>
                  <input
                    type="text"
                    className="input-field"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="input-field"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Cardholder Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Full Name as on Card"
                  required
                />
              </div>
            </>
          )}

          {selectedMethod === 'upi' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Virtual Payment Address (VPA)</label>
              <input
                type="text"
                className="input-field"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okhdfcbank"
                required
              />
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                A payment request will be sent to your UPI application.
              </p>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Select Your Bank</label>
              <select className="input-field" style={{ background: '#1a202c' }}>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="AXIS">Axis Bank</option>
                <option value="KOTAK">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {selectedMethod === 'mock' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>Development Mock Sandbox Mode:</strong>
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                Simulates an instant successful Razorpay/Bank authorization without requiring live card numbers.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
          >
            {isProcessing ? 'Verifying & Confirming...' : `Pay ₹${totalAmount} Now`}
          </button>
        </form>
      </div>
    </div>
  );
};

