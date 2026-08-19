'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext, DragEndEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, GripVertical, Calendar, Tag, Trash2, Pencil } from 'lucide-react';
import { Task, Status } from '@/types';
import { STATUS_COLUMNS, PRIORITY_OPTIONS } from '@/lib/constants';
import api from '@/lib/api';

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  visibleFields: string[];
  onAddTask: (status: Status) => void;
  isFiltered?: boolean;
}


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

function TaskCard({ task, visibleFields, isDragging, onDelete }: {
  task: Task; visibleFields: string[]; isDragging?: boolean; onDelete?: (id: string) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
        cursor: 'pointer',
        boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow)',
        position: 'relative',
      }}
      onClick={() => router.push(`/tasks/${task._id}`)}
    >
      {/* Drag handle + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)', paddingTop: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <GripVertical size={13} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>
            {task.title}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {visibleFields.includes('priority') && task.priority !== 'no-priority' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PriorityBar priority={task.priority} size={11} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {PRIORITY_OPTIONS.find(p => p.key === task.priority)?.label}
                </span>
              </div>
            )}
            {visibleFields.includes('status') && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '1px 6px', borderRadius: 4, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {STATUS_COLUMNS.find(s => s.key === task.status)?.label || task.status}
              </span>
            )}
          </div>
        </div>
        {/* Three-dot menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            className="btn-icon"
            style={{ padding: 2 }}
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
          >
            <MoreHorizontal size={13} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 100,
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 8, boxShadow: 'var(--shadow-md)', minWidth: 140, padding: '4px 0',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="btn-icon"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 12px', borderRadius: 0, gap: 8, fontSize: 13, color: 'var(--text-primary)' }}
                onClick={e => { e.stopPropagation(); setMenuOpen(false); router.push(`/tasks/${task._id}`); }}
              >
                <Pencil size={13} /> Edit task
              </button>
              <button
                className="btn-icon"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '7px 12px', borderRadius: 0, gap: 8, fontSize: 13, color: '#ef4444' }}
                onClick={async () => {
                  setMenuOpen(false);
                  if (onDelete) onDelete(task._id);
                  try { await api.delete(`/tasks/${task._id}`); } catch {}
                }}
              >
                <Trash2 size={13} /> Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Members + Due date */}
      {(visibleFields.includes('members') || visibleFields.includes('dueDate')) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingLeft: 20 }}>
          {visibleFields.includes('members') && task.members && task.members.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)',
                color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, overflow: 'hidden'
              }}>
                {task.members[0]?.avatar ? <img src={task.members[0].avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : task.members[0]?.fullName?.charAt(0) || '?'}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {task.members[0].fullName}
              </span>
            </div>
          )}
          {visibleFields.includes('dueDate') && task.dueDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 12,
              background: '#fee2e2', color: '#ef4444'
            }}>
              <Calendar size={11} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444' }}>
                {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Labels */}
      {visibleFields.includes('labels') && task.labels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, paddingLeft: 20 }}>
          {task.labels.slice(0, 3).map(label => (
            <span key={label} style={{
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 11,
              padding: '2px 6px', borderRadius: 4,
              background: 'var(--surface-2)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
              <Tag size={9} /> {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Droppable column wrapper — accepts drops even when empty
function DroppableColumn({ colKey, children }: { colKey: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: colKey });
  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'var(--accent-light)' : 'var(--column-bg)',
        borderRadius: 10,
        padding: 8,
        minHeight: 120,
        transition: 'background 0.15s',
        border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
      }}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({ tasks, onTasksChange, visibleFields, onAddTask, isFiltered }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getTasksByStatus = (status: Status) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks.find(t => t._id === e.active.id) || null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    // Determine target status: over could be a column id or a task id
    const overTask = tasks.find(t => t._id === over.id);
    const newStatus: Status = overTask ? overTask.status : (over.id as Status);

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    let updatedTasks = [...tasks];

    // If within same column, arrayMove
    if (activeTask.status === newStatus && overTask) {
      const oldIndex = updatedTasks.findIndex(t => t._id === active.id);
      const newIndex = updatedTasks.findIndex(t => t._id === over.id);
      updatedTasks = arrayMove(updatedTasks, oldIndex, newIndex);
    } else {
      // moving to different column
      const oldIndex = updatedTasks.findIndex(t => t._id === active.id);
      updatedTasks.splice(oldIndex, 1);
      const modifiedTask = { ...activeTask, status: newStatus };
      if (overTask) {
        const targetIndex = updatedTasks.findIndex(t => t._id === over.id);
        updatedTasks.splice(targetIndex, 0, modifiedTask);
      } else {
        updatedTasks.push(modifiedTask);
      }
    }

    // Reassign orders for the target column
    let orderCounter = 0;
    updatedTasks = updatedTasks.map(t => {
      if (t.status === newStatus) {
        return { ...t, order: orderCounter++ };
      }
      return t;
    });

    onTasksChange(updatedTasks);
    const newOrder = updatedTasks.find(t => t._id === active.id)?.order || 0;

    try {
      await api.patch(`/tasks/${active.id}/reorder`, { status: newStatus, order: newOrder });
    } catch {
      onTasksChange(tasks); // revert on error
    }
  };

  const handleDelete = (id: string) => {
    onTasksChange(tasks.filter(t => t._id !== id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 12, padding: '0 24px 24px', overflowX: 'auto', minHeight: 400 }}>
        {STATUS_COLUMNS.map(col => {
          const colTasks = getTasksByStatus(col.key);
          // When filtering/searching, hide empty columns
          if (isFiltered && colTasks.length === 0) return null;
          return (
            <div key={col.key} style={{ minWidth: 270, flex: 1 }}>
              {/* Droppable + sortable cards */}
              <DroppableColumn colKey={col.key}>
                {/* Column header inside the box */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px', marginBottom: 12,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>{colTasks.length}</span>
                  <button className="btn-icon" style={{ padding: 3 }} onClick={() => onAddTask(col.key)}>
                    <Plus size={13} />
                  </button>
                  <button className="btn-icon" style={{ padding: 3 }}>
                    <MoreHorizontal size={13} />
                  </button>
                </div>
                <SortableContext items={colTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  {colTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      visibleFields={visibleFields}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
                <button
                  onClick={() => onAddTask(col.key)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 4px', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                    borderRadius: 6, marginTop: 4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Plus size={13} /> Add Task
                </button>
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div style={{ transform: 'rotate(2deg)', opacity: 0.9 }}>
            <TaskCard task={activeTask} visibleFields={visibleFields} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
