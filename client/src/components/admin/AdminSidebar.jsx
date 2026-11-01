import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building,
  CalendarDays,
  Ticket,
  Users,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';

export const AdminSidebar = () => {
  const location = useLocation();

  const links = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Movies', path: '/admin/movies', icon: Film },
    { label: 'Theatres & Screens', path: '/admin/theatres', icon: Building },
    { label: 'Show Schedules', path: '/admin/shows', icon: CalendarDays },
    { label: 'All Bookings', path: '/admin/bookings', icon: Ticket },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Analytics & Revenue', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: '#0d1017',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: '100vh',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '0 12px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#e50914', padding: '6px', borderRadius: '8px' }}>
            <Film size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>IMOVIES ADMIN</span>
        </Link>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: active ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                border: active ? '1px solid rgba(229, 9, 20, 0.3)' : '1px solid transparent',
                color: active ? '#fff' : '#94a3b8',
                fontWeight: active ? 700 : 500,
                fontSize: '0.88rem',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={18} color={active ? '#e50914' : '#64748b'} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Back to Client App */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <ArrowLeft size={16} /> Return to Storefront
        </Link>
      </div>
    </aside>
  );
};

