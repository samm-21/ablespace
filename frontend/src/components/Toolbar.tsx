'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, LayoutList, Filter, Plus, X } from 'lucide-react';
import FieldsPopover from './FieldsPopover';
import FilterDropdown from './FilterDropdown';
import { STATUS_COLUMNS, PRIORITY_OPTIONS } from '@/lib/constants';

interface ToolbarProps {
  title: string;
  view: 'board' | 'list';
  onViewChange: (v: 'board' | 'list') => void;
  search: string;
  onSearchChange: (s: string) => void;
  onAddTask: () => void;
  visibleFields?: string[];
  onFieldsChange?: (fields: string[]) => void;
  filters: Record<string, string>;
  onFiltersChange: (f: Record<string, string>) => void;
  addLabel?: string;
}

// Human-readable label for a filter value
function filterLabel(key: string, value: string): string {
  if (key === 'status') return STATUS_COLUMNS.find(s => s.key === value)?.label || value;
  if (key === 'priority') return PRIORITY_OPTIONS.find(p => p.key === value)?.label || value;
  return value;
}

export default function Toolbar({
  title, view, onViewChange, search, onSearchChange, onAddTask,
  visibleFields = [], onFieldsChange, filters, onFiltersChange, addLabel = 'Add Task',
}: ToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const fieldsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchOpen && searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
      if (fieldsOpen && fieldsRef.current && !fieldsRef.current.contains(target)) setFieldsOpen(false);
      if (filterOpen && filterRef.current && !filterRef.current.contains(target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen, fieldsOpen, filterOpen]);

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const activeFilterEntries = Object.entries(filters).filter(([, v]) => Boolean(v));

  const clearFilter = (key: string) => {
    const f = { ...filters };
    delete f[key];
    onFiltersChange(f);
  };

  return (
    <div>
      {/* Main toolbar row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px', flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Search */}
          {searchOpen ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 7, padding: '5px 10px',
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search tasks..."
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13, color: 'var(--text-primary)', width: 200,
                }}
              />
              {search && (
                <button className="btn-icon" style={{ padding: 2, marginRight: 4 }} onClick={() => { setSearchOpen(false); onSearchChange(''); }}>
                  <X size={13} />
                </button>
              )}
              <div style={{ background: 'var(--border)', padding: '2px 4px', borderRadius: 4, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
                ⌘F
              </div>
            </div>
          ) : (
            <button className="btn-icon" onClick={() => setSearchOpen(true)} title="Search">
              <Search size={16} />
            </button>
          )}

          {/* Fields */}
          {onFieldsChange && (
            <div style={{ position: 'relative' }} ref={fieldsRef}>
              <button className="btn-ghost" style={{ fontSize: 13, padding: '6px 10px', background: fieldsOpen ? 'var(--surface-2)' : 'transparent', border: '1px solid var(--border)' }} onClick={() => { setFieldsOpen(o => !o); setFilterOpen(false); }}>
                <LayoutList size={14} /> Fields
              </button>
              {fieldsOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 30 }}>
                  <FieldsPopover
                    view={view}
                    onViewChange={v => { onViewChange(v); setFieldsOpen(false); }}
                    visibleFields={visibleFields}
                    onFieldsChange={onFieldsChange}
                    onClose={() => setFieldsOpen(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Filter — highlighted when active */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className="btn-ghost"
              style={{
                fontSize: 13, padding: '6px 10px',
                color: hasActiveFilters ? 'var(--accent)' : undefined,
                background: hasActiveFilters ? 'var(--accent-light)' : filterOpen ? 'var(--surface-2)' : 'transparent',
                border: hasActiveFilters ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
              onClick={() => { setFilterOpen(o => !o); setFieldsOpen(false); }}
              title="Filter"
            >
              <Filter size={14} />
              {hasActiveFilters && <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 2 }}>{activeFilterEntries.length}</span>}
            </button>
            {filterOpen && (
              <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 30 }}>
                <FilterDropdown
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  onClose={() => setFilterOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Add Task */}
          <button className="btn-primary" onClick={onAddTask} style={{ fontSize: 13, background: '#171717', color: '#fff', border: 'none' }}>
            <Plus size={14} /> {addLabel.replace(/^\+\s*/, '')}
          </button>
        </div>
      </div>

      {/* Active filter chips — always visible below toolbar when filters are on */}
      {(hasActiveFilters || search) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 24px 10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Filtering by:</span>

          {activeFilterEntries.map(([key, value]) => (
            <span
              key={key}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 600,
                padding: '3px 8px 3px 10px', borderRadius: 20,
                background: 'var(--accent-light)', color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              <span style={{ textTransform: 'capitalize', opacity: 0.7, fontSize: 11 }}>{key}:</span>
              {filterLabel(key, value)}
              <button
                onClick={() => clearFilter(key)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--accent)' }}
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {search && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600,
              padding: '3px 8px 3px 10px', borderRadius: 20,
              background: 'var(--surface-2)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
              <span style={{ opacity: 0.7, fontSize: 11 }}>search:</span>
              "{search}"
              <button
                onClick={() => { setSearchOpen(false); onSearchChange(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--text-secondary)' }}
              >
                <X size={11} />
              </button>
            </span>
          )}

          <button
            className="btn-ghost"
            style={{ fontSize: 11, padding: '2px 8px', color: 'var(--text-muted)' }}
            onClick={() => { onFiltersChange({}); onSearchChange(''); setSearchOpen(false); }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
