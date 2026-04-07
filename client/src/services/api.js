import axios from 'axios';
import { shouldClearAuthOnError } from '../lib/onboarding-flow';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Redirect to sign-in on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (shouldClearAuthOnError(err)) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(err);
  }
);

export default api;
