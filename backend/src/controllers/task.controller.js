import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { AppError } from '../utils/AppError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findOwnedTask(id, userId) {
  const task = await Task.findOne({ _id: id, owner: userId });
  if (!task) throw new AppError('Tâche introuvable', 404);
  return task;
}

export async function listTasks(req, res) {
  const { status, priority, q, overdue, sort, order, page, limit } = req.valid.query;
  const owner = new mongoose.Types.ObjectId(req.userId);

  const match = { owner };
  if (status) match.status = status;
  if (priority) match.priority = priority;
  if (q) match.title = { $regex: escapeRegex(q), $options: 'i' };
  if (overdue) {
    match.dueDate = { $lt: new Date() };
    match.status = { $ne: 'done' };
  }

  const dir = order === 'asc' ? 1 : -1;
  const sortStage =
    sort === 'priority'
      ? { priorityRank: dir, createdAt: -1 }
      : sort === 'dueDate'
        ? // Les tâches sans échéance passent toujours en dernier
          { hasDueDate: -1, dueDate: dir, createdAt: -1 }
        : { [sort]: dir, _id: dir };

  const [result] = await Task.aggregate([
    { $match: match },
    {
      $addFields: {
        priorityRank: { $indexOfArray: [['low', 'medium', 'high'], '$priority'] },
        hasDueDate: { $cond: [{ $ifNull: ['$dueDate', false] }, 1, 0] },
      },
    },
    { $sort: sortStage },
    {
      $facet: {
        items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result.total[0]?.count ?? 0;
  res.json({
    tasks: result.items.map((doc) => Task.hydrate(doc)),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function getStats(req, res) {
  const owner = new mongoose.Types.ObjectId(req.userId);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [byStatus, byPriority, overdue, completedThisWeek, upcoming, recent] = await Promise.all([
    Task.aggregate([{ $match: { owner } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { owner, status: { $ne: 'done' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ owner, status: { $ne: 'done' }, dueDate: { $lt: now } }),
    Task.countDocuments({ owner, status: 'done', completedAt: { $gte: weekAgo } }),
    Task.find({ owner, status: { $ne: 'done' }, dueDate: { $gte: startOfToday, $lte: inAWeek } })
      .sort({ dueDate: 1 })
      .limit(5),
    Task.find({ owner }).sort({ updatedAt: -1 }).limit(5),
  ]);

  const status = { todo: 0, in_progress: 0, done: 0 };
  for (const s of byStatus) status[s._id] = s.count;
  const priority = { low: 0, medium: 0, high: 0 };
  for (const p of byPriority) priority[p._id] = p.count;

  const total = status.todo + status.in_progress + status.done;

  res.json({
    total,
    status,
    priority,
    overdue,
    completedThisWeek,
    completionRate: total ? Math.round((status.done / total) * 100) : 0,
    upcoming,
    recent,
  });
}

export async function getTask(req, res) {
  const task = await findOwnedTask(req.valid.params.id, req.userId);
  res.json({ task });
}

export async function createTask(req, res) {
  const task = await Task.create({ ...req.valid.body, owner: req.userId });
  res.status(201).json({ task });
}

export async function updateTask(req, res) {
  const task = await findOwnedTask(req.valid.params.id, req.userId);
  task.set(req.valid.body);
  await task.save();
  res.json({ task });
}

export async function deleteTask(req, res) {
  const { deletedCount } = await Task.deleteOne({ _id: req.valid.params.id, owner: req.userId });
  if (!deletedCount) throw new AppError('Tâche introuvable', 404);
  res.status(204).end();
}
