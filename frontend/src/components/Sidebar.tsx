'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutGrid, FolderOpen, ChevronDown, ChevronRight,
  Settings, Sun, Moon, Palette, LogOut, User, PanelLeft,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useColorMode } from './ThemeProvider';
import { COLOR_MODES } from '@/lib/constants';
import { ColorMode } from '@/types';
import api from '@/lib/api';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setColorMode, getColorMode } = useColorMode();

  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<ColorMode>('blue');

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentColor(getColorMode());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setThemeMenuOpen(false);
        setColorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = async (color: ColorMode) => {
    setColorMode(color);
    setCurrentColor(color);
    setColorMenuOpen(false);
    setProfileOpen(false);
    try {
      const res = await api.patch('/users/me/preferences', { colorMode: color });
      updateUser(res.data.data);
    } catch {}
  };

  const handleThemeChange = async (t: string) => {
    setTheme(t);
    setThemeMenuOpen(false);
    setProfileOpen(false);
    try {
      const res = await api.patch('/users/me/preferences', { theme: t });
      updateUser(res.data.data);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const avatarInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
  const isActive = (path: string) => pathname.startsWith(path);

  if (collapsed) {
    return (
      <aside style={{
        width: 56, minHeight: '100vh', background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', paddingTop: 12,
      }}>
        <button className="btn-icon" onClick={onToggle} title="Expand sidebar">
          <PanelLeft size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 210, minHeight: '100vh', background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', flexShrink: 0, position: 'relative', zIndex: 1000,
    }}>

      {/* User Profile Row */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', cursor: 'pointer',
            borderBottom: profileOpen ? '1px solid var(--border)' : 'none',
          }}
          onClick={() => { setProfileOpen(o => !o); setThemeMenuOpen(false); setColorMenuOpen(false); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, overflow: 'hidden' }}>
              {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : avatarInitial}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.fullName || 'User'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            <button
              className="btn-icon"
              title="Collapse sidebar"
              style={{ padding: 3 }}
              onClick={e => { e.stopPropagation(); onToggle(); }}
            >
              <PanelLeft size={14} />
            </button>
          </div>
        </div>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div style={{
            background: 'var(--card-bg)', borderBottom: '1px solid var(--border)',
            paddingBottom: 8,
          }}>
            {/* Avatar + info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 14px 10px' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: 56, height: 56, borderRadius: '50%', marginBottom: 8 }} />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)',
                  color: 'var(--accent-text)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, fontWeight: 700, marginBottom: 8,
                }}>{avatarInitial}</div>
              )}
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{user?.fullName}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{user?.email}</p>
            </div>

            {/* Change Theme */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-icon"
                style={{ width: '100%', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 0 }}
                onClick={e => { e.stopPropagation(); setThemeMenuOpen(o => !o); setColorMenuOpen(false); }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                  <Settings size={14} /> Change Theme
                </span>
                <ChevronRight size={12} />
              </button>
              {themeMenuOpen && (
                <div className="popover" style={{
                  position: 'absolute', left: '100%', top: 0, minWidth: 140,
                  zIndex: 50, padding: '6px 0',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 12px 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Theme</p>
                  {['light', 'dark'].map(t => (
                    <button key={t} className="btn-icon" onClick={() => handleThemeChange(t)}
                      style={{ width: '100%', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 0, fontSize: 13 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                        {t === 'light' ? <Sun size={13} /> : <Moon size={13} />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                      {theme === t && <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Mode */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-icon"
                style={{ width: '100%', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 0 }}
                onClick={e => { e.stopPropagation(); setColorMenuOpen(o => !o); setThemeMenuOpen(false); }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: COLOR_MODES.find(c => c.key === currentColor)?.hex || 'var(--accent)',
                  }} />
                  Color Mode
                </span>
                <ChevronRight size={12} />
              </button>
              {colorMenuOpen && (
                <div className="popover" style={{
                  position: 'absolute', left: '100%', top: 0, minWidth: 150,
                  zIndex: 50, padding: '6px 0',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 12px 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color Mode</p>
                  {COLOR_MODES.map(c => (
                    <button key={c.key} className="btn-icon" onClick={() => handleColorChange(c.key as ColorMode)}
                      style={{ width: '100%', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 0, fontSize: 13 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, background: c.hex }} />
                        {c.label}
                      </span>
                      {currentColor === c.key && <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <Link href="/settings/profile" onClick={() => setProfileOpen(false)}>
              <button className="btn-icon"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 14px', borderRadius: 0, gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                <Settings size={14} /> Settings
              </button>
            </Link>

            {/* Logout */}
            <button className="btn-icon" onClick={handleLogout}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 14px', borderRadius: 0, gap: 8, fontSize: 13, color: '#ef4444' }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 8px', flex: 1 }}>
        {/* Workspace */}
        <button
          className="btn-icon"
          onClick={() => setWorkspaceOpen(o => !o)}
          style={{ width: '100%', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, marginBottom: 2 }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Workspace</span>
          {workspaceOpen
            ? <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            : <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {workspaceOpen && (
          <div style={{ paddingLeft: 4 }}>
            <Link href="/tasks">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6,
                marginBottom: 2, cursor: 'pointer', fontSize: 14,
                background: isActive('/tasks') ? 'var(--accent-light)' : 'transparent',
                color: isActive('/tasks') ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive('/tasks') ? 600 : 400,
                transition: 'background 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { if (!isActive('/tasks')) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isActive('/tasks')) e.currentTarget.style.background = 'transparent'; }}
              >
                <LayoutGrid size={15} />
                Tasks
              </div>
            </Link>
            <Link href="/projects">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6,
                cursor: 'pointer', fontSize: 14,
                background: isActive('/projects') ? 'var(--accent-light)' : 'transparent',
                color: isActive('/projects') ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: isActive('/projects') ? 600 : 400,
                transition: 'background 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { if (!isActive('/projects')) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isActive('/projects')) e.currentTarget.style.background = 'transparent'; }}
              >
                <FolderOpen size={15} />
                Projects
              </div>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
