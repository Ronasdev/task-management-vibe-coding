import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { AlertTriangle, ChevronLeft, ChevronRight, ListTodo, Plus, RefreshCw, Search, SearchX, X } from 'lucide-react';
import { tasksApi } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import { useTaskMutations } from '../hooks/useTaskMutations';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button, EmptyState, Input, Select, Skeleton } from '../components/ui';
import { PRIORITIES, STATUSES } from '../utils/tasks';

const SORTS = {
  'createdAt:desc': 'Plus récentes',
  'createdAt:asc': 'Plus anciennes',
  'dueDate:asc': 'Échéance proche',
  'priority:desc': 'Priorité haute d’abord',
  'title:asc': 'Titre (A → Z)',
};

const PAGE_SIZE = 12;

export default function Tasks() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const priority = params.get('priority') || '';
  const overdue = params.get('overdue') === 'true';
  const sortKey = SORTS[params.get('sort')] ? params.get('sort') : 'createdAt:desc';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [search, setSearch] = useState(params.get('q') || '');
  const q = useDebounce(search.trim(), 350);

  const [data, setData] = useState({ tasks: [], pagination: null });
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === '' || v == null || v === false) next.delete(k);
            else next.set(k, String(v));
          }
          if (resetPage && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // Synchronise la recherche (debouncée) avec l'URL
  useEffect(() => {
    if ((params.get('q') || '') !== q) updateParams({ q });
  }, [q, params, updateParams]);

  const requestId = useRef(0);
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    const [sort, order] = sortKey.split(':');
    try {
      const [list, stats] = await Promise.all([
        tasksApi.list({ status, priority, overdue, q, sort, order, page, limit: PAGE_SIZE }),
        tasksApi.stats(),
      ]);
      if (id !== requestId.current) return; // réponse obsolète
      // Page hors limites après une suppression : on revient à la dernière page
      if (list.tasks.length === 0 && page > list.pagination.pages) {
        updateParams({ page: list.pagination.pages > 1 ? list.pagination.pages : '' }, { resetPage: false });
        return;
      }
      setData(list);
      setCounts({ all: stats.total, ...stats.status, overdue: stats.overdue });
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [status, priority, overdue, q, sortKey, page, updateParams]);

  useEffect(() => {
    load();
  }, [load]);

  const { create, update, changeStatus, remove } = useTaskMutations(load);

  const handleStatusChange = (task, next) => {
    // Mise à jour optimiste
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, status: next } : t)) }));
    changeStatus(task, next);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    const ok = await remove(deleting);
    setDeleteLoading(false);
    if (ok) setDeleting(null);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const hasFilters = !!(status || priority || overdue || q);
  const tabs = [
    { key: '', label: 'Toutes', count: counts?.all },
    ...Object.entries(STATUSES).map(([key, s]) => ({ key, label: s.label, count: counts?.[key] })),
  ];
  const pagination = data.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes tâches</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {pagination ? `${pagination.total} tâche${pagination.total > 1 ? 's' : ''}` : ' '}
            {hasFilters && ' correspondant aux filtres'}
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Nouvelle tâche
        </Button>
      </div>

      {/* Onglets de statut */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex min-w-full gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 sm:min-w-0">
          {tabs.map((t) => (
            <button
              key={t.key || 'all'}
              onClick={() => updateParams({ status: t.key, overdue: false })}
              className={clsx(
                'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition sm:flex-none sm:px-4',
                status === t.key && !overdue
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              {t.label}
              {t.count != null && (
                <span className="rounded-full bg-slate-200 px-1.5 text-xs tabular-nums dark:bg-slate-700">{t.count}</span>
              )}
            </button>
          ))}
          {counts?.overdue > 0 && (
            <button
              onClick={() => updateParams({ overdue: !overdue, status: '' })}
              className={clsx(
                'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition sm:flex-none sm:px-4',
                overdue
                  ? 'bg-white text-red-600 shadow-sm dark:bg-slate-800 dark:text-red-400'
                  : 'text-red-500 hover:text-red-700 dark:text-red-400'
              )}
            >
              En retard
              <span className="rounded-full bg-red-100 px-1.5 text-xs tabular-nums text-red-700 dark:bg-red-500/20 dark:text-red-300">
                {counts.overdue}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une tâche…"
            className="pl-10"
            aria-label="Rechercher"
            maxLength={100}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select value={priority} onChange={(e) => updateParams({ priority: e.target.value })} aria-label="Filtrer par priorité" className="sm:w-44">
            <option value="">Toutes priorités</option>
            {Object.entries(PRIORITIES).map(([k, p]) => (
              <option key={k} value={k}>
                Priorité {p.label.toLowerCase()}
              </option>
            ))}
          </Select>
          <Select value={sortKey} onChange={(e) => updateParams({ sort: e.target.value })} aria-label="Trier" className="sm:w-52">
            {Object.entries(SORTS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Contenu */}
      {error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Impossible de charger les tâches"
          description={error}
          action={
            <Button variant="secondary" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Réessayer
            </Button>
          }
        />
      ) : loading && !pagination ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : data.tasks.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="Aucun résultat"
            description="Aucune tâche ne correspond à vos critères."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  updateParams({ status: '', priority: '', overdue: false, q: '' });
                }}
              >
                <X className="h-4 w-4" /> Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={ListTodo}
            title="Aucune tâche pour l’instant"
            description="Créez votre première tâche pour commencer à vous organiser."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nouvelle tâche
              </Button>
            }
          />
        )
      ) : (
        <div className={clsx('grid gap-3 transition-opacity md:grid-cols-2', loading && 'opacity-60')}>
          {data.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 }, { resetPage: false })}>
            <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Précédent</span>
          </Button>
          <span className="text-sm text-slate-500">
            Page <strong className="text-slate-900 dark:text-white">{page}</strong> sur {pagination.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => updateParams({ page: page + 1 }, { resetPage: false })}
          >
            <span className="hidden sm:inline">Suivant</span> <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        onSubmit={(payload) => (editing ? update(editing.id, payload) : create(payload))}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Supprimer la tâche ?"
        message={
          <>
            La tâche <strong>« {deleting?.title} »</strong> sera définitivement supprimée. Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer"
      />
    </div>
  );
}
