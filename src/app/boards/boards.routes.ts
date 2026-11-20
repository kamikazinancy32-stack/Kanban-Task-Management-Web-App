import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../shared/unsaved-changes.guard';
import { AddTask } from './add-task/add-task';
import { BoardDetail } from './board-detail/board-detail';
import { boardExistsGuard } from './board-exists.guard';
import { BoardList } from './board-list/board-list';
import { EditTask } from './edit-task/edit-task';
import { taskExistsGuard } from './task-exists.guard';
import { TaskDetail } from './task-detail/task-detail';

/** Routes for the lazy-loaded boards feature. All paths are relative to /boards. */
export const BOARD_ROUTES: Routes = [
  { path: '', title: 'Boards | Kanban', component: BoardList },
  {
    path: ':boardId',
    title: 'Board | Kanban',
    component: BoardDetail,
    canActivate: [boardExistsGuard],
    // Child routes render inside BoardDetail's <router-outlet>, shown as modals over the board.
    children: [
      // Must come before 'tasks/:taskId', otherwise "new" would be read as a task id.
      {
        path: 'tasks/new',
        title: 'Add task | Kanban',
        component: AddTask,
        canDeactivate: [unsavedChangesGuard],
      },
      { path: 'tasks/:taskId', title: 'Task | Kanban', component: TaskDetail },
      {
        path: 'tasks/:taskId/edit',
        title: 'Edit task | Kanban',
        component: EditTask,
        canActivate: [taskExistsGuard],
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
];
