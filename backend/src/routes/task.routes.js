import { Router } from 'express';
import * as tasks from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createTaskSchema,
  listTasksSchema,
  taskIdSchema,
  updateTaskSchema,
} from '../validators/task.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: listTasksSchema }), asyncHandler(tasks.listTasks));
router.get('/stats', asyncHandler(tasks.getStats));
router.post('/', validate({ body: createTaskSchema }), asyncHandler(tasks.createTask));
router.get('/:id', validate({ params: taskIdSchema }), asyncHandler(tasks.getTask));
router.patch(
  '/:id',
  validate({ params: taskIdSchema, body: updateTaskSchema }),
  asyncHandler(tasks.updateTask)
);
router.delete('/:id', validate({ params: taskIdSchema }), asyncHandler(tasks.deleteTask));

export default router;
