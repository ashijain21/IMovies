import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Film,
  Building,
  Calendar,
  Ticket,
  IndianRupee,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatsCard } from '../../components/admin/StatsCard';
import { Loader } from '../../components/common/Loader';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        setStats(res.stats);
        setRecentBookings(res.recentBookings || []);
        setUpcomingShows(res.upcomingShows || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return <Loader message="Compiling cinema metrics & revenue analytics..." />;
  }

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Cinema Management Overview</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
          Real-time metrics, show scheduling, revenue aggregates, and active bookings
        </p>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatsCard
          title="Total Gross Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtitle="All confirmed bookings"
          icon={IndianRupee}
          color="#10b981"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle={`${stats.todayBookingsCount} booked today`}
          icon={Ticket}
          color="#e50914"
        />
        <StatsCard
          title="Active Movies"
          value={stats.totalMovies}
          subtitle="Currently catalogued"
          icon={Film}
          color="#3b82f6"
        />
        <StatsCard
          title="Theatres & Screens"
          value={`${stats.totalTheatres} / ${stats.totalScreens}`}
          subtitle="Across major metropolitan hubs"
          icon={Building}
          color="#f59e0b"
        />
      </div>

      {/* Two Column Section: Recent Bookings & Upcoming Shows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Recent Bookings */}
        <div
          style={{
            background: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Recent Customer Bookings</h3>
            <Link to="/admin/bookings" style={{ color: '#e50914', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>View All</span> <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentBookings.map((b) => (
              <div
                key={b._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{b.movieId?.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {b.bookingId} • {b.userId?.name || 'Customer'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>₹{b.totalAmount}</p>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Shows */}
        <div
          style={{
            background: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Upcoming Scheduled Shows</h3>
            <Link to="/admin/shows" style={{ color: '#e50914', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>Manage Schedules</span> <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingShows.map((s) => (
              <div
                key={s._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{s.movieId?.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {s.theatreId?.name} ({s.screenId?.screenName})
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa' }}>{s.startTime}</p>
                  <p style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{s.showDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

