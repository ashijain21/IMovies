import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In dev, connect to backend socket server
    const socketUrl = window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin;
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinShow = (showId) => {
    if (socket && showId) {
      socket.emit('join_show_room', showId);
    }
  };

  const leaveShow = (showId) => {
    if (socket && showId) {
      socket.emit('leave_show_room', showId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinShow, leaveShow }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

