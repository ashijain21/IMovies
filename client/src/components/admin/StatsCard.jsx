import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = '#e50914' }) => {
  return (
    <div
      style={{
        background: '#121620',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </p>
        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
          {value}
        </p>
        {subtitle && <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{subtitle}</p>}
      </div>

      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          background: `${color}1a`,
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};

