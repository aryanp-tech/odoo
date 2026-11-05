// src/App.jsx
// Root application container with routing and toasts

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
