import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Film, Building, CreditCard } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <Loader message="Compiling analytics trends and revenue reports..." />;
  }

  const { dailyRevenue = [], popularMovies = [], theatrePopularity = [], paymentBreakdown = [] } = data;

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1000);

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Analytics & Revenue Reports</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Daily booking trends, blockbuster performance, and payment distributions</p>
      </div>

      {/* 1. Daily Revenue Bar Visualizer */}
      <div
        style={{
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '24px',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TrendingUp size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>7-Day Revenue Velocity (₹)</h3>
        </div>

        {/* Visual Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', gap: '12px', padding: '10px 0' }}>
          {dailyRevenue.map((item) => {
            const heightPercent = Math.max(10, Math.round((item.revenue / maxRevenue) * 100));
            return (
              <div key={item.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
                  ₹{item.revenue}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPercent}%`,
                    background: 'linear-gradient(to top, #e50914, #ff525d)',
                    borderRadius: '8px 8px 0 0',
                    boxShadow: '0 0 15px rgba(229, 9, 20, 0.4)',
                    transition: 'height 0.4s ease',
                  }}
                  title={`${item.date}: ₹${item.revenue} (${item.bookings} bookings)`}
                />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '8px', fontWeight: 600 }}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Popular Movies & Theatres Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Most Popular Movies */}
        <div
          style={{
            background: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Film size={20} color="#e50914" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Top Performing Movies</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {popularMovies.map((movie, idx) => (
              <div
                key={movie.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#e50914', width: '20px' }}>
                    #{idx + 1}
                  </span>
                  <img src={movie.poster} alt={movie.title} style={{ width: '36px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{movie.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{movie.bookingCount} customer bookings</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{movie.totalRevenue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Visited Theatres */}
        <div
          style={{
            background: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Building size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Top Cinema Locations</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {theatrePopularity.map((theatre, idx) => (
              <div
                key={theatre.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{theatre.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{theatre.city} • {theatre.totalBookings} visits</p>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{theatre.totalRevenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

