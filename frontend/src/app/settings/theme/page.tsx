'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { updateUser } = useAuth();

  const handleTheme = async (t: string) => {
    setTheme(t);
    try {
      const res = await api.patch('/users/me/preferences', { theme: t });
      updateUser(res.data.data);
    } catch { }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>Theme</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Choose between light and dark mode. Your preference is saved and applied on every visit.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 500 }}>
        {[
          { key: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright interface' },
          { key: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes at night' },
        ].map(opt => {
          const Icon = opt.icon;
          const active = theme === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleTheme(opt.key)}
              style={{
                padding: '20px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent-light)' : 'var(--card-bg)',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={24} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 10 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{opt.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{opt.desc}</p>
              {active && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 8, display: 'block' }}>✓ Active</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
