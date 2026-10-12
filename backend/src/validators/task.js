import { z } from 'zod';
import mongoose from 'mongoose';
import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js';

const dueDate = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.null()])
  .transform((v) => (v ? new Date(v) : null));

export const taskIdSchema = z.object({
  id: z.string().refine((v) => mongoose.isValidObjectId(v), 'Identifiant invalide'),
});

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis').max(200),
    description: z.string().trim().max(5000).optional().default(''),
    status: z.enum(TASK_STATUSES).optional().default('todo'),
    priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
    dueDate: dueDate.optional().default(null),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis').max(200),
    description: z.string().trim().max(5000),
    status: z.enum(TASK_STATUSES),
    priority: z.enum(TASK_PRIORITIES),
    dueDate,
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, 'Aucun champ à mettre à jour');

export const listTasksSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  q: z.string().trim().max(100).optional(),
  overdue: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  sort: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
