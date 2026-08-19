'use client';
import { useState, useEffect, useCallback } from 'react';
import api, { setAuthToken } from '@/lib/api';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pyramid_token');
    const stored = localStorage.getItem('pyramid_user');
    if (token && stored) {
      try {
        setAuthToken(token);          // ← attach to axios immediately
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const guestLogin = useCallback(async () => {
    const res = await api.post('/auth/guest');
    const { token, user: u } = res.data.data;
    localStorage.setItem('pyramid_token', token);
    localStorage.setItem('pyramid_user', JSON.stringify(u));
    setAuthToken(token);              // ← attach immediately after login
    setUser(u);
    return u;
  }, []);

  const googleLogin = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }, []);

  const setTokenAndUser = useCallback((token: string, userData: User) => {
    localStorage.setItem('pyramid_token', token);
    localStorage.setItem('pyramid_user', JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pyramid_token');
    localStorage.removeItem('pyramid_user');
    setAuthToken(null);              // ← clear from axios on logout
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    localStorage.setItem('pyramid_user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  return { user, loading, guestLogin, googleLogin, logout, updateUser, setTokenAndUser };
}
