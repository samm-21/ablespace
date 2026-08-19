'use client';
import { LayoutList, LayoutGrid } from 'lucide-react';

const ALL_FIELDS = ['priority', 'members', 'dueDate', 'labels', 'status', 'reporter'];
const FIELD_LABELS: Record<string, string> = {
  priority: 'Priority', members: 'Members', dueDate: 'Due Date',
  labels: 'Labels', status: 'Status', reporter: 'Reporter',
};

interface FieldsPopoverProps {
  view: 'board' | 'list';
  onViewChange: (v: 'board' | 'list') => void;
  visibleFields: string[];
  onFieldsChange: (fields: string[]) => void;
  onClose: () => void;
}

export default function FieldsPopover({ view, onViewChange, visibleFields, onFieldsChange, onClose }: FieldsPopoverProps) {
  const toggle = (field: string) => {
    if (visibleFields.includes(field)) {
      onFieldsChange(visibleFields.filter(f => f !== field));
    } else {
      onFieldsChange([...visibleFields, field]);
    }
  };

  return (
    <div className="popover" style={{ minWidth: 220, padding: '8px 0', zIndex: 40 }}>
      {/* View toggle */}
      <div style={{ display: 'flex', margin: '4px 8px 8px', background: 'var(--surface-2)', borderRadius: 7, padding: 3 }}>
        {(['list', 'board'] as const).map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            style={{
              flex: 1, padding: '5px 8px', borderRadius: 5, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontSize: 13, fontWeight: 500, transition: 'background 0.15s, color 0.15s',
              background: view === v ? 'var(--card-bg)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: view === v ? 'var(--shadow)' : 'none',
            }}
          >
            {v === 'list' ? <LayoutList size={13} /> : <LayoutGrid size={13} />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 0 6px' }} />

      {/* Field toggles */}
      {ALL_FIELDS.map(field => (
        <div
          key={field}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 14px', cursor: 'pointer',
          }}
          onClick={() => toggle(field)}
        >
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{FIELD_LABELS[field]}</span>
          {/* Checkbox */}
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            background: visibleFields.includes(field) ? 'var(--text-primary)' : 'transparent',
            border: visibleFields.includes(field) ? '1px solid var(--text-primary)' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {visibleFields.includes(field) && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
