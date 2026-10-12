import mongoose from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

taskSchema.pre('save', function trackCompletion() {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'done' ? new Date() : null;
  }
});

taskSchema.methods.toJSON = function toJSON() {
  return {
    id: this.id,
    title: this.title,
    description: this.description,
    status: this.status,
    priority: this.priority,
    dueDate: this.dueDate,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Task = mongoose.model('Task', taskSchema);
