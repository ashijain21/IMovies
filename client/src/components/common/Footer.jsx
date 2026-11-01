import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, CreditCard, Sparkles, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#07090e', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '80px', padding: '60px 0 30px' }}>
      <div className="max-w-layout">
        {/* Features Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '40px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(229, 9, 20, 0.15)', padding: '12px', borderRadius: '12px', color: '#e50914' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Curated Blockbusters</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Latest releases & IMAX Laser</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '12px', color: '#f59e0b' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Guaranteed Reserved Seats</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Live lock & atomic booking</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '12px', color: '#60a5fa' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>100% Secure Checkout</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>UPI, Cards, Netbanking & Instant Refund</p>
            </div>
          </div>
        </div>

        {/* Links Column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '30px',
          marginBottom: '40px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#e50914', padding: '6px', borderRadius: '8px' }}>
                <Film size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                IMOVIES
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
              India's premier movie ticketing and cinema management experience. Book your favorite seats in IMAX, Dolby Atmos, and 4DX with ease.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '14px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <Link to="/movies?status=now_showing" style={{ transition: 'color 0.2s' }}>Now Showing</Link>
              <Link to="/movies?status=upcoming">Upcoming Movies</Link>
              <Link to="/theatres">Theatres & Cinemas</Link>
              <Link to="/#offers">Exclusive Offers</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '14px' }}>Top Cities</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Mumbai</span>
              <span>Delhi NCR</span>
              <span>Bengaluru</span>
              <span>Hyderabad</span>
              <span>Kolkata</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '14px' }}>Support & Help</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#e50914" />
                <span>1800-419-MOVIES</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="#e50914" />
                <span>support@imovies.com</span>
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '6px' }}>24/7 Dedicated Ticket Support</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#64748b',
        }}>
          <p>© 2026 IMovies Cinema Entertainment Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

