import { Injectable, signal } from '@angular/core';
import { MOCK_BOARDS } from './mock-boards';
import { Board, Task, TaskFormValue } from './models';

/**
 * Single place to read and change board data. The data starts from local mock
 * data and lives in memory; there is no backend, so changes reset on reload.
 *
 * The boards are stored in a signal. Any computed() or template that reads them
 * updates automatically when a task is added or edited.
 */
@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly boards = signal<Board[]>(MOCK_BOARDS);

  getBoards(): Board[] {
    return this.boards();
  }

  getBoard(boardId: string): Board | undefined {
    return this.boards().find((board) => board.id === boardId);
  }

  getTask(boardId: string, taskId: string): Task | undefined {
    return this.getBoard(boardId)?.tasks.find((task) => task.id === taskId);
  }

  /** True if another task on the board already uses this title (ignoring case and spaces). */
  isTitleTaken(boardId: string, title: string, excludeTaskId?: string): boolean {
    const normalizedTitle = title.trim().toLowerCase();
    return (this.getBoard(boardId)?.tasks ?? []).some(
      (task) => task.id !== excludeTaskId && task.title.trim().toLowerCase() === normalizedTitle,
    );
  }

  /** Adds a new task to a board. Returns the created task, or undefined if the board doesn't exist. */
  addTask(boardId: string, value: TaskFormValue): Task | undefined {
    const board = this.getBoard(boardId);
    if (!board) {
      return undefined;
    }

    const newTask: Task = { id: this.nextTaskId(board), ...this.toTaskFields(value), subtasks: [] };

    this.boards.update((boards) =>
      boards.map((b) => (b.id === boardId ? { ...b, tasks: [...b.tasks, newTask] } : b)),
    );
    return newTask;
  }

  /** Replaces the editable fields of one task. Returns the updated task, or undefined if it doesn't exist. */
  updateTask(boardId: string, taskId: string, value: TaskFormValue): Task | undefined {
    const existingTask = this.getTask(boardId, taskId);
    if (!existingTask) {
      return undefined;
    }

    // Keep the id and subtasks; only the fields from the form change.
    const updatedTask: Task = { ...existingTask, ...this.toTaskFields(value) };

    this.boards.update((boards) =>
      boards.map((b) =>
        b.id === boardId
          ? { ...b, tasks: b.tasks.map((task) => (task.id === taskId ? updatedTask : task)) }
          : b,
      ),
    );
    return updatedTask;
  }

  private toTaskFields(value: TaskFormValue) {
    return {
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate || undefined,
    };
  }

  /** Task ids are numbers stored as strings, unique within a board. */
  private nextTaskId(board: Board): string {
    const highestId = Math.max(0, ...board.tasks.map((task) => Number(task.id)));
    return String(highestId + 1);
  }
}
