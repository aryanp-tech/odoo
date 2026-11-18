// src/components/auth/ProtectedRoute.jsx
// Role-aware route guard ensuring only authenticated users with allowed roles can access internal portal modules

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAuthenticated, getStoredSession } from '../../services/authService';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const authed = isAuthenticated();
  const sessionUser = getStoredSession();
  const userRole = sessionUser?.role || 'employee';

  const isRoleAllowed = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(userRole);

  useEffect(() => {
    if (authed && !isRoleAllowed) {
      toast.error('Access Denied: You do not have permissions for this page.');
    }
  }, [authed, isRoleAllowed]);

  if (!authed) {
    // Preserve the location user tried to visit for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isRoleAllowed) {
    // Safe role-based fallback destination
    let fallbackPath = '/';
    if (userRole === 'super_admin') fallbackPath = '/admin';
    else if (userRole === 'hr_admin') fallbackPath = '/admin/employees';
    else if (userRole === 'it_admin') fallbackPath = '/assets';

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
