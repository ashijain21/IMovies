import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  MapPin,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Ticket,
  ChevronDown,
  Menu,
  X,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import api from '../../services/api';

export const Navbar = ({ onOpenCityModal }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Mutually exclusive active dropdown: null | 'notifications' | 'profile'
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // References for outside-click detection
  const notificationContainerRef = useRef(null);
  const profileContainerRef = useRef(null);

  // Fetch notifications for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
          // Silent catch
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle outside click and Escape key dismissal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeDropdown) return;

      const clickedInsideNotification =
        notificationContainerRef.current &&
        notificationContainerRef.current.contains(event.target);
      const clickedInsideProfile =
        profileContainerRef.current &&
        profileContainerRef.current.contains(event.target);

      if (activeDropdown === 'notifications' && !clickedInsideNotification) {
        setActiveDropdown(null);
      } else if (activeDropdown === 'profile' && !clickedInsideProfile) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  // Auto-close open dropdowns on route changes
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      //
    }
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === 'notifications' ? null : 'notifications'));
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === 'profile' ? null : 'profile'));
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Theatres', path: '/theatres' },
    { label: 'Offers', path: '/#offers' },
  ];

  return (
    <header className="navbar-header glass-nav">
      <div
        className="max-w-layout"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}
      >
        {/* Brand Logo & City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={closeDropdowns}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #e50914, #ff3838)',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)',
              }}
            >
              <Film size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              <span style={{ color: '#fff' }}>I</span>
              <span style={{ color: '#e50914' }}>MOVIES</span>
            </span>
          </Link>

          {/* City Selector Pill */}
          <button
            type="button"
            onClick={onOpenCityModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <MapPin size={15} color="#e50914" />
            <span>{selectedCity}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>
        </div>

        {/* Center Desktop Nav Links */}
        <nav
          style={{ display: 'none', gap: '24px', alignItems: 'center' }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={closeDropdowns}
              style={{
                fontSize: '0.92rem',
                fontWeight: location.pathname === link.path ? 600 : 500,
                color: location.pathname === link.path ? '#e50914' : '#cbd5e1',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Search & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Search bar (Visible on desktop/tablet) */}
          <form
            onSubmit={handleSearch}
            className="desktop-search"
            style={{ position: 'relative' }}
          >
            <input
              type="text"
              placeholder="Search movies, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '8px 16px 8px 36px',
                color: '#fff',
                fontSize: '0.85rem',
                width: '180px',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => (e.target.style.width = '230px')}
              onBlur={(e) => (e.target.style.width = searchQuery ? '230px' : '180px')}
            />
            <Search
              size={16}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </form>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="dropdown-container" ref={notificationContainerRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="View notifications"
                aria-expanded={activeDropdown === 'notifications'}
                style={{
                  background:
                    activeDropdown === 'notifications'
                      ? 'rgba(229, 9, 20, 0.22)'
                      : 'rgba(255, 255, 255, 0.08)',
                  border:
                    activeDropdown === 'notifications'
                      ? '1px solid #e50914'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeDropdown === 'notifications' ? '#ff525d' : '#ffffff',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#e50914',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #080a0f',
                      boxShadow: '0 0 8px rgba(229, 9, 20, 0.7)',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Menu */}
              {activeDropdown === 'notifications' && (
                <div
                  className="dropdown-menu notification-dropdown animate-slide-down"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dropdown Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid #2a2f3a',
                      backgroundColor: '#181c27',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={16} color="#e50914" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            background: 'rgba(229, 9, 20, 0.2)',
                            color: '#ff4757',
                            border: '1px solid rgba(229, 9, 20, 0.4)',
                            borderRadius: '12px',
                            padding: '1px 7px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        style={{
                          color: '#e50914',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'transparent',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List Scroll Area */}
                  <div
                    style={{
                      maxHeight: '340px',
                      overflowY: 'auto',
                      padding: '12px',
                      backgroundColor: '#151821',
                    }}
                  >
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '24px 16px',
                          color: '#94a3b8',
                        }}
                      >
                        <CheckCircle2
                          size={28}
                          color="#64748b"
                          style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }}
                        />
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                          You're all caught up!
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Booking confirmations and cinema alerts will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: n.isRead ? '#1a1f2c' : '#221a24',
                            borderLeft: n.isRead
                              ? '3px solid transparent'
                              : '3px solid #e50914',
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            marginBottom: '8px',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '8px',
                              marginBottom: '2px',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                color: '#ffffff',
                              }}
                            >
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#e50914',
                                  flexShrink: 0,
                                  marginTop: '4px',
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: '0.78rem',
                              color: '#cbd5e1',
                              lineHeight: '1.4',
                            }}
                          >
                            {n.message}
                          </p>
                          {n.createdAt && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#64748b',
                                marginTop: '4px',
                                display: 'block',
                              }}
                            >
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Dropdown Menu or Sign In Button */}
          {isAuthenticated ? (
            <div className="dropdown-container" ref={profileContainerRef}>
              <button
                type="button"
                onClick={toggleProfile}
                aria-label="User profile menu"
                aria-expanded={activeDropdown === 'profile'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background:
                    activeDropdown === 'profile'
                      ? 'rgba(255, 255, 255, 0.16)'
                      : 'rgba(255, 255, 255, 0.08)',
                  padding: '5px 12px 5px 5px',
                  borderRadius: '24px',
                  border:
                    activeDropdown === 'profile'
                      ? '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <img
                  src={
                    user.profileImage ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                  }
                  alt={user.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown
                  size={14}
                  color="#94a3b8"
                  style={{
                    transform:
                      activeDropdown === 'profile' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* Profile Dropdown Popup Menu */}
              {activeDropdown === 'profile' && (
                <div
                  className="dropdown-menu profile-dropdown animate-slide-down"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User Profile Header */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #2a2f3a',
                      backgroundColor: '#181c27',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={
                          user.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                        }
                        alt={user.name}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e50914',
                        }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <p
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {user.name}
                        </p>
                        <p
                          style={{
                            fontSize: '0.74rem',
                            color: '#94a3b8',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ marginTop: '8px' }}>
                        <span
                          className="badge badge-primary"
                          style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                        >
                          Administrator
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Profile Menu Navigation Links */}
                  <div style={{ padding: '8px', backgroundColor: '#151821' }}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeDropdowns}
                        className="dropdown-item admin"
                      >
                        <LayoutDashboard size={16} /> Admin Portal
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      onClick={closeDropdowns}
                      className="dropdown-item"
                    >
                      <Ticket size={16} /> My Bookings
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={closeDropdowns}
                      className="dropdown-item"
                    >
                      <Settings size={16} /> Profile & Settings
                    </Link>

                    <div
                      style={{
                        height: '1px',
                        background: '#2a2f3a',
                        margin: '6px 0',
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        closeDropdowns();
                        logout();
                        navigate('/');
                      }}
                      className="dropdown-item danger"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              onClick={closeDropdowns}
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: '#fff',
            }}
            className="mobile-only-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#151821',
            borderBottom: '1px solid #2a2f3a',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1rem', color: '#cbd5e1', padding: '6px 0' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-only-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-search { display: none !important; }
        }
      `}</style>
    </header>
  );
};
