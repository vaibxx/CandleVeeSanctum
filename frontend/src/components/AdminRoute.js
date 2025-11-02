import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};