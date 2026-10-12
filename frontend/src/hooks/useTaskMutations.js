import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { tasksApi } from '../api/tasks';
import { getErrorMessage } from '../api/client';
import { STATUSES } from '../utils/tasks';

/** Actions CRUD sur les tâches avec notifications ; `onChange` est appelé après chaque succès. */
export function useTaskMutations(onChange) {
  const create = useCallback(
    async (payload) => {
      await tasksApi.create(payload);
      toast.success('Tâche créée');
      onChange?.();
    },
    [onChange]
  );

  const update = useCallback(
    async (id, payload) => {
      await tasksApi.update(id, payload);
      toast.success('Tâche mise à jour');
      onChange?.();
    },
    [onChange]
  );

  const changeStatus = useCallback(
    async (task, status) => {
      try {
        await tasksApi.update(task.id, { status });
        toast.success(`« ${task.title} » → ${STATUSES[status].label}`);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        onChange?.();
      }
    },
    [onChange]
  );

  const remove = useCallback(
    async (task) => {
      try {
        await tasksApi.remove(task.id);
        toast.success('Tâche supprimée');
        onChange?.();
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err));
        return false;
      }
    },
    [onChange]
  );

  return { create, update, changeStatus, remove };
}
