import React, { createContext, useContext, useState, useEffect } from 'react';
import { theatreService } from '../services/theatreService';

const CityContext = createContext(null);

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem('imovies_city') || 'Mumbai';
  });
  const [availableCities, setAvailableCities] = useState([
    'Mumbai',
    'Delhi',
    'Bengaluru',
    'Kolkata',
    'Hyderabad',
  ]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await theatreService.getCities();
        if (res.cities && res.cities.length > 0) {
          setAvailableCities(res.cities);
        }
      } catch (err) {
        // Fallback default cities already set
      }
    };
    fetchCities();
  }, []);

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    localStorage.setItem('imovies_city', city);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        availableCities,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

