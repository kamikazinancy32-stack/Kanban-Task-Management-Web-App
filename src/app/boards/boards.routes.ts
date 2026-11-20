import { Routes } from '@angular/router';
import { BoardDetail } from './board-detail/board-detail';
import { boardExistsGuard } from './board-exists.guard';
import { BoardList } from './board-list/board-list';
import { TaskDetail } from './task-detail/task-detail';

/** Routes for the lazy-loaded boards feature. All paths are relative to /boards. */
export const BOARD_ROUTES: Routes = [
  { path: '', title: 'Boards | Kanban', component: BoardList },
  {
    path: ':boardId',
    title: 'Board | Kanban',
    component: BoardDetail,
    canActivate: [boardExistsGuard],
    children: [
      // Rendered inside BoardDetail's <router-outlet>, shown as a modal over the board.
      { path: 'tasks/:taskId', title: 'Task | Kanban', component: TaskDetail },
    ],
  },
];
