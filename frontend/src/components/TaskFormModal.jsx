import { useEffect, useState } from 'react';
import Modal from './Modal';
import { Button, Field, Input, Select, Textarea } from './ui';
import { PRIORITIES, STATUSES, fromDateInput, toDateInput } from '../utils/tasks';
import { getErrorMessage, getFieldErrors } from '../api/client';

const empty = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function TaskFormModal({ open, onClose, task, onSubmit }) {
  const isEdit = !!task;
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(
      task
        ? {
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            dueDate: toDateInput(task.dueDate),
          }
        : empty
    );
    setErrors({});
    setFormError('');
  }, [open, task]);

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = values.title.trim();
    if (!title) {
      setErrors({ title: 'Le titre est requis' });
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit({
        title,
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        dueDate: fromDateInput(values.dueDate),
      });
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
      description={isEdit ? undefined : 'Ajoutez une tâche à votre liste.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" form="task-form" loading={submitting}>
            {isEdit ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {formError}
          </div>
        )}
        <Field label="Titre" htmlFor="title" error={errors.title}>
          <Input
            id="title"
            value={values.title}
            onChange={set('title')}
            placeholder="Ex. Préparer la présentation client"
            maxLength={200}
            error={errors.title}
            autoComplete="off"
          />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description}>
          <Textarea
            id="description"
            rows={4}
            value={values.description}
            onChange={set('description')}
            placeholder="Détails, notes, liens…"
            maxLength={5000}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Statut" htmlFor="status">
            <Select id="status" value={values.status} onChange={set('status')}>
              {Object.entries(STATUSES).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priorité" htmlFor="priority">
            <Select id="priority" value={values.priority} onChange={set('priority')}>
              {Object.entries(PRIORITIES).map(([k, p]) => (
                <option key={k} value={k}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Échéance" htmlFor="dueDate" error={errors.dueDate} hint="Optionnelle">
          <Input id="dueDate" type="date" value={values.dueDate} onChange={set('dueDate')} />
        </Field>
      </form>
    </Modal>
  );
}
