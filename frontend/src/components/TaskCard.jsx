import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { CalendarClock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './TaskBadges';
import { NEXT_STATUS, STATUSES, formatDue, isOverdue } from '../utils/tasks';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const overdue = isOverdue(task);
  const done = task.status === 'done';
  const StatusIcon = STATUSES[task.status].icon;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <article className="card group flex gap-3 p-4 transition hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700 sm:gap-4 sm:p-5">
      <button
        type="button"
        onClick={() => onStatusChange(task, NEXT_STATUS[task.status])}
        className={clsx(
          'mt-0.5 h-6 w-6 shrink-0 rounded-full transition hover:scale-110',
          done ? 'text-emerald-500' : task.status === 'in_progress' ? 'text-amber-500' : 'text-slate-300 hover:text-brand-500 dark:text-slate-600'
        )}
        aria-label={`Passer au statut « ${STATUSES[NEXT_STATUS[task.status]].label} »`}
        title={`Passer à « ${STATUSES[NEXT_STATUS[task.status]].label} »`}
      >
        <StatusIcon className="h-6 w-6" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={clsx(
              'break-words font-medium leading-6',
              done && 'text-slate-400 line-through dark:text-slate-500'
            )}
          >
            {task.title}
          </h3>

          <div className="relative -mr-1 -mt-1 shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-20 mt-1 w-48 animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                <MenuItem icon={Pencil} onClick={() => { setMenuOpen(false); onEdit(task); }}>
                  Modifier
                </MenuItem>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <p className="px-3 pb-1 pt-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">Statut</p>
                {Object.entries(STATUSES).map(([key, s]) => (
                  <MenuItem
                    key={key}
                    icon={s.icon}
                    active={task.status === key}
                    onClick={() => { setMenuOpen(false); if (task.status !== key) onStatusChange(task, key); }}
                  >
                    {s.label}
                  </MenuItem>
                ))}
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <MenuItem icon={Trash2} danger onClick={() => { setMenuOpen(false); onDelete(task); }}>
                  Supprimer
                </MenuItem>
              </div>
            )}
          </div>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-sm text-slate-500 dark:text-slate-400">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-xs font-medium',
                overdue ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {overdue ? 'En retard · ' : ''}
              {formatDue(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function MenuItem({ icon: Icon, children, onClick, danger, active }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition',
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
        active && 'font-semibold text-brand-600 dark:text-brand-400'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
