'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TaskDetail from '@/components/TaskDetail';
import { Task } from '@/types';
import api from '@/lib/api';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tasks/${taskId}`)
      .then(res => setTask(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Task not found.</p>
      </div>
    );
  }

  return <TaskDetail task={task} onUpdate={setTask} />;
}
