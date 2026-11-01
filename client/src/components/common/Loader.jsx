import React from 'react';
import { Film } from 'lucide-react';

export const Loader = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', minHeight: '300px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '3px solid rgba(229, 9, 20, 0.2)',
          borderTopColor: '#e50914',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 0.9s linear infinite',
          boxShadow: '0 0 20px rgba(229, 9, 20, 0.4)',
          marginBottom: '16px',
        }}
      >
        <Film size={24} color="#e50914" />
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

