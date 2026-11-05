// src/store/store.js
// Redux Store configuration for Latitude Techno Labs Enterprise Workplace

import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../services/api/apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;

