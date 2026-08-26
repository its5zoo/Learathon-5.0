// Centralized API Base URL configuration
// In production (Vercel): Set VITE_API_URL in Vercel Environment Variables
// In development: Defaults to http://localhost:5000/api
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
