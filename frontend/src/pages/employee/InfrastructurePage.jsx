// src/pages/employee/InfrastructurePage.jsx
// Redirects to the unified Ticket Generation Portal

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function InfrastructurePage() {
  return <Navigate to="/tickets" replace />;
}
