export type TaskStatus = 'todo' | 'doing' | 'done';

export type Priority = 'high' | 'medium' | 'low';

/** A priority to filter tasks by, or 'all' to show every task. */
export type PriorityFilter = Priority | 'all';

export interface Subtask {
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  subtasks: Subtask[];
  /** Optional due date in yyyy-mm-dd format, the format used by <input type="date">. */
  dueDate?: string;
}

/** The values the Add Task and Edit Task forms produce. */
export interface TaskFormValue {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  /** Empty string when no due date is chosen. */
  dueDate: string;
}

export interface Board {
  id: string;
  name: string;
  tasks: Task[];
}

/** The board columns, in the order they are displayed. */
export const TASK_STATUSES: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Todo' },
  { status: 'doing', label: 'Doing' },
  { status: 'done', label: 'Done' },
];

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const PRIORITY_FILTERS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All priorities' },
  ...PRIORITY_OPTIONS,
];

/** Checks that a value (for example, from a query parameter) is a valid priority filter. */
export function isPriorityFilter(value: string | null): value is PriorityFilter {
  return PRIORITY_FILTERS.some((option) => option.value === value);
}

export function countCompletedSubtasks(task: Task): number {
  return task.subtasks.filter((subtask) => subtask.isCompleted).length;
}

export function getStatusLabel(status: TaskStatus): string {
  return TASK_STATUSES.find((column) => column.status === status)?.label ?? status;
}
