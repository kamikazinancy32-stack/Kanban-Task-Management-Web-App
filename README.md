# Kanban Task Management Web App

A dark-themed Kanban board built with Angular during the AmaliTech Angular apprenticeship:

- **FEM12 Routing & Navigation:** boards, task details and settings, all driven by the Angular Router.
- **FEM13 Angular Forms:** creating and editing tasks with template-driven and reactive forms, validation and unsaved-changes protection.

The app shows a set of project boards. Each board splits its tasks into **Todo**, **Doing** and **Done** columns. You can open a task to see its details, add new tasks and edit existing ones. Every screen has its own URL, so pages can be bookmarked, shared, refreshed and navigated with the browser's Back and Forward buttons.

**Live site:** https://kamikazinancy32-stack.github.io/Kanban-Task-Management-Web-App/

## Features

- **Boards overview:** every board as a card, with task counts per status and a progress bar.
- **Board view:** Todo / Doing / Done columns with task cards showing subtask progress and priority.
- **Task details modal:** opened through a nested route (`/boards/:boardId/tasks/:taskId`). It shows the description, subtasks, status, priority and due date, and has an **Edit task** button.
- **Add task** (FEM13): a form in a modal on top of the board (`/boards/:boardId/tasks/new`).
- **Edit task** (FEM13): a form pre-filled with the task's current values (`/boards/:boardId/tasks/:taskId/edit`).
- **Priority filter:** a dropdown that filters tasks and stores the choice in the URL (`?priority=high`).
- **Settings:** set a default priority filter.
- **Unsaved-changes protection:** the Add Task, Edit Task and Settings forms ask for confirmation before you leave with unsaved changes.
- **Sidebar navigation:** highlights the active page and board, and can be hidden.
- **Not-found page:** shown for unknown URLs and invalid board IDs.
- **Responsive layout:** a sidebar on desktop and tablet, a top navigation bar on mobile, and columns that scroll sideways on small screens.

## FEM13: Angular Forms

### Template-driven vs reactive forms

The app uses both Angular form approaches, each where it fits best:

| | **Add Task:** template-driven | **Edit Task:** reactive |
|---|---|---|
| File | [`boards/add-task/`](src/app/boards/add-task) | [`boards/edit-task/`](src/app/boards/edit-task) |
| Module | `FormsModule` | `ReactiveFormsModule` |
| Where the form is defined | In the **template**: `ngModel` on each field, with validators as attributes (`required`, `minlength`, `[appUniqueTitle]`, ...) | In the **component**: `NonNullableFormBuilder.group({...})` with validator functions |
| Form state | `#taskForm="ngForm"`, `#title="ngModel"` template variables | `form` (a `FormGroup`) and `form.controls.title` in TypeScript |
| Why this approach | Creating a task starts from a blank, simple model, so the template can describe the whole form | Editing starts from existing data and needs more control: initial values, `reset()` back to the saved values, `markAllAsTouched()`, `markAsPristine()` after saving |

The **Settings** page (from FEM12) is a third, smaller template-driven form using `[(ngModel)]`.

### Validation

| Field | Rules |
|---|---|
| Title | Required. 3–60 characters. Can't be only spaces. **Must be unique on the board** (custom validator) |
| Description | Optional. At most 300 characters |
| Status | Required (Todo, Doing or Done). The Add Task form starts with no status selected |
| Priority | Required (High, Medium or Low), with Medium as the default |
| Due date | Optional. **Can't be in the past** (custom validator). When editing, a task may keep the due date it already has |

**Custom validators** ([`task-validators.ts`](src/app/boards/task-form/task-validators.ts)):

