'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Lock, Share2, MoreHorizontal, Plus, ChevronDown,
  Calendar as CalIcon, Tag, X, Link2, Trash2, UserPlus, Loader2,
  Eye, Sidebar, Settings, Pencil
} from 'lucide-react';
import { Task, Priority, Status } from '@/types';
import { PRIORITY_OPTIONS, STATUS_COLUMNS, LABEL_OPTIONS } from '@/lib/constants';
import Calendar from '@/components/Calendar';
import CommentSection from '@/components/CommentSection';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

function PriorityDropdown({ priority, onChange }: { priority: Priority; onChange: (p: Priority) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const opt = PRIORITY_OPTIONS.find(p => p.key === priority);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn-icon"
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: opt?.color || 'var(--text-secondary)', padding: '2px 4px' }}
      >
        <PriorityBar priority={priority} size={12} />
        <span style={{ fontWeight: 500 }}>{opt?.label || 'No Priority'}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="popover" style={{ position: 'absolute', top: '110%', left: 0, minWidth: 160, padding: '4px 0', zIndex: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</p>
          {PRIORITY_OPTIONS.map(p => (
            <button key={p.key} className="btn-icon"
              style={{ width: '100%', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 0, fontSize: 13 }}
              onClick={() => { onChange(p.key); setOpen(false); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color || 'var(--text-secondary)' }}>
                <PriorityBar priority={p.key} size={12} />
                {p.label}
              </span>
              {priority === p.key && <span style={{ color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Priority bar icon using the correct color
function PriorityBar({ priority, size = 12 }: { priority: string; size?: number }) {
  const opt = PRIORITY_OPTIONS.find(p => p.key === priority);
  const c = opt?.color || '#94A3B8';
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <rect x="0" y="6" width="3" height="6" fill={c} rx="1" />
      <rect x="4" y="3" width="3" height="9" fill={c} rx="1" />
      {(priority === 'urgent' || priority === 'high') && <rect x="8" y="0" width="3" height="12" fill={c} rx="1" />}
    </svg>
  );
}

interface TaskDetailProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

export default function TaskDetail({ task, onUpdate }: TaskDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [calOpen, setCalOpen] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDate, setNewSubtaskDate] = useState<Date | null>(null);
  const [subtaskMenuOpen, setSubtaskMenuOpen] = useState<string | null>(null);
  const [titleVal, setTitleVal] = useState(task.title);
  const [descVal, setDescVal] = useState(task.description || '');
  const [editingLabels, setEditingLabels] = useState(false);
  const [addingResource, setAddingResource] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  // Members state
  const [addingMember, setAddingMember] = useState(false);
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [memberSuggestions, setMemberSuggestions] = useState<{_id:string;fullName:string;email:string}[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [showMoreUpdates, setShowMoreUpdates] = useState(false);
  const memberDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  // Click away listener for labels and resources
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (editingLabels && labelsRef.current && !labelsRef.current.contains(target)) setEditingLabels(false);
      if (addingResource && resourceRef.current && !resourceRef.current.contains(target)) setAddingResource(false);
      if (calOpen && calRef.current && !calRef.current.contains(target)) setCalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingLabels, addingResource]);

  // Keep title/desc in sync when task changes
  useEffect(() => {
    setTitleVal(task.title);
    setDescVal(task.description || '');
  }, [task._id]);

  // Member email autocomplete
  useEffect(() => {
    if (memberDebounceRef.current) clearTimeout(memberDebounceRef.current);
    if (memberEmailInput.length < 2) { setMemberSuggestions([]); return; }
    memberDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?email=${encodeURIComponent(memberEmailInput)}`);
        const existing = task.members?.map(m => m._id) || [];
        setMemberSuggestions(res.data.data.filter((u: any) => !existing.includes(u._id)));
      } catch { setMemberSuggestions([]); }
    }, 300);
  }, [memberEmailInput, task.members]);

  const updateField = async (data: Partial<Task>, customMsg?: string) => {
    const keys = Object.keys(data);
    let updatedUpdates = task.updates || [];
    
    if (keys.length > 0 || customMsg) {
      const msg = customMsg || `changed ${keys.join(', ')}`;
      const newUpdate = { message: msg, time: new Date().toISOString() };
      updatedUpdates = [newUpdate, ...updatedUpdates];
    }
    
    try {
      const payload = { ...data };
      if (keys.length > 0 || customMsg) payload.updates = updatedUpdates;
      
      const res = await api.patch(`/tasks/${task._id}`, payload);
      onUpdate(res.data.data);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      const res = await api.post(`/tasks/${task._id}/subtasks`, { title: newSubtaskTitle.trim(), dueDate: newSubtaskDate });
      onUpdate(res.data.data);
      await updateField({}, `added subtask "${newSubtaskTitle.trim()}"`);
      setNewSubtaskTitle('');
      setNewSubtaskDate(null);
      setAddingSubtask(false);
    } catch (err) {
      console.error('Subtask error:', err);
    }
  };

  const toggleSubtaskComplete = async (subtaskId: string, completed: boolean) => {
    try {
      const res = await api.patch(`/tasks/${task._id}/subtasks/${subtaskId}`, { completed });
      onUpdate(res.data.data);
      await updateField({}, `${completed ? 'completed' : 'uncompleted'} a subtask`);
    } catch { }
  };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      const res = await api.delete(`/tasks/${task._id}/subtasks/${subtaskId}`);
      onUpdate(res.data.data);
      await updateField({}, `deleted a subtask`);
    } catch { }
  };

  const editSubtaskTitle = async (subtaskId: string, oldTitle: string) => {
    const newTitle = window.prompt('Edit subtask title:', oldTitle);
    if (!newTitle || newTitle.trim() === oldTitle) return;
    try {
      const res = await api.patch(`/tasks/${task._id}/subtasks/${subtaskId}`, { title: newTitle.trim() });
      onUpdate(res.data.data);
      await updateField({}, `renamed subtask to "${newTitle.trim()}"`);
    } catch { }
  };

  const addMemberByEmail = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setMemberLoading(true);
    try {
      const res = await api.post('/users/resolve-by-email', { email: trimmed });
      const newMember = res.data.data;
      const currentMemberIds = task.members?.map(m => m._id) || [];
      if (!currentMemberIds.includes(newMember._id)) {
        const updatedIds = [...currentMemberIds, newMember._id];
        await updateField({ members: updatedIds } as any);
      }
      setMemberEmailInput('');
      setMemberSuggestions([]);
      setAddingMember(false);
    } catch { } finally { setMemberLoading(false); }
  };

  const removeMember = async (memberId: string) => {
    const updatedIds = (task.members || []).filter(m => m._id !== memberId).map(m => m._id);
    await updateField({ members: updatedIds } as any);
  };

  const addResource = async () => {
    if (!resourceName.trim() || !resourceUrl.trim()) return;
    const newResources = [...(task.resources || []), { name: resourceName.trim(), url: resourceUrl.trim() }];
    await updateField({ resources: newResources } as any);
    setResourceName('');
    setResourceUrl('');
    setAddingResource(false);
  };

  const removeResource = async (idx: number) => {
    const newResources = (task.resources || []).filter((_, i) => i !== idx);
    await updateField({ resources: newResources } as any);
  };

  const toggleLabel = async (label: string) => {
    const current = task.labels || [];
    const newLabels = current.includes(label)
      ? current.filter(l => l !== label)
      : [...current, label];
    await updateField({ labels: newLabels });
  };

  const statusCol = STATUS_COLUMNS.find(s => s.key === task.status);
  const priorityOpt = PRIORITY_OPTIONS.find(p => p.key === task.priority);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', gap: 0 }}>
      {/* Main content */}
      <div style={{ flex: 1, padding: '20px 32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Top actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button className="btn-ghost" onClick={() => router.back()} style={{ fontSize: 13, gap: 5 }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Title — always editable textarea (auto-resize) */}
        <textarea
          ref={titleRef}
          value={titleVal}
          onChange={e => setTitleVal(e.target.value)}
          onBlur={() => { if (titleVal.trim()) updateField({ title: titleVal.trim() }); else setTitleVal(task.title); }}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); if (titleVal.trim()) updateField({ title: titleVal.trim() }); }
          }}
          placeholder="Task title..."
          rows={1}
          style={{
            fontSize: 26, fontWeight: 700, color: 'var(--text-primary)',
            background: 'transparent', border: 'none', borderBottom: '2px solid transparent',
            outline: 'none', width: '100%', marginBottom: 8, resize: 'none',
            fontFamily: 'inherit', lineHeight: 1.3, overflow: 'hidden',
          }}
          onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderBottomColor = 'transparent'}
        />

        {/* Description */}
        <textarea
          value={descVal}
          onChange={e => setDescVal(e.target.value)}
          onBlur={() => updateField({ description: descVal })}
          placeholder="Add a description..."
          style={{
            fontSize: 14, color: 'var(--text-secondary)', background: 'transparent', border: 'none',
            outline: 'none', width: '100%', resize: 'none', lineHeight: 1.6, marginBottom: 20,
            minHeight: 60, fontFamily: 'inherit',
          }}
        />

        {/* Properties row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>Properties</span>
          {task.members && task.members.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, overflow: 'hidden' }}>
                {task.members[0]?.avatar ? <img src={task.members[0].avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : task.members[0]?.fullName?.charAt(0) || '?'}
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{task.members[0].fullName}</span>
            </div>
          )}
          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalIcon size={13} style={{ color: priorityOpt?.color || '#ef4444' }} />
              <span style={{ color: priorityOpt?.color || '#ef4444', fontWeight: 500 }}>
                {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>

        {/* Labels — always editable */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13, minWidth: 80, paddingTop: 4 }}>Labels</span>
          <div style={{ flex: 1 }} ref={labelsRef}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: editingLabels ? 8 : 0 }}>
              {(task.labels || []).map(label => (
                <span key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                  padding: '3px 8px', borderRadius: 5,
                  background: 'var(--accent-light)', border: '1px solid var(--accent)',
                  color: 'var(--accent)', cursor: 'pointer',
                }} onClick={() => toggleLabel(label)}>
                  <Tag size={10} /> {label} <X size={9} />
                </span>
              ))}
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: '2px 8px' }}
                onClick={() => setEditingLabels(o => !o)}
              >
                <Plus size={11} /> Add label
              </button>
            </div>
            {editingLabels && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {LABEL_OPTIONS.map(label => {
                  const selected = (task.labels || []).includes(label);
                  return (
                    <button
                      key={label}
                      className="btn-ghost"
                      style={{
                        fontSize: 11, padding: '3px 8px',
                        background: selected ? 'var(--accent-light)' : 'transparent',
                        color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 5,
                      }}
                      onClick={() => toggleLabel(label)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resources */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13, minWidth: 80, paddingTop: 4 }}>Resources</span>
          <div style={{ flex: 1 }} ref={resourceRef}>
            {(task.resources || []).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Link2 size={12} style={{ color: 'var(--text-muted)' }} />
                <a href={r.url} target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'underline', flex: 1 }}>
                  {r.name}
                </a>
                <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeResource(i)}>
                  <X size={11} />
                </button>
              </div>
            ))}
            {addingResource ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                <input className="input-base" placeholder="Link name..." value={resourceName} onChange={e => setResourceName(e.target.value)} style={{ fontSize: 13 }} />
                <input className="input-base" placeholder="URL (https://...)" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} style={{ fontSize: 13 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-primary" style={{ fontSize: 12 }} onClick={addResource}>Add</button>
                  <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setAddingResource(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                onClick={() => setAddingResource(true)}
              >
                <Plus size={13} /> Add document or link...
              </button>
            )}
          </div>
        </div>

        {/* Subtasks */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronDown size={14} /> Subtasks ({task.subtasks?.length || 0})
          </h3>

          {(task.subtasks || []).length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 110px 60px', padding: '7px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                {['Task', 'Priority', 'Members', 'Due Date', 'Actions'].map((h, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</span>
                ))}
              </div>
              {(task.subtasks || []).map(sub => {
                const pOpt = PRIORITY_OPTIONS.find(p => p.key === sub.priority);
                return (
                  <div key={sub._id?.toString()} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 110px 60px', padding: '9px 14px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {sub.title}
                    </span>
                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PriorityBar priority={sub.priority} size={10} />
                      <span style={{ color: pOpt?.color || 'var(--text-muted)', fontWeight: 500 }}>{pOpt?.label || '—'}</span>
                    </span>
                    <div style={{ display: 'flex' }}>
                      {sub.members?.length > 0 ? (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, overflow: 'hidden' }}>
                          {sub.members[0]?.avatar ? <img src={sub.members[0].avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : sub.members[0]?.fullName?.charAt(0) || '?'}
                        </div>
                      ) : (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>+</div>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                      {sub.dueDate ? new Date(sub.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <button className="btn-icon" style={{ padding: 2 }} onClick={() => setSubtaskMenuOpen(subtaskMenuOpen === sub._id?.toString() ? null : sub._id?.toString() || '')}>
                        <MoreHorizontal size={14} />
                      </button>
                      {subtaskMenuOpen === sub._id?.toString() && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 100,
                          background: 'var(--card-bg)', border: '1px solid var(--border)',
                          borderRadius: 8, boxShadow: 'var(--shadow-md)', minWidth: 120, padding: '4px 0',
                        }}>
                          <button
                            className="btn-icon"
                            style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 12px', borderRadius: 0, gap: 8, fontSize: 13, color: 'var(--text-primary)' }}
                            onClick={() => { setSubtaskMenuOpen(null); editSubtaskTitle(sub._id?.toString() || '', sub.title); }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            className="btn-icon"
                            style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 12px', borderRadius: 0, gap: 8, fontSize: 13, color: '#ef4444' }}
                            onClick={() => { setSubtaskMenuOpen(null); deleteSubtask(sub._id?.toString() || ''); }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {addingSubtask ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="input-base"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                placeholder="Subtask title..."
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') addSubtask();
                  if (e.key === 'Escape') setAddingSubtask(false);
                }}
                style={{ maxWidth: 200, fontSize: 13 }}
              />
              <input
                type="date"
                className="input-base"
                value={newSubtaskDate ? newSubtaskDate.toISOString().split('T')[0] : ''}
                onChange={e => setNewSubtaskDate(e.target.value ? new Date(e.target.value) : null)}
                style={{ maxWidth: 140, fontSize: 13 }}
              />
              <button className="btn-primary" onClick={addSubtask} style={{ fontSize: 13 }}>Add</button>
              <button className="btn-ghost" onClick={() => setAddingSubtask(false)} style={{ fontSize: 13 }}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubtask(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              <Plus size={13} /> Add Subtask
            </button>
          )}
        </div>

        {/* Comments restored here */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Subtasks</h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, background: 'var(--card-bg)' }}>
            <CommentSection taskId={task._id} />
          </div>
        </div>
      </div>

      {/* Right details panel */}
      <div style={{
        width: 380, flexShrink: 0,
        padding: '24px 24px', background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Top actions previously on left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 4 }}>
          <button className="btn-icon" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }} title="Lock"><Lock size={15} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} /></button>
          <button className="btn-icon" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)', gap: 4 }} title="Views"><Eye size={15} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} /> <span style={{ fontSize: 12, fontWeight: 600 }}>1</span></button>
          <button className="btn-icon" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }} title="Share"><Share2 size={15} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} /></button>
          <button className="btn-icon" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}><MoreHorizontal size={15} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} /></button>
          <button className="btn-icon" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }} title="Split Layout"><Sidebar size={15} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} /></button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ChevronDown size={14} /> Details
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn-icon" style={{ padding: 4 }}><Plus size={14} strokeWidth={2.5} /></button>
              <button className="btn-icon" style={{ padding: 4 }}><Settings size={14} strokeWidth={2.5} /></button>
            </div>
          </div>

        {[
          {
            label: 'Status',
            content: (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusCol?.color, position: 'absolute', left: 0, pointerEvents: 'none' }} />
                <select
                  value={task.status}
                  onChange={e => updateField({ status: e.target.value as Status })}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 13, cursor: 'pointer', color: statusCol?.color || 'var(--text-primary)',
                    fontWeight: 500, paddingLeft: 14, appearance: 'none'
                  }}
                >
                  {STATUS_COLUMNS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            )
          },
          {
            label: 'Priority',
            content: <PriorityDropdown priority={task.priority} onChange={p => updateField({ priority: p })} />
          },
          {
            label: 'Members',
            content: (
              <div>
                {/* Existing members */}
                {(task.members || []).map(m => (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                      {m?.avatar ? <img src={m.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m?.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{m.fullName}</span>
                    <button className="btn-icon" style={{ padding: 1 }} onClick={() => removeMember(m._id)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {/* Add member */}
                {addingMember ? (
                  <div style={{ position: 'relative', marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        className="input-base"
                        value={memberEmailInput}
                        onChange={e => setMemberEmailInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMemberByEmail(memberEmailInput); } if (e.key === 'Escape') setAddingMember(false); }}
                        placeholder="Email..."
                        autoFocus
                        style={{ fontSize: 12, padding: '5px 8px', flex: 1 }}
                      />
                      <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 7px' }}
                        onClick={() => addMemberByEmail(memberEmailInput)}
                        disabled={memberLoading}>
                        {memberLoading ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={11} />}
                      </button>
                    </div>
                    {memberSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 6, boxShadow: 'var(--shadow-md)', marginTop: 2, overflow: 'hidden' }}>
                        {memberSuggestions.map(u => (
                          <div key={u._id}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', cursor: 'pointer', fontSize: 12 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => { addMemberByEmail(u.email); }}
                          >
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                              {u.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.fullName}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{u.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn-ghost" style={{ fontSize: 11, marginTop: 4 }} onClick={() => { setAddingMember(false); setMemberEmailInput(''); setMemberSuggestions([]); }}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-icon" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', gap: 6, marginTop: (task.members?.length || 0) > 0 ? 4 : 0 }}
                    onClick={() => setAddingMember(true)}>
                    <UserPlus size={14} /> Add members
                  </button>
                )}
              </div>
            )
          },
          {
            label: 'Dates',
            content: (
              <div style={{ position: 'relative' }} ref={calRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', fontSize: 12, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, gap: 6, color: 'var(--text-secondary)' }}
                  >
                    <CalIcon size={12} style={{ color: 'var(--text-muted)' }} />
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Created'}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
                  <button
                    className="btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 12, gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: task.dueDate ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    onClick={() => setCalOpen(o => !o)}
                  >
                    <CalIcon size={12} /> 
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'End'}
                  </button>
                </div>
                {calOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 30 }}>
                    <Calendar
                      value={task.dueDate}
                      onChange={d => { updateField({ dueDate: d || null }); setCalOpen(false); }}
                      onClose={() => setCalOpen(false)}
                    />
                  </div>
                )}
              </div>
            )
          },
          {
            label: 'Labels',
            content: <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{(task.labels || []).join(', ') || '—'}</span>
          },
          {
            label: 'Teams',
            content: <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{(task.labels || []).join(', ') || '—'}</span>
          },
          {
            label: 'Reporter',
            content: <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{task.reporter?.fullName || '—'}</span>
          },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60, paddingTop: 3 }}>{row.label}</span>
            <div style={{ flex: 1 }}>{row.content}</div>
          </div>
        ))}

        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <ChevronDown size={14} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Updates</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!(task.updates?.length) ? (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent updates. (Change a field above to see it here)</span>
            ) : (
              (showMoreUpdates ? task.updates : task.updates.slice(0, 3)).map((upd, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, overflow: 'hidden' }}>
                    {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.fullName || 'You'}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(upd.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{upd.message}</span>
                  </div>
                </div>
              ))
            )}
            
            {(task.updates?.length || 0) > 3 && (
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: '4px 0', color: 'var(--accent)', alignSelf: 'flex-start' }}
                onClick={() => setShowMoreUpdates(o => !o)}
              >
                {showMoreUpdates ? 'Show less' : `Show all updates (${task.updates?.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
