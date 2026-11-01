import React, { useState, useEffect } from 'react';
import { Search, Ticket, Calendar, Clock, Filter, Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBookings({
        search,
        status,
        page,
        limit: 15,
      });
      setBookings(res.bookings || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, status, page]);

  return (
    <div style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Customer Bookings Ledger</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Full record of tickets issued, transaction amounts, and booking statuses</p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search by Booking ID (e.g. IMV-...)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ paddingLeft: '38px', borderRadius: '10px' }}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field"
          style={{ width: 'auto', background: '#1a202c' }}
        >
          <option value="All">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loader message="Loading booking records..." />
      ) : (
        <div style={{ background: '#121620', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>Booking ID</th>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Movie</th>
                <th style={{ padding: '14px 16px' }}>Theatre</th>
                <th style={{ padding: '14px 16px' }}>Seats</th>
                <th style={{ padding: '14px 16px' }}>Amount</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#e50914' }}>
                    {b.bookingId}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: 600, color: '#fff' }}>{b.userId?.name || 'Customer'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.userId?.email}</p>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1', fontWeight: 600 }}>
                    {b.movieId?.title}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                    {b.theatreId?.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700 }}>
                    {b.selectedSeats.map((s) => s.seatNumber).join(', ')}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 800 }}>
                    ₹{b.totalAmount}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {b.bookingStatus === 'confirmed' ? (
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Confirmed</span>
                    ) : (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

