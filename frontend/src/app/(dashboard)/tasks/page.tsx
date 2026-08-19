'use client';
import { useState, useEffect, useCallback } from 'react';
import Toolbar from '@/components/Toolbar';
import KanbanBoard from '@/components/KanbanBoard';
import TaskListView from '@/components/TaskListView';
import AddTaskModal from '@/components/AddTaskModal';
import { useSocket } from '@/hooks/useSocket';
import { Task, Status } from '@/types';
import api from '@/lib/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState(['priority', 'members', 'dueDate', 'labels']);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [loading, setLoading] = useState(true);

  const isFiltered = search.trim().length > 0 || Object.values(filters).some(Boolean);

  const fetchTasks = useCallback(async () => {
    try {
      const params: any = { ...filters };
      if (search) params.search = search;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
    } catch { } finally { setLoading(false); }
  }, [search, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Real-time updates
  useSocket({
    onTaskCreated: (task) => setTasks(prev => [task, ...prev.filter(t => t._id !== task._id)]),
    onTaskUpdated: (task) => setTasks(prev => prev.map(t => t._id === task._id ? task : t)),
    onTaskDeleted: ({ id }) => setTasks(prev => prev.filter(t => t._id !== id)),
  });

  const handleAddTask = (status: Status) => {
    setDefaultStatus(status);
    setAddModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <Toolbar
        title="Tasks"
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        onAddTask={() => handleAddTask('todo')}
        visibleFields={visibleFields}
        onFieldsChange={setVisibleFields}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {tasks.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {isFiltered ? 'No tasks match your filters' : 'No tasks yet'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isFiltered ? 'Try clearing your filters' : 'Click "+ Add Task" to create your first task'}
          </p>
        </div>
      )}

      {tasks.length > 0 && view === 'board' && (
        <KanbanBoard
          tasks={tasks}
          onTasksChange={setTasks}
          visibleFields={visibleFields}
          onAddTask={handleAddTask}
          isFiltered={isFiltered}
        />
      )}

      {tasks.length > 0 && view === 'list' && (
        <TaskListView
          tasks={tasks}
          visibleFields={visibleFields}
          onAddTask={handleAddTask}
          onTasksChange={setTasks}
        />
      )}

      <AddTaskModal
        open={addModalOpen}
        defaultStatus={defaultStatus}
        onClose={() => setAddModalOpen(false)}
        onCreated={fetchTasks}
      />
    </div>
  );
}
