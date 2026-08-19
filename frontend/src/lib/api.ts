import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

// Set token as a default header on startup (runs once on client)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('pyramid_token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Call this whenever the token changes (login / logout)
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
