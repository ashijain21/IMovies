import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';

export const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080a0f' }}>
      <AdminSidebar />
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

