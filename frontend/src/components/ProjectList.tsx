'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Plus, Edit2, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { PRIORITY_OPTIONS } from '@/lib/constants';

interface ProjectListProps {
  projects: Project[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

function PriorityBadge({ priority }: { priority: string }) {
  const opt = PRIORITY_OPTIONS.find(p => p.key === priority);
  if (!priority || priority === 'no-priority') return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ color: opt?.color }}>
        <rect x="0" y="6" width="3" height="6" fill="currentColor" rx="1" />
        <rect x="4" y="3" width="3" height="9" fill="currentColor" rx="1" />
        {(priority === 'urgent' || priority === 'high') && <rect x="8" y="0" width="3" height="12" fill="currentColor" rx="1" />}
      </svg>
      <span style={{ fontSize: 12, fontWeight: 500, color: opt?.color }}>{opt?.label}</span>
    </div>
  );
}

export default function ProjectList({ projects, onAddProject, onEditProject, onDeleteProject }: ProjectListProps) {
  const router = useRouter();
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ padding: '0 24px 24px' }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'visible' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px 70px',
          padding: '8px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
          borderTopLeftRadius: 8, borderTopRightRadius: 8,
        }}>
          {['Projects', 'Priority', 'Lead', 'Due Date', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {projects.map(project => (
          <div
            key={project._id}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px 70px',
              padding: '11px 16px', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
            onClick={() => router.push(`/projects/${project._id}`)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
              {project.name}
            </span>
            <PriorityBadge priority={project.priority} />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {project.lead ? (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
                  color: 'var(--accent-text)', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {project.lead?.avatar ? <img src={project.lead.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : project.lead?.fullName?.charAt(0) || '?'}
                </div>
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)' }}>+</div>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {project.dueDate
                ? new Date(project.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </span>
            <div style={{ position: 'relative' }} ref={actionMenuOpen === project._id ? actionMenuRef : null}>
              <button 
                className="btn-icon" 
                style={{ padding: 2 }} 
                onClick={e => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === project._id ? null : project._id); }}
              >
                <MoreHorizontal size={14} />
              </button>
              
              {actionMenuOpen === project._id && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 50,
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: 'var(--shadow-md)', minWidth: 140, overflow: 'hidden', padding: '4px 0',
                }}>
                  <button
                    className="btn-ghost"
                    onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); onEditProject(project); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 12px', fontSize: 13, color: 'var(--text-primary)', borderRadius: 0 }}
                  >
                    <Edit2 size={13} style={{ marginRight: 8 }} /> Edit
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); onDeleteProject(project._id); }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 12px', fontSize: 13, color: '#ef4444', borderRadius: 0 }}
                  >
                    <Trash2 size={13} style={{ marginRight: 8 }} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add projects row */}
        <div
          style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
          onClick={onAddProject}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Plus size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add Projects</span>
        </div>
      </div>
    </div>
  );
}
