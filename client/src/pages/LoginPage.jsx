import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage('');
      await login({ email, password });
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('Admin@12345');
    } else {
      setEmail('user@imovies.com');
      setPassword('User@12345');
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              background: '#e50914',
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)',
            }}
          >
            <Film size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
            Sign in to access your booked tickets and cinema privileges
          </p>
        </div>

        {/* Demo Accounts Bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.78rem',
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#f59e0b', fontWeight: 700 }}>
            <Sparkles size={14} /> Quick Demo Fill:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                background: 'rgba(229, 9, 20, 0.2)',
                border: '1px solid rgba(229, 9, 20, 0.4)',
                color: '#ff525d',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Demo Admin
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid #e50914',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ff525d',
              fontSize: '0.85rem',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#e50914' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '24px' }}>
          Don't have an account yet?{' '}
          <Link to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: '#e50914', fontWeight: 600 }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

