import axios from 'axios';
import { supabase } from './supabase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async config => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

// Handle 401s globally
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);