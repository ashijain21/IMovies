import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

import { HomePage } from '../pages/HomePage';
import { MoviesPage } from '../pages/MoviesPage';
import { MovieDetailsPage } from '../pages/MovieDetailsPage';
import { TheatresPage } from '../pages/TheatresPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BookingConfirmationPage } from '../pages/BookingConfirmationPage';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminMovies } from '../pages/admin/AdminMovies';
import { AdminTheatres } from '../pages/admin/AdminTheatres';
import { AdminShows } from '../pages/admin/AdminShows';
import { AdminBookings } from '../pages/admin/AdminBookings';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Facing Storefront Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movie/:id" element={<MovieDetailsPage />} />
        <Route path="theatres" element={<TheatresPage />} />
        <Route path="seat-selection/:showId" element={<SeatSelectionPage />} />
        
        {/* Protected Customer Routes */}
        <Route
          path="checkout/:showId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking/confirmation/:id"
          element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Auth Pages */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Admin Portal Layout (Role: admin only) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="movies" element={<AdminMovies />} />
        <Route path="theatres" element={<AdminTheatres />} />
        <Route path="shows" element={<AdminShows />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

