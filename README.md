# Kanban Task Management Web App

A dark-themed Kanban board built with Angular for the **FEM12 Routing & Navigation** lab of the AmaliTech Angular apprenticeship.

The app shows a set of project boards. Each board splits its tasks into **Todo**, **Doing** and **Done** columns, and every task opens in a details modal. Every screen is driven by the Angular Router: each board, each task and each filter has its own URL, so pages can be bookmarked, shared, refreshed and navigated with the browser's Back and Forward buttons.

Routing is the focus of this project. The Kanban features are deliberately read-only and use local mock data.

## Features

- **Boards overview:** every board as a card, with task counts per status and a progress bar.
- **Board view:** Todo / Doing / Done columns with task cards showing subtask progress and priority.
- **Task details modal:** opened through a nested route (`/boards/:boardId/tasks/:taskId`). It can be closed with the close button, a click outside the modal, the Escape key or the browser's Back button.
- **Priority filter:** a dropdown that filters tasks and stores the choice in the URL (`?priority=high`).
- **Settings:** set a default priority filter. A confirmation prompt warns you before you leave with unsaved changes.
- **Sidebar navigation:** highlights the active page and board, and can be hidden.
- **Not-found page:** shown for unknown URLs and invalid board IDs.
- **Responsive layout:** a sidebar on desktop and tablet, a top navigation bar on mobile, and columns that scroll sideways on small screens.

## Lab requirements (FEM12) and how they are met

| # | Requirement | Implementation |
|---|---|---|
| 1 | Project setup | Angular 22 standalone app created with the Angular CLI, with the starter content removed |
| 2 | Configure the Angular Router | Routes for the boards view, board details, settings and a not-found page in `app.routes.ts`. Navigation happens without full page reloads |
| 3 | Core components | `BoardList`, `BoardDetail`, `TaskDetail`, `Settings`, `NotFound`, plus a shared `Sidebar` layout component |
| 4 | Navigation | `routerLink` throughout, `routerLinkActive` in the sidebar, programmatic navigation with `Router.navigate()` for the priority filter and for closing the task modal, router event logging, and a navigation error handler |
| 5 | Route parameters | Dynamic `:boardId` and `:taskId` parameters read with `ActivatedRoute.paramMap`. The `?priority=` query parameter filters tasks. Invalid board IDs redirect to the not-found page and invalid task IDs show a "Task not found" message |
| 6 | Advanced routing | The boards section is a lazy-loaded feature area (`loadChildren`), Settings is lazy-loaded (`loadComponent`), and tasks are a nested child route rendered in the board's own `<router-outlet>` |
| 7 | Route guards | `boardExistsGuard` (`CanActivate`) only opens boards that exist. `unsavedChangesGuard` (`CanDeactivate`) asks for confirmation before leaving Settings with unsaved changes |
| 8 | Testing | Unit tests for routes, navigation, active links, route and query parameters, lazy loading, guards and the wildcard route |
| 9 | Deployment | Deployed to GitHub Pages with a `404.html` fallback so direct URLs and refreshes on nested routes work (see [Deployment](#deployment)) |

## Routes

| URL | Page |
|---|---|
| `/` | Redirects to `/boards` |
| `/boards` | Boards overview (lazy-loaded feature) |
| `/boards/:boardId` | Board columns. Protected by `boardExistsGuard` |
| `/boards/:boardId?priority=high` | Board filtered by priority (`all`, `high`, `medium`, `low`) |
| `/boards/:boardId/tasks/:taskId` | Task details modal (child route) on top of the board |
| `/settings` | Settings (lazy-loaded). Protected by `unsavedChangesGuard` |
| `/not-found` | Not-found page |
| `**` | Any other URL shows the not-found page |

## Technologies

- **[Angular 22](https://angular.dev):** standalone components, signals and the built-in control flow (`@if`, `@for`)
- **Angular Router:** lazy loading, child routes, functional route guards, route and query parameters
- **TypeScript** (strict mode)
- **RxJS:** reading route parameters as observables, converted to signals with `toSignal`
- **Angular Forms:** `ngModel` for the filter and settings dropdowns
- **Plain CSS:** CSS custom properties for the theme, Flexbox and Grid for the layout, with no UI library
- **Vitest + jsdom:** unit tests, run through the Angular CLI
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
├── index.html, main.ts, styles.css   # page shell, app startup, theme and shared styles
└── app/
    ├── app.ts / app.html / app.css   # layout: sidebar + <router-outlet>, router event logging
    ├── app.config.ts                 # router setup and navigation error handling
    ├── app.routes.ts                 # top-level routes
    ├── data/                         # models, mock boards, BoardService, SettingsService
    ├── layout/sidebar/               # shared navigation
    ├── boards/                       # lazy-loaded boards feature
    │   ├── boards.routes.ts          # feature routes (parent + child route)
    │   ├── board-exists.guard.ts     # CanActivate guard
    │   ├── board-list/               # /boards
    │   ├── board-detail/             # /boards/:boardId
    │   └── task-detail/              # /boards/:boardId/tasks/:taskId
    ├── settings/                     # settings page + CanDeactivate guard
    └── not-found/                    # 404 page
```

## Testing

```bash
npx ng test --watch=false
```

The tests use Angular's `RouterTestingHarness` with the real route configuration. They check that:

- each URL loads the correct page, including the lazy-loaded routes
- the empty path redirects to `/boards`
- route parameters select the correct board and task
- the `?priority=` query parameter filters tasks, and the dropdown updates the URL
- the task modal opens as a child route and closes back to the board
- sidebar links navigate and get the `active` class
- `boardExistsGuard` redirects invalid board IDs to `/not-found`
- `unsavedChangesGuard` blocks or allows leaving Settings
- unknown URLs show the not-found page

## Deployment

**Live site:** https://kamikazinancy32-stack.github.io/Kanban-Task-Management-Web-App/

The app is deployed to **GitHub Pages** by a GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) on every push to `main`. The workflow:

1. installs dependencies and runs the unit tests
2. builds the app with `--base-href "/Kanban-Task-Management-Web-App/"`, because the site is served from the repository's sub-path
3. copies `index.html` to `404.html`
4. publishes the build to GitHub Pages

**Why `404.html`?** This is a single-page application: there is only one real HTML file, and Angular decides what to show from the URL. GitHub Pages has no rewrite rules, but it serves `404.html` for any path it doesn't recognize. Making that file a copy of `index.html` means direct visits and refreshes on nested routes such as `/boards/roadmap/tasks/1` still load the app.

On Netlify or Vercel you would use a rewrite rule instead: a `_redirects` file containing `/* /index.html 200`, or a rewrite in `vercel.json`.

## Known limitations

- The data is local mock data. There is no backend, and tasks cannot be created, edited or moved.
- Settings are stored in memory and reset when the page is reloaded.
- Route guards run in the browser. They control navigation and are **not** a security feature.
- The `CanDeactivate` guard only covers navigation inside the app, not refreshing or closing the browser tab.

## Design

Inspired by the [Frontend Mentor](https://www.frontendmentor.io) Kanban task management challenge, implemented independently with custom code and styles.
