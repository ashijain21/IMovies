import React from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export const CityModal = ({ isOpen, onClose }) => {
  const { selectedCity, setSelectedCity, availableCities } = useCity();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#121620',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-down"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Select Your City</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Discover movies and showtimes near you</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {availableCities.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid #e50914' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#fff' : '#cbd5e1',
                  fontWeight: isSelected ? 600 : 500,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} color={isSelected ? '#e50914' : '#94a3b8'} />
                  <span>{city}</span>
                </div>
                {isSelected && <Check size={16} color="#e50914" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

