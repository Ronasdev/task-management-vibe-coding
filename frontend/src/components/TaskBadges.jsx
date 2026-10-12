import { Badge } from './ui';
import { PRIORITIES, STATUSES } from '../utils/tasks';

export const StatusBadge = ({ status }) => {
  const s = STATUSES[status];
  return (
    <Badge className={s.badge}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </Badge>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = PRIORITIES[priority];
  return <Badge className={p.badge}>{p.label}</Badge>;
};
