import { Priority, Status, ColorMode } from '@/types';

export const STATUS_COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: '#94A3B8' },
  { key: 'doing', label: 'Doing', color: '#F59E0B' },
  { key: 'completed', label: 'Completed', color: '#10B981' },
  { key: 'on-hold', label: 'On Hold', color: '#EF4444' },
];

export const PRIORITY_OPTIONS: { key: Priority; label: string; color: string }[] = [
  { key: 'no-priority', label: 'No Priority', color: '#94A3B8' },
  { key: 'urgent',      label: 'Urgent',      color: '#EF4444' },   // red
  { key: 'high',        label: 'High',        color: '#F97316' },   // orange
  { key: 'medium',      label: 'Medium',      color: '#EAB308' },   // gold
  { key: 'low',         label: 'Low',         color: '#84CC16' },   // lime green
];

export const COLOR_MODES: { key: ColorMode; label: string; hex: string }[] = [
  { key: 'amber', label: 'Amber', hex: '#F59E0B' },
  { key: 'blue', label: 'Blue', hex: '#6366F1' },
  { key: 'pink', label: 'Pink', hex: '#EC4899' },
  { key: 'rose', label: 'Rose', hex: '#F43F5E' },
  { key: 'emerald', label: 'Emerald', hex: '#10B981' },
  { key: 'black', label: 'Black', hex: '#000000' },
];

export const LABEL_OPTIONS = [
  'Research', 'Design', 'Development', 'Testing', 'Deployment',
  'Backend', 'Frontend', 'Database', 'Security', 'Performance',
];

export const ACCENT_COLORS: Record<ColorMode, string> = {
  amber: '#F59E0B',
  blue: '#6366F1',
  pink: '#EC4899',
  rose: '#F43F5E',
  emerald: '#10B981',
  black: '#000000',
};
