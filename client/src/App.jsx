import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import { SocketProvider } from './context/SocketContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

