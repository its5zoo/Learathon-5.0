// Centralized API Base URL configuration
// In production (Vercel): Defaults to relative '/api' on same domain (or custom VITE_API_URL)
// In development: Defaults to http://localhost:5000/api
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

