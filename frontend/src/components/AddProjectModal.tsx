'use client';
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Priority, Project } from '@/types';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import api from '@/lib/api';
import { UserPlus, Loader2 } from 'lucide-react';

interface ResolvedMember {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectToEdit?: Project | null;
}

export default function AddProjectModal({ open, onClose, onCreated, projectToEdit }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority>('no-priority');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [lead, setLead] = useState<ResolvedMember | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState<ResolvedMember[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        setName(projectToEdit.name);
        setPriority((projectToEdit.priority as Priority) || 'no-priority');
        setDueDate(projectToEdit.dueDate ? new Date(projectToEdit.dueDate).toISOString().split('T')[0] : '');
        setLead(projectToEdit.lead as any || null);
      } else {
        setName(''); setPriority('no-priority'); setDueDate('');
        setLead(null);
      }
      setError('');
      setEmailInput(''); setEmailSuggestions([]);
    }
  }, [open, projectToEdit]);

  // Debounced email search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (emailInput.length < 2) { setEmailSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?email=${encodeURIComponent(emailInput)}`);
        setEmailSuggestions(res.data.data.filter((u: ResolvedMember) => u._id !== lead?._id));
      } catch { setEmailSuggestions([]); }
    }, 300);
  }, [emailInput, lead]);

  const addLeadByEmail = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || lead?.email === trimmed) return;
    setEmailLoading(true);
    try {
      const res = await api.post('/users/resolve-by-email', { email: trimmed });
      setLead(res.data.data);
      setEmailInput('');
      setEmailSuggestions([]);
    } catch {
      setError('Could not find or create user with that email.');
    } finally { setEmailLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    try {
      const payload = { name: name.trim(), priority, dueDate: dueDate || null, lead: lead?._id || null };
      if (projectToEdit) {
        await api.patch(`/projects/${projectToEdit._id}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      onCreated();
      onClose();
    } catch { setError(`Failed to ${projectToEdit ? 'edit' : 'create'} project. Try again.`); }
    finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24, animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{projectToEdit ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Name *</label>
            <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="Project name..." autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Priority</label>
              <select className="input-base" value={priority} onChange={e => setPriority(e.target.value as Priority)} style={{ appearance: 'none', cursor: 'pointer' }}>
                {PRIORITY_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Due Date</label>
              <input type="date" className="input-base" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
              Project Lead <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(search by email)</span>
            </label>
            
            {lead && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, padding: '3px 8px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)', width: 'fit-content' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, overflow: 'hidden' }}>
                  {lead.avatar ? <img src={lead.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : lead.fullName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{lead.fullName}</span>
                <button type="button" onClick={() => setLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--accent)' }}>
                  <X size={10} />
                </button>
              </div>
            )}
            
            {!lead && (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="input-base"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLeadByEmail(emailInput); } }}
                    placeholder="Search or enter email..."
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: 13, padding: '6px 10px', flexShrink: 0 }}
                    onClick={() => addLeadByEmail(emailInput)}
                    disabled={emailLoading || !emailInput.trim()}
                  >
                    {emailLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={13} />}
                  </button>
                </div>

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
                        onClick={() => { setLead(u); setEmailInput(''); setEmailSuggestions([]); }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, overflow: 'hidden' }}>
                          {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.fullName.charAt(0).toUpperCase()}
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
            )}
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
