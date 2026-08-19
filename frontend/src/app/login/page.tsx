'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { guestLogin, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuest = async () => {
    try {
      setLoading(true);
      setError('');
      await guestLogin();
      router.push('/tasks');
    } catch (err: any) {
      console.error('Guest login failed', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to connect to server. Is the backend running on port 3001?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--surface)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L22 20H2L12 3Z" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Pyramid</span>
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm p-8">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, textAlign: 'center' }}>
          Let's get back on track
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24 }}>
          Enter your email below to login to your account.
        </p>

        {/* Continue as Guest */}
        <button
          onClick={handleGuest}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', marginBottom: 10,
            background: '#111111', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 15, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Signing in...' : 'Continue as Guest'}
        </button>

        {/* Login with Google */}
        <button
          onClick={googleLogin}
          style={{
            width: '100%', padding: '11px',
            background: 'var(--surface)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: 15, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Login with Google
        </button>

        {error && (
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 7,
            background: '#fef2f2', border: '1px solid #fecaca',
            fontSize: 13, color: '#dc2626', lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280 }}>
        By clicking continue, you agree to our{' '}
        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Terms of Service</a>
        {' '}and{' '}
        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</a>
      </p>
    </main>
  );
}
