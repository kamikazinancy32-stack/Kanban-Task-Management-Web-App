import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BoardService } from '../data/board.service';

/**
 * Only lets the user open /boards/:boardId when that board exists.
 * Otherwise it redirects to the not-found page.
 *
 * Note: this checks data, not permissions. Route guards run in the browser,
 * so they control navigation but are never a security feature.
 */
export const boardExistsGuard: CanActivateFn = (route) => {
  const boardService = inject(BoardService);
  const router = inject(Router);

  const boardId = route.paramMap.get('boardId');

  if (boardId && boardService.getBoard(boardId)) {
    return true;
  }

  return router.createUrlTree(['/not-found']);
};
