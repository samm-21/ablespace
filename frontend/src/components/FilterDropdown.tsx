'use client';
import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { PRIORITY_OPTIONS, STATUS_COLUMNS } from '@/lib/constants';

const FILTER_OPTIONS = [
  { key: 'status', label: 'Status', options: STATUS_COLUMNS.map(s => ({ key: s.key, label: s.label })) },
  { key: 'priority', label: 'Priority', options: PRIORITY_OPTIONS.map(p => ({ key: p.key, label: p.label })) },
];

interface FilterDropdownProps {
  filters: Record<string, string>;
  onFiltersChange: (f: Record<string, string>) => void;
  onClose: () => void;
}

export default function FilterDropdown({ filters, onFiltersChange, onClose }: FilterDropdownProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const setFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
    setOpenMenu(null);
  };

  const clearFilter = (key: string) => {
    const f = { ...filters };
    delete f[key];
    onFiltersChange(f);
  };

  return (
    <div className="popover" style={{ minWidth: 200, padding: '8px 0', zIndex: 40 }}>
      <div style={{ padding: '4px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filters</span>
        <button className="btn-icon" style={{ padding: 2 }} onClick={onClose}><X size={12} /></button>
      </div>

      {FILTER_OPTIONS.map(filter => (
        <div key={filter.key} style={{ position: 'relative' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', cursor: 'pointer' }}
            onClick={() => setOpenMenu(openMenu === filter.key ? null : filter.key)}
          >
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{filter.label}</span>
              {filters[filter.key] && (
                <span style={{
                  marginLeft: 6, fontSize: 11, color: 'var(--accent)',
                  background: 'var(--accent-light)', padding: '1px 6px', borderRadius: 10,
                }}>
                  {filter.options.find(o => o.key === filters[filter.key])?.label}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {filters[filter.key] && (
                <button className="btn-icon" style={{ padding: 2 }} onClick={e => { e.stopPropagation(); clearFilter(filter.key); }}>
                  <X size={11} />
                </button>
              )}
              <ChevronRight size={13} style={{ color: 'var(--text-muted)', transform: openMenu === filter.key ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
            </div>
          </div>

          {openMenu === filter.key && (
            <div style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '4px 0' }}>
              {filter.options.map(opt => (
                <div
                  key={opt.key}
                  style={{
                    padding: '7px 20px', cursor: 'pointer', fontSize: 13,
                    color: filters[filter.key] === opt.key ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: filters[filter.key] === opt.key ? 600 : 400,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onClick={() => setFilter(filter.key, opt.key)}
                >
                  {opt.label}
                  {filters[filter.key] === opt.key && <span style={{ color: 'var(--accent)' }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
