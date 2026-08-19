'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  value: string | null;
  onChange: (date: string) => void;
  onClose: () => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar({ value, onChange, onClose }: CalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState(value ? new Date(value).getMonth() : today.getMonth());
  const [year, setYear] = useState(value ? new Date(value).getFullYear() : today.getFullYear());

  const selected = value ? new Date(value) : null;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells: { day: number; currentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, currentMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, currentMonth: false });

  const isSelected = (day: number, curr: boolean) => {
    if (!selected || !curr) return false;
    return selected.getDate() === day && selected.getMonth() === month && selected.getFullYear() === year;
  };
  const isToday = (day: number, curr: boolean) => curr && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const handleSelect = (day: number, curr: boolean) => {
    if (!curr) return;
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    onClose();
  };

  return (
    <div className="popover" style={{ padding: 12, minWidth: 260 }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={14} /></button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{MONTHS[month]} {year}</span>
        <button className="btn-icon" onClick={nextMonth}><ChevronRight size={14} /></button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleSelect(cell.day, cell.currentMonth)}
            disabled={!cell.currentMonth}
            style={{
              padding: '5px 0', textAlign: 'center', fontSize: 13, border: 'none',
              borderRadius: 6, cursor: cell.currentMonth ? 'pointer' : 'default',
              color: isSelected(cell.day, cell.currentMonth)
                ? 'var(--accent-text)'
                : cell.currentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
              background: isSelected(cell.day, cell.currentMonth)
                ? 'var(--accent)'
                : isToday(cell.day, cell.currentMonth)
                  ? 'var(--accent-light)'
                  : 'transparent',
              fontWeight: isSelected(cell.day, cell.currentMonth) || isToday(cell.day, cell.currentMonth) ? 600 : 400,
              transition: 'background 0.1s',
            }}
          >
            {cell.day}
          </button>
        ))}
      </div>

      {/* Clear */}
      {value && (
        <button className="btn-ghost" onClick={() => { onChange(''); onClose(); }}
          style={{ width: '100%', marginTop: 10, fontSize: 12, padding: '5px' }}>
          Clear date
        </button>
      )}
    </div>
  );
}
