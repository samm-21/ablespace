'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Toolbar from '@/components/Toolbar';
import TaskListView from '@/components/TaskListView';
import AddTaskModal from '@/components/AddTaskModal';
import { Task, Project, Status } from '@/types';
import api from '@/lib/api';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [visibleFields] = useState(['priority', 'members', 'dueDate']);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`, { params: { search, ...filters } }),
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch { } finally { setLoading(false); }
  }, [projectId, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px 0', fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          Projects
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{project?.name}</span>
      </div>

      <Toolbar
        title="Tasks"
        view="list"
        onViewChange={() => { }}
        search={search}
        onSearchChange={setSearch}
        onAddTask={() => { setDefaultStatus('todo'); setAddOpen(true); }}
        visibleFields={visibleFields}
        onFieldsChange={() => { }}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <TaskListView
        tasks={tasks}
        visibleFields={visibleFields}
        onAddTask={(status) => { setDefaultStatus(status); setAddOpen(true); }}
      />

      <AddTaskModal
        open={addOpen}
        defaultStatus={defaultStatus}
        onClose={() => setAddOpen(false)}
        onCreated={fetchData}
        projectId={projectId}
      />
    </div>
  );
}
