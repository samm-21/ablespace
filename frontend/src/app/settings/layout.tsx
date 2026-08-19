'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Sun, Palette, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SETTINGS_NAV = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/theme', label: 'Theme', icon: Sun },
  { href: '/settings/color', label: 'Color', icon: Palette },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Never call router.push during render — use useEffect
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--surface)' }} />;
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Settings sidebar */}
      <aside style={{
        width: 210, flexShrink: 0, background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)', padding: '16px 8px',
      }}>
        <Link href="/tasks">
          <button className="btn-ghost" style={{ marginBottom: 16, fontSize: 13, gap: 5, width: '100%', justifyContent: 'flex-start' }}>
            <ArrowLeft size={14} /> Back to app
          </button>
        </Link>

        {SETTINGS_NAV.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: 6, marginBottom: 2, cursor: 'pointer', fontSize: 14,
                background: active ? 'var(--accent-light)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400, transition: 'background 0.15s',
              }}>
                <Icon size={15} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </aside>

      {/* Settings content */}
      <main style={{ flex: 1, padding: '40px 48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
