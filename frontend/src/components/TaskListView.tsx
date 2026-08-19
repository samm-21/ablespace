'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Calendar, Tag, Pencil, Trash2 } from 'lucide-react';
import { Task, Status } from '@/types';
import { STATUS_COLUMNS, PRIORITY_OPTIONS } from '@/lib/constants';
import api from '@/lib/api';

interface TaskListViewProps {
  tasks: Task[];
  visibleFields: string[];
  onAddTask: (status: Status) => void;
  onTasksChange?: (tasks: Task[]) => void;
}

function PriorityBadge({ priority }: { priority: string }) {
  const opt = PRIORITY_OPTIONS.find(p => p.key === priority);
  if (!priority || priority === 'no-priority') return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  const c = opt?.color || '#94A3B8';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect x="0" y="6" width="3" height="6" fill={c} rx="1" />
        <rect x="4" y="3" width="3" height="9" fill={c} rx="1" />
        {(priority === 'urgent' || priority === 'high') && <rect x="8" y="0" width="3" height="12" fill={c} rx="1" />}
      </svg>
      <span style={{ fontSize: 12, fontWeight: 500, color: c }}>{opt?.label}</span>
    </div>
  );
}

function MemberAvatar({ member }: { member: any }) {
  if (!member) return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: 'var(--surface-2)',
      border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)',
    }}>+</div>
  );
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)',
      color: 'var(--accent-text)', fontSize: 9, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      flexShrink: 0,
    }}>
      {member?.avatar
        ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (member.fullName?.charAt(0)?.toUpperCase() || '?')}
    </div>
  );
}

export default function TaskListView({ tasks, visibleFields, onAddTask, onTasksChange }: TaskListViewProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const groupedTasks = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key).sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<string, Task[]>);

  // Determine which columns have tasks
  const nonEmptyColumns = STATUS_COLUMNS.filter(col => groupedTasks[col.key].length > 0 || true);

  // Table header
  const renderHeader = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `1fr ${visibleFields.includes('priority') ? '100px' : ''} ${visibleFields.includes('status') ? '100px' : ''} ${visibleFields.includes('members') ? '90px' : ''} ${visibleFields.includes('dueDate') ? '110px' : ''} 70px`,
      gap: 0,
      padding: '8px 16px',
      background: 'var(--surface-2)',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Task</span>
      {visibleFields.includes('priority') && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Priority</span>}
      {visibleFields.includes('status') && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</span>}
      {visibleFields.includes('members') && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Members</span>}
      {visibleFields.includes('dueDate') && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Due Date</span>}
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</span>
    </div>
  );

  const renderTaskRow = (task: Task) => (
    <div
      key={task._id}
      style={{
        display: 'grid',
        gridTemplateColumns: `1fr ${visibleFields.includes('priority') ? '100px' : ''} ${visibleFields.includes('status') ? '100px' : ''} ${visibleFields.includes('members') ? '90px' : ''} ${visibleFields.includes('dueDate') ? '110px' : ''} 70px`,
        gap: 0,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onClick={() => router.push(`/tasks/${task._id}`)}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
        {task.title}
      </span>
      {visibleFields.includes('priority') && <PriorityBadge priority={task.priority} />}
      {visibleFields.includes('status') && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {STATUS_COLUMNS.find(s => s.key === task.status)?.label || task.status}
          </span>
        </div>
      )}
      {visibleFields.includes('members') && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {task.members.length > 0 ? <MemberAvatar member={task.members[0]} /> : <MemberAvatar member={null} />}
          {task.members.length > 1 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>+{task.members.length - 1}</span>
          )}
        </div>
      )}
      {visibleFields.includes('dueDate') && (
        <span style={{ fontSize: 12, color: task.dueDate ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'}
        </span>
      )}
      {/* Three-dot menu */}
      <div style={{ position: 'relative' }}>
        <button className="btn-icon" style={{ padding: 2 }}
          onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === task._id ? null : task._id); }}>
          <MoreHorizontal size={16} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} />
        </button>
        {menuOpen === task._id && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 100,
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: 'var(--shadow-md)', minWidth: 140, padding: '4px 0',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button className="btn-icon"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 12px', borderRadius: 0, gap: 8, fontSize: 13, color: 'var(--text-primary)' }}
              onClick={() => { setMenuOpen(null); router.push(`/tasks/${task._id}`); }}>
              <Pencil size={13} /> Edit task
            </button>
            <button className="btn-icon"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 12px', borderRadius: 0, gap: 8, fontSize: 13, color: '#ef4444' }}
              onClick={async () => {
                setMenuOpen(null);
                if (onTasksChange) onTasksChange(tasks.filter(t => t._id !== task._id));
                try { await api.delete(`/tasks/${task._id}`); } catch {}
              }}>
              <Trash2 size={13} /> Delete task
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {nonEmptyColumns.map(col => {
        const colTasks = groupedTasks[col.key];
        const isCollapsed = collapsed[col.key];

        return (
          <div key={col.key} style={{ marginBottom: 24 }}>
            {/* Section header */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', cursor: 'pointer', marginBottom: 4 }}
              onClick={() => setCollapsed(c => ({ ...c, [col.key]: !c[col.key] }))}
            >
              {isCollapsed
                ? <svg width="10" height="10" viewBox="0 0 10 10" style={{ fill: 'var(--text-primary)', marginRight: 4 }}><polygon points="0,0 10,5 0,10" /></svg>
                : <svg width="10" height="10" viewBox="0 0 10 10" style={{ fill: 'var(--text-primary)', marginRight: 4 }}><polygon points="0,0 10,0 5,10" /></svg>}
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
            </div>

            {!isCollapsed && (
              <div style={{ 
                border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card-bg)', overflow: 'hidden' 
              }}>
                {renderHeader()}
                {colTasks.map(task => renderTaskRow(task))}
                {/* Add Task row */}
                <div
                  style={{ padding: '9px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => onAddTask(col.key)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Plus size={14} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Add Task</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
