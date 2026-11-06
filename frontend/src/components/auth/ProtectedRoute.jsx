// src/components/auth/ProtectedRoute.jsx
// Route guard ensuring only authenticated employees can access internal portal modules

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const authed = isAuthenticated();

  if (!authed) {
    // Preserve the location user tried to visit for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

