'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!loading && !user && !redirected.current) {
      redirected.current = true;
      router.push('/login');
    }
  }, [user, loading]);

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--surface)' }} />;
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Sidebar */}
      <div style={{ flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(o => !o)} />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
