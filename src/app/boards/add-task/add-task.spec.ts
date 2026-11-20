import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { BoardService } from '../../data/board.service';

describe('AddTask (template-driven form)', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let boardService: BoardService;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    boardService = TestBed.inject(BoardService);
    await harness.navigateByUrl('/boards/roadmap/tasks/new');
  });

  afterEach(() => vi.restoreAllMocks());

  function query<T extends Element>(selector: string): T {
    return harness.routeNativeElement?.querySelector(selector) as T;
  }

  /** Types a value into a field the way a user would: change it, then leave the field. */
  async function setValue(selector: string, value: string): Promise<void> {
    const field = query<HTMLInputElement | HTMLSelectElement>(selector);
    field.value = value;
    field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input'));
    field.dispatchEvent(new Event('blur'));
    await harness.fixture.whenStable();
  }

  async function submit(): Promise<void> {
    query<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
  }

  function errorMessages(): string[] {
    const errors = harness.routeNativeElement?.querySelectorAll('.form-error') ?? [];
    return Array.from(errors, (error) => error.textContent?.trim() ?? '');
  }

  function roadmapTaskCount(): number {
    return boardService.getBoard('roadmap')?.tasks.length ?? 0;
  }

  it('opens an empty form for /tasks/new (not a task called "new")', () => {
    expect(query('#add-task-heading').textContent).toContain('Add new task');
    expect(query<HTMLInputElement>('#task-title').value).toBe('');
    expect(query<HTMLSelectElement>('#task-status').value).toBe('');
    expect(query<HTMLSelectElement>('#task-priority').value).toBe('medium');
    expect(errorMessages()).toEqual([]);
  });

  it('shows required-field errors after a submit attempt and creates nothing', async () => {
    await submit();

    expect(errorMessages()).toEqual(['This field is required.', 'This field is required.']);
    expect(roadmapTaskCount()).toBe(4);
    expect(router.url).toBe('/boards/roadmap/tasks/new');
  });

  it('shows an error after leaving the title field with a title that is too short', async () => {
    await setValue('#task-title', 'ab');

    expect(errorMessages()).toEqual(['Must be at least 3 characters.']);
  });

  it('rejects a title made only of spaces', async () => {
    await setValue('#task-title', '     ');

    expect(errorMessages()).toEqual(["Can't be only spaces."]);
  });

  it('rejects a title that already exists on this board (custom validator)', async () => {
    await setValue('#task-title', ' publish the PUBLIC roadmap page ');

    expect(errorMessages()).toEqual(['A task with this title already exists on this board.']);
  });

  it('rejects a due date in the past (custom validator)', async () => {
    await setValue('#task-due-date', '2020-01-01');

    expect(errorMessages()).toEqual(["The due date can't be in the past."]);
  });

  it('creates the task, adds it to the right column and shows it, without an unsaved-changes warning', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');

    await setValue('#task-title', 'Write the API docs');
    await setValue('#task-description', 'Document every endpoint.');
    await setValue('#task-status', 'doing');
    await setValue('#task-priority', 'high');
    await setValue('#task-due-date', '2999-01-01');
    await submit();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(router.url).toBe('/boards/roadmap/tasks/5');
    expect(boardService.getTask('roadmap', '5')).toMatchObject({
      title: 'Write the API docs',
      status: 'doing',
      priority: 'high',
      dueDate: '2999-01-01',
    });
    expect(query('[aria-label="Doing column"]').textContent).toContain('Write the API docs');
  });

  it('cancel returns to the board without a warning when nothing changed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');

    query<HTMLButtonElement>('.form-actions .button-secondary').click();
    await harness.fixture.whenStable();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(router.url).toBe('/boards/roadmap');
  });

  it('asks before leaving with unsaved changes (CanDeactivate)', async () => {
    await setValue('#task-title', 'Half-typed task');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    query<HTMLButtonElement>('.form-actions .button-secondary').click();
    await harness.fixture.whenStable();

    expect(confirmSpy).toHaveBeenCalled();
    expect(router.url).toBe('/boards/roadmap/tasks/new');
    expect(roadmapTaskCount()).toBe(4);
  });
});
