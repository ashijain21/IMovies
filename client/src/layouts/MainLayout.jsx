import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CityModal } from '../components/common/CityModal';

export const MainLayout = () => {
  const [cityModalOpen, setCityModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080a0f' }}>
      <Navbar onOpenCityModal={() => setCityModalOpen(true)} />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <CityModal isOpen={cityModalOpen} onClose={() => setCityModalOpen(false)} />
    </div>
  );
};

