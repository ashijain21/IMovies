import React from 'react';

export const SeatLegend = () => {
  const items = [
    { label: 'Available', color: '#1e2638', border: '#475569' },
    { label: 'Selected', color: '#e50914', border: '#ff4757', glow: true },
    { label: 'Locked / Reserved', color: '#b45309', border: '#f59e0b' },
    { label: 'Sold / Booked', color: '#141720', border: '#1f2533', disabled: true },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '14px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        margin: '24px 0',
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: item.color,
              border: `1px solid ${item.border}`,
              boxShadow: item.glow ? '0 0 10px rgba(229, 9, 20, 0.6)' : 'none',
              opacity: item.disabled ? 0.4 : 1,
            }}
          />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

