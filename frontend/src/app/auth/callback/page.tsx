'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api, { setAuthToken } from '@/lib/api';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setTokenAndUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { router.push('/login'); return; }

    // Set header FIRST so the /auth/me call is authenticated
    setAuthToken(token);
    localStorage.setItem('pyramid_token', token);

    api.get('/auth/me')
      .then(res => {
        setTokenAndUser(token, res.data.data);
        router.push('/tasks');
      })
      .catch(() => {
        // Clear the invalid token and redirect
        setAuthToken(null);
        localStorage.removeItem('pyramid_token');
        router.push('/login');
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return <Suspense><CallbackHandler /></Suspense>;
}
