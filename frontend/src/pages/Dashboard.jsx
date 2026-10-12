import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, CircleDot, ListTodo, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { tasksApi } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskMutations } from '../hooks/useTaskMutations';
import TaskFormModal from '../components/TaskFormModal';
import { PriorityBadge, StatusBadge } from '../components/TaskBadges';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { PRIORITIES, STATUSES, formatDue, formatRelative } from '../utils/tasks';

function greeting() {
  const h = new Date().getHours();
  if (h < 5 || h >= 18) return 'Bonsoir';
  return 'Bonjour';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setStats(await tasksApi.stats());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { create } = useTaskMutations(load);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Voici un aperçu de votre activité.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Nouvelle tâche
        </Button>
      </div>

      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Impossible de charger le tableau de bord"
          description={error}
          action={
            <Button variant="secondary" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Réessayer
            </Button>
          }
        />
      ) : !stats ? (
        <DashboardSkeleton />
      ) : stats.total === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Bienvenue sur TaskFlow !"
          description="Vous n’avez encore aucune tâche. Créez la première pour démarrer."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Créer ma première tâche
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard icon={ListTodo} label="Total" value={stats.total} tone="brand" to="/tasks" />
            <StatCard icon={CircleDot} label="En cours" value={stats.status.in_progress} tone="amber" to="/tasks?status=in_progress" />
            <StatCard
              icon={CheckCircle2}
              label="Terminées"
              value={stats.status.done}
              sub={`${stats.completedThisWeek} cette semaine`}
              tone="emerald"
              to="/tasks?status=done"
            />
            <StatCard icon={AlertTriangle} label="En retard" value={stats.overdue} tone="red" to="/tasks?overdue=true" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card p-6">
              <h2 className="font-semibold">Progression</h2>
              <div className="mt-6 flex items-center justify-center">
                <ProgressRing value={stats.completionRate} />
              </div>
              <div className="mt-6 space-y-3">
                {Object.entries(STATUSES).map(([key, s]) => (
                  <Bar key={key} label={s.label} value={stats.status[key]} total={stats.total} color={s.bar} />
                ))}
              </div>
            </div>

            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Échéances à venir</h2>
                <span className="text-xs text-slate-500">7 prochains jours</span>
              </div>
              {stats.upcoming.length === 0 ? (
                <p className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-800/50">
                  Aucune échéance cette semaine. 🎉
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.upcoming.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <CalendarClock className="h-3.5 w-3.5" /> {formatDue(t.dueDate)}
                        </p>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </li>
                  ))}
                </ul>
              )}

              <h3 className="mt-8 text-sm font-semibold text-slate-500">Tâches ouvertes par priorité</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {Object.entries(PRIORITIES).map(([key, p]) => (
                  <Link
                    key={key}
                    to={`/tasks?priority=${key}`}
                    className="rounded-xl border border-slate-200 p-3 text-center transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-500/50"
                  >
                    <p className="text-2xl font-bold">{stats.priority[key]}</p>
                    <p className="text-xs text-slate-500">{p.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Activité récente</h2>
              <Link to="/tasks" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent.map((t) => (
                <li key={t.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className={clsx('truncate font-medium', t.status === 'done' && 'text-slate-400 line-through')}>{t.title}</p>
                    <p className="text-xs text-slate-500">Modifiée {formatRelative(t.updatedAt)}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={create} />
    </div>
  );
}

const tones = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

function StatCard({ icon: Icon, label, value, sub, tone, to }) {
  return (
    <Link to={to} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </Link>
  );
}

function ProgressRing({ value }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className="stroke-brand-600 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{value}%</span>
        <span className="text-xs text-slate-500">complété</span>
      </div>
    </div>
  );
}

function Bar({ label, value, total, color }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={clsx('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}
