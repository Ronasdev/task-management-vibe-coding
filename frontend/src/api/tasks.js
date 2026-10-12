import { api } from './client';

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false));

export const tasksApi = {
  list: (params = {}) => api.get('/tasks', { params: clean(params) }).then((r) => r.data),
  stats: () => api.get('/tasks/stats').then((r) => r.data),
  create: (payload) => api.post('/tasks', payload).then((r) => r.data.task),
  update: (id, payload) => api.patch(`/tasks/${id}`, payload).then((r) => r.data.task),
  remove: (id) => api.delete(`/tasks/${id}`),
};