- `uniqueTitleValidator`: rejects a title already used by another task on the same board. It ignores letter case and surrounding spaces, and excludes the task being edited, so a task can keep its own title.
- `notInPastValidator`: rejects due dates before today, except an optional allowed date (the task's current due date).

Both validators are plain `ValidatorFn` functions. The reactive form uses them directly. The template-driven form uses them through two small directives ([`validator-directives.ts`](src/app/boards/task-form/validator-directives.ts)) that register them with `NG_VALIDATORS`, so the rules are written only once.

**When errors are shown:** a field's error message appears after the user leaves the field (touched) or after a submit attempt, never while the form is still untouched. Invalid fields get a red border, `aria-invalid="true"` and an `aria-describedby` link to their message. Submitting an invalid form saves nothing and moves keyboard focus to the first invalid field.

### Saving, cancelling and unsaved changes

- **Create task / Save changes:** validates the form, saves through `BoardService`, then shows the saved task's details on top of the board. The navigation uses `replaceUrl`, so the browser's Back button doesn't reopen the submitted form.
- **Cancel** (and the close button, a click outside the modal, or Escape): returns to the board.
- **Discard changes** (Edit Task): puts every field back to the task's saved values.
- **`unsavedChangesGuard`** (`CanDeactivate`): if the form has changes (`dirty`), leaving it asks *"You have unsaved changes. Leave this page and discard them?"*. There is no prompt when nothing changed or after a successful save.

### Data management

`BoardService` ([`data/board.service.ts`](src/app/data/board.service.ts)) keeps the boards in an Angular **signal**:

- `addTask()` creates a task with the next free id on that board.
- `updateTask()` replaces only the edited fields of one task. It keeps its id and subtasks, so a task is never duplicated.
- Changes are made immutably (with new arrays and objects), so the original mock data is never modified.
- The board columns, the task modal and the overview use `computed()` signals, so a new or edited task appears immediately in the right column.

The data lives in memory, with no backend, so changes reset when the page is reloaded.

## Lab requirements (FEM12) and how they are met

| # | Requirement | Implementation |
|---|---|---|
| 1 | Project setup | Angular 22 standalone app created with the Angular CLI, with the starter content removed |
| 2 | Configure the Angular Router | Routes for the boards view, board details, settings and a not-found page in `app.routes.ts`. Navigation happens without full page reloads |
| 3 | Core components | `BoardList`, `BoardDetail`, `TaskDetail`, `Settings`, `NotFound`, plus a shared `Sidebar` layout component |
| 4 | Navigation | `routerLink` throughout, `routerLinkActive` in the sidebar, programmatic navigation with `Router.navigate()` (priority filter, closing modals, after saving a form), router event logging, and a navigation error handler |
| 5 | Route parameters | Dynamic `:boardId` and `:taskId` parameters. The `?priority=` query parameter filters tasks. Invalid board IDs redirect to the not-found page and invalid task IDs show a "Task not found" message |
| 6 | Advanced routing | The boards section is a lazy-loaded feature area (`loadChildren`), Settings is lazy-loaded (`loadComponent`), and task details and forms are nested child routes rendered in the board's own `<router-outlet>` |
| 7 | Route guards | `boardExistsGuard` and `taskExistsGuard` (`CanActivate`) only open boards and tasks that exist. `unsavedChangesGuard` (`CanDeactivate`) protects Settings and both task forms |
| 8 | Testing | Unit tests for routes, navigation, active links, parameters, lazy loading, guards, the wildcard route, both forms, the validators and the service |
| 9 | Deployment | Deployed to GitHub Pages with a `404.html` fallback so direct URLs and refreshes on nested routes work (see [Deployment](#deployment)) |

## Routes

| URL | Page |
|---|---|
| `/` | Redirects to `/boards` |
| `/boards` | Boards overview (lazy-loaded feature) |
| `/boards/:boardId` | Board columns. Protected by `boardExistsGuard` |
| `/boards/:boardId?priority=high` | Board filtered by priority (`all`, `high`, `medium`, `low`) |
| `/boards/:boardId/tasks/new` | **Add Task** form (template-driven). Protected by `unsavedChangesGuard` |
| `/boards/:boardId/tasks/:taskId` | Task details modal on top of the board |
| `/boards/:boardId/tasks/:taskId/edit` | **Edit Task** form (reactive). Protected by `taskExistsGuard` and `unsavedChangesGuard` |
| `/settings` | Settings (lazy-loaded). Protected by `unsavedChangesGuard` |
| `/not-found` | Not-found page |
| `**` | Any other URL shows the not-found page |

`tasks/new` is listed **before** `tasks/:taskId` in [`boards.routes.ts`](src/app/boards/boards.routes.ts). The router uses the first route that matches, so the other order would treat "new" as a task ID. An unknown task in the edit URL is redirected by `taskExistsGuard` to the task details URL, which shows "Task not found".

## Technologies

- **[Angular 22](https://angular.dev):** standalone components, signals (`signal`, `computed`) and the built-in control flow (`@if`, `@for`)
- **Angular Forms:** template-driven forms (`FormsModule`, `ngModel`, `NgForm`), reactive forms (`ReactiveFormsModule`, `NonNullableFormBuilder`, `FormGroup`), built-in `Validators` and custom validators
- **Angular Router:** lazy loading, child routes, functional `CanActivate`/`CanDeactivate` guards, route and query parameters
- **TypeScript** (strict mode)
- **RxJS:** reading route parameters as observables, converted to signals with `toSignal`
- **Plain CSS:** CSS custom properties for the theme, Flexbox and Grid for the layout, with no UI library
- **Vitest + jsdom:** unit tests, run through the Angular CLI
- **GitHub Actions + GitHub Pages:** automated testing, building and deployment
- **Google Fonts:** Plus Jakarta Sans

## Getting started

You need **Node.js 24.15 or newer** (or Node 22.22.3+).

```bash
npm install
npm start
```

Then open http://localhost:4200. If that port is already in use, run `npm start -- --port 4300`.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm test` | Run the unit tests in watch mode |
| `npx ng test --watch=false` | Run the unit tests once |

## Project structure

```
src/
├── index.html, main.ts, styles.css    # page shell, app startup, theme + shared modal/form styles
└── app/
    ├── app.ts / app.html / app.css    # layout: sidebar + <router-outlet>, router event logging
    ├── app.config.ts                  # router setup and navigation error handling
    ├── app.routes.ts                  # top-level routes
    ├── data/                          # models, mock boards, BoardService, SettingsService
    ├── layout/sidebar/                # shared navigation
    ├── shared/
    │   └── unsaved-changes.guard.ts   # CanDeactivate guard for every form
    ├── boards/                        # lazy-loaded boards feature
    │   ├── boards.routes.ts           # feature routes (board + child routes)
    │   ├── board-exists.guard.ts      # CanActivate: the board must exist
    │   ├── task-exists.guard.ts       # CanActivate: the task to edit must exist
    │   ├── board-list/                # /boards
    │   ├── board-detail/              # /boards/:boardId
    │   ├── task-detail/               # /boards/:boardId/tasks/:taskId
    │   ├── add-task/                  # /boards/:boardId/tasks/new (template-driven form)
    │   ├── edit-task/                 # /boards/:boardId/tasks/:taskId/edit (reactive form)
    │   └── task-form/                 # shared validators, error messages, validator directives
    ├── settings/                      # settings page (template-driven form)
    └── not-found/                     # 404 page
```

## Testing

```bash
npx ng test --watch=false
```

The tests use Angular's `RouterTestingHarness` with the real route configuration, and drive the forms through the DOM the way a user would. They check that:

- **Routing (FEM12):** each URL loads the correct page, including lazy-loaded routes. The empty path redirects to `/boards`. Route and query parameters select and filter the right data. The task modal opens and closes as a child route. Sidebar links get the `active` class. The guards redirect or block as intended, and unknown URLs show the not-found page.
- **Add Task form:** it opens empty for `/tasks/new`, and shows required, length, blank, duplicate-title and past-date errors. Invalid submits create nothing. A valid submit creates the task in the right column. Cancel returns to the board, and the unsaved-changes prompt appears only when there are changes.
- **Edit Task form:** it loads the task from the route parameters, and opens from the details modal. An unknown task redirects. A task may keep its own title, but not another task's. Invalid submits change nothing. Saving updates the task without duplicating it and moves it to its new column. An existing past due date is allowed, and Discard changes restores the saved values. The unsaved-changes prompt works.
- **Validators and `BoardService`:** the custom validators and error messages, adding and updating tasks, and that the mock data is never modified.

## Deployment

**Live site:** https://kamikazinancy32-stack.github.io/Kanban-Task-Management-Web-App/

The app is deployed to **GitHub Pages** by a GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) on every push to `main`. The workflow:

1. installs dependencies and runs the unit tests
2. builds the app with `--base-href "/Kanban-Task-Management-Web-App/"`, because the site is served from the repository's sub-path
3. copies `index.html` to `404.html`
4. publishes the build to GitHub Pages

**Why `404.html`?** This is a single-page application: there is only one real HTML file, and Angular decides what to show from the URL. GitHub Pages has no rewrite rules, but it serves `404.html` for any path it doesn't recognize. Making that file a copy of `index.html` means direct visits and refreshes on nested routes such as `/boards/roadmap/tasks/1/edit` still load the app.

On Netlify or Vercel you would use a rewrite rule instead: a `_redirects` file containing `/* /index.html 200`, or a rewrite in `vercel.json`.

## Known limitations

- The data is local mock data held in memory. There is no backend, so new and edited tasks and settings reset when the page is reloaded.
- Tasks can be created and edited, but not deleted or dragged between columns. Subtasks are shown, but can't be edited.
- Route guards run in the browser. They control navigation and are **not** a security feature.
- The `CanDeactivate` guard only covers navigation inside the app, not refreshing or closing the browser tab.

## Design

Inspired by the [Frontend Mentor](https://www.frontendmentor.io) Kanban task management challenge, implemented independently with custom code and styles.
