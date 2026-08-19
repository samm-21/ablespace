'use client';
import { useState, useEffect, useCallback } from 'react';
import Toolbar from '@/components/Toolbar';
import ProjectList from '@/components/ProjectList';
import AddProjectModal from '@/components/AddProjectModal';
import { Project } from '@/types';
import api from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  // Projects page only has list view
  const [view] = useState<'board' | 'list'>('list');
  const [visibleFields] = useState(['priority', 'members', 'dueDate']);

  const fetchProjects = useCallback(async () => {
    try {
      const params: any = { ...filters };
      if (search) params.search = search;
      const res = await api.get('/projects', { params });
      setProjects(res.data.data);
    } catch { } finally { setLoading(false); }
  }, [search, filters]);

  const handleDeleteProject = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch { alert('Failed to delete project'); }
  };

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      <Toolbar
        title="Projects"
        view={view}
        onViewChange={() => { }}
        search={search}
        onSearchChange={setSearch}
        onAddTask={() => setAddOpen(true)}
        visibleFields={visibleFields}
        onFieldsChange={() => { }}
        filters={filters}
        onFiltersChange={setFilters}
        addLabel="+ Add Project"
      />

      {projects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>No projects yet</p>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>+ Add Project</button>
        </div>
      ) : (
        <ProjectList 
          projects={projects} 
          onAddProject={() => { setProjectToEdit(null); setAddOpen(true); }}
          onEditProject={(project) => { setProjectToEdit(project); setAddOpen(true); }}
          onDeleteProject={handleDeleteProject}
        />
      )}

      <AddProjectModal 
        open={addOpen} 
        projectToEdit={projectToEdit}
        onClose={() => { setAddOpen(false); setProjectToEdit(null); }} 
        onCreated={fetchProjects} 
      />
    </div>
  );
}
