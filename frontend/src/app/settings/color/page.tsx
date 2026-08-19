'use client';
import { useState } from 'react';
import { useColorMode } from '@/components/ThemeProvider';
import { COLOR_MODES } from '@/lib/constants';
import { ColorMode } from '@/types';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function ColorSettingsPage() {
  const { setColorMode, getColorMode } = useColorMode();
  const { updateUser } = useAuth();
  const [currentColor, setCurrentColor] = useState<ColorMode>(getColorMode());

  const handleColor = async (color: ColorMode) => {
    setColorMode(color);
    setCurrentColor(color);
    try {
      const res = await api.patch('/users/me/preferences', { colorMode: color });
      updateUser(res.data.data);
    } catch { }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>Color Mode</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Choose your accent color. This affects buttons, active states, and highlights throughout the app.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 500 }}>
        {COLOR_MODES.map(c => {
          const active = currentColor === c.key;
          return (
            <button
              key={c.key}
              onClick={() => handleColor(c.key as ColorMode)}
              style={{
                padding: '16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${active ? c.hex : 'var(--border)'}`,
                background: active ? `${c.hex}15` : 'var(--card-bg)',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 5, background: c.hex, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{c.label}</p>
                {active && <p style={{ fontSize: 11, color: c.hex, margin: 0, fontWeight: 600 }}>Active</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
