'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [title, setTitle] = useState(user?.title || '');
  const [username, setUsername] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setTitle(user.title || '');
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { fullName, title, username });
      updateUser(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { } finally { setSaving(false); }
  };

  const handleLeaveWorkspace = async () => {
    if (!confirm('Are you sure you want to leave the workspace? This action cannot be undone.')) return;
    await api.delete('/users/me');
    localStorage.clear();
    window.location.href = '/login';
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>Profile</h1>

      {/* Profile info card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        {/* Profile picture */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Profile picture</span>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
            color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', overflow: 'hidden',
          }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
          </div>
        </div>

        {/* Email */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Email</span>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user?.email || '—'}</span>
        </div>

        {/* Full name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Full name</p>
          </div>
          <input
            className="input-base"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{ maxWidth: 200 }}
            placeholder="Your full name"
          />
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Title</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>Your job title or role</p>
          </div>
          <input
            className="input-base"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ maxWidth: 200 }}
            placeholder="Designer"
          />
        </div>

        {/* Username */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Username</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>One word, like a nickname or first name</p>
          </div>
          <input
            className="input-base"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ maxWidth: 200 }}
            placeholder="username"
          />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: 40 }}>
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
      </button>

      {/* Workspace access */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Workspace access</h2>
      <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Remove yourself from the workspace</span>
        <button
          onClick={handleLeaveWorkspace}
          style={{
            padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500,
            background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
        >
          Leave Workspace
        </button>
      </div>
    </div>
  );
}
