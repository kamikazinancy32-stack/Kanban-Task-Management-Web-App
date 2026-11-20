import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BoardService } from '../data/board.service';

/**
 * Only opens the Edit Task form for a task that exists. Otherwise it redirects to
 * the task details URL, which shows a "Task not found" message on top of the board.
 */
export const taskExistsGuard: CanActivateFn = (route) => {
  const boardService = inject(BoardService);
  const router = inject(Router);

  // :boardId belongs to the parent route; :taskId to this route.
  const boardId = route.parent?.paramMap.get('boardId') ?? '';
  const taskId = route.paramMap.get('taskId') ?? '';

  if (boardService.getTask(boardId, taskId)) {
    return true;
  }

  return router.createUrlTree(['/boards', boardId, 'tasks', taskId]);
};
