import { Circle, CircleCheck, CircleDot } from 'lucide-react';

export const STATUSES = {
  todo: {
    label: 'À faire',
    icon: Circle,
    badge: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
  },
  in_progress: {
    label: 'En cours',
    icon: CircleDot,
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  done: {
    label: 'Terminée',
    icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
};

export const PRIORITIES = {
  low: {
    label: 'Basse',
    badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400',
  },
  medium: {
    label: 'Moyenne',
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400',
  },
  high: {
    label: 'Haute',
    badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400',
  },
};

export const NEXT_STATUS = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

export function isOverdue(task) {
  return !!task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

export const formatDate = (d) => (d ? dateFmt.format(new Date(d)) : '');

export function formatDue(d) {
  if (!d) return '';
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date(d)) - startOf(new Date())) / 86_400_000);
  if (Math.abs(days) <= 6) return rtf.format(days, 'day');
  return formatDate(d);
}

export function formatRelative(d) {
  const diff = (new Date(d).getTime() - Date.now()) / 1000;
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "à l'instant";
}

// <input type="date"> ⇄ ISO : l'échéance est fixée à la fin de la journée locale
export const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const fromDateInput = (value) => (value ? new Date(`${value}T23:59:59`).toISOString() : null);
