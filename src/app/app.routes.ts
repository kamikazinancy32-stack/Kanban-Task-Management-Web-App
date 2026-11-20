import { Routes } from '@angular/router';
import { NotFound } from './not-found/not-found';
import { unsavedChangesGuard } from './settings/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'boards', pathMatch: 'full' },
  {
    // Lazy-loaded feature area: the board routes and components are downloaded
    // the first time the user visits a /boards URL.
    path: 'boards',
    loadChildren: () => import('./boards/boards.routes').then((m) => m.BOARD_ROUTES),
  },
  {
    path: 'settings',
    title: 'Settings | Kanban',
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
    canDeactivate: [unsavedChangesGuard],
  },
  { path: 'not-found', title: 'Page not found | Kanban', component: NotFound },
  // The wildcard must stay last: the router uses the first route that matches.
  { path: '**', title: 'Page not found | Kanban', component: NotFound },
];
