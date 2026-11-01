import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter token & new password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(resetToken, newPassword);
      setMessage('Password reset successfully! You can now sign in.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
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
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '20px' }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Password Recovery</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
            {step === 1 ? 'Enter your registered email to receive a recovery token.' : 'Set your new secure password.'}
          </p>
        </div>

        {message && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#34d399',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid #e50914',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ff525d',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Processing...' : 'Send Recovery Token'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Recovery Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Link to="/login" className="btn-primary" style={{ padding: '12px 24px', display: 'inline-block' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

