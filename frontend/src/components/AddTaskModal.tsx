'use client';
import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, UserPlus, Loader2 } from 'lucide-react';
import { Status, Priority } from '@/types';
import { STATUS_COLUMNS, PRIORITY_OPTIONS, LABEL_OPTIONS } from '@/lib/constants';
import api from '@/lib/api';

interface AddTaskModalProps {
  open: boolean;
  defaultStatus?: Status;
  onClose: () => void;
  onCreated: () => void;
  projectId?: string;
}

interface ResolvedMember {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  picture?: string;
}

export default function AddTaskModal({ open, defaultStatus = 'todo', onClose, onCreated, projectId }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('no-priority');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [members, setMembers] = useState<ResolvedMember[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState<ResolvedMember[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(''); setDescription(''); setStatus(defaultStatus);
      setPriority('no-priority'); setDueDate(''); setLabels([]);
      setMembers([]); setEmailInput(''); setEmailSuggestions([]); setError('');
    }
  }, [open, defaultStatus]);

  // Debounced email search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (emailInput.length < 2) { setEmailSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?email=${encodeURIComponent(emailInput)}`);
        // Filter out already-added members
        setEmailSuggestions(res.data.data.filter((u: ResolvedMember) => !members.find(m => m._id === u._id)));
      } catch { setEmailSuggestions([]); }
    }, 300);
  }, [emailInput, members]);

  const addMemberByEmail = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || members.find(m => m.email === trimmed)) return;
    setEmailLoading(true);
    try {
      const res = await api.post('/users/resolve-by-email', { email: trimmed });
      const user = res.data.data;
      if (!members.find(m => m._id === user._id)) {
        setMembers(prev => [...prev, user]);
      }
      setEmailInput('');
      setEmailSuggestions([]);
    } catch {
      setError('Could not find or create user with that email.');
    } finally { setEmailLoading(false); }
  };

  const removeMember = (id: string) => setMembers(prev => prev.filter(m => m._id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      await api.post('/tasks', {
        title: title.trim(), description, status, priority,
        dueDate: dueDate || undefined,
        labels,
        members: members.map(m => m._id),
        project: projectId || undefined,
      });
      onCreated();
      onClose();
    } catch {
      setError('Failed to create task. Please try again.');
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', padding: 24, animation: 'fadeIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Task</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Title *</label>
            <input
              className="input-base"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Description</label>
            <textarea
              className="input-base"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Status + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Status</label>
              <select className="input-base" value={status} onChange={e => setStatus(e.target.value as Status)} style={{ appearance: 'none', cursor: 'pointer' }}>
                {STATUS_COLUMNS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Priority</label>
              <select className="input-base" value={priority} onChange={e => setPriority(e.target.value as Priority)} style={{ appearance: 'none', cursor: 'pointer' }}>
                {PRIORITY_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Due Date</label>
            <input type="date" className="input-base" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          {/* Members by email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
              Members <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(add by email)</span>
            </label>

            {/* Added members */}
            {members.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                {members.map(m => (
                  <span key={m._id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12,
                    padding: '3px 8px', borderRadius: 20, fontWeight: 500,
                    background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, overflow: 'hidden' }}>
                      {m?.avatar ? <img src={m.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m?.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {m.fullName}
                    <button type="button" onClick={() => removeMember(m._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--accent)' }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Email input with autocomplete */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input-base"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMemberByEmail(emailInput); } }}
                  placeholder="Search or enter email..."
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: 13, padding: '6px 10px', flexShrink: 0 }}
                  onClick={() => addMemberByEmail(emailInput)}
                  disabled={emailLoading || !emailInput.trim()}
                >
                  {emailLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={13} />}
                </button>
              </div>

              {/* Suggestions dropdown */}
              {emailSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: 'var(--shadow-md)', marginTop: 4, overflow: 'hidden',
                }}>
                  {emailSuggestions.map(u => (
                    <div
                      key={u._id}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { setMembers(prev => [...prev, u]); setEmailInput(''); setEmailSuggestions([]); }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, overflow: 'hidden' }}>
                        {u?.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u?.fullName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
              If the email isn't registered yet, a provisional account is created — they'll see this task when they sign in.
            </p>
          </div>

          {/* Labels */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Labels</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LABEL_OPTIONS.map(label => {
                const selected = labels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setLabels(prev => selected ? prev.filter(l => l !== label) : [...prev, label])}
                    style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'var(--accent-light)' : 'transparent',
                      color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: selected ? 600 : 400, transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
