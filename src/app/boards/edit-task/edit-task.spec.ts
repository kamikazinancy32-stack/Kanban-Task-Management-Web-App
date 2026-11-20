import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { BoardService } from '../../data/board.service';

describe('EditTask (reactive form)', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let boardService: BoardService;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    boardService = TestBed.inject(BoardService);
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

  function button(label: string): HTMLButtonElement {
    const buttons = harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>('.form-actions button') ?? [];
    return Array.from(buttons).find((b) => b.textContent?.trim() === label) as HTMLButtonElement;
  }

  it('loads the task identified by the :boardId and :taskId route parameters', async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/3/edit');

    expect(query<HTMLInputElement>('#edit-title').value).toBe('Prototype mobile app navigation');
    expect(query<HTMLTextAreaElement>('#edit-description').value).toContain('Test two navigation layouts');
    expect(query<HTMLSelectElement>('#edit-status').value).toBe('doing');
    expect(query<HTMLSelectElement>('#edit-priority').value).toBe('medium');
    expect(query<HTMLInputElement>('#edit-due-date').value).toBe('2027-02-01');
    expect(button('Discard changes').disabled).toBe(true);
  });

  it('opens from the "Edit task" link in the task details modal', async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/3');

    query<HTMLAnchorElement>('.edit-link').click();
    await harness.fixture.whenStable();

    expect(router.url).toBe('/boards/roadmap/tasks/3/edit');
  });

  it('redirects an unknown task id to the "Task not found" message (CanActivate)', async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/999/edit');

    expect(router.url).toBe('/boards/roadmap/tasks/999');
    expect(query('[role="dialog"]').textContent).toContain('Task not found');
  });

  it("allows the task's own title but rejects another task's title (custom validator)", async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/3/edit');

    await setValue('#edit-title', 'Publish the public roadmap page');
    expect(errorMessages()).toEqual(['A task with this title already exists on this board.']);

    await setValue('#edit-title', 'Prototype mobile app navigation');
    expect(errorMessages()).toEqual([]);
  });

  it('prevents saving an invalid form and leaves the task unchanged', async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/3/edit');

    await setValue('#edit-title', '');
    await submit();

    expect(errorMessages()).toEqual(['This field is required.']);
    expect(router.url).toBe('/boards/roadmap/tasks/3/edit');
    expect(boardService.getTask('roadmap', '3')?.title).toBe('Prototype mobile app navigation');
  });

  it('updates the existing task without duplicating it, and shows it in its new column', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    await harness.navigateByUrl('/boards/roadmap/tasks/3/edit');

    await setValue('#edit-title', 'Prototype the mobile tab bar');
    await setValue('#edit-status', 'done');
    await submit();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(router.url).toBe('/boards/roadmap/tasks/3');
    expect(boardService.getBoard('roadmap')?.tasks.length).toBe(4);
    expect(boardService.getTask('roadmap', '3')).toMatchObject({
      title: 'Prototype the mobile tab bar',
      status: 'done',
    });
    expect(query('[aria-label="Done column"]').textContent).toContain('Prototype the mobile tab bar');
    expect(query('[aria-label="Doing column"]').textContent).not.toContain('Prototype');
  });

  it('lets a task keep a due date that has passed, but not choose a new past date', async () => {
    // "Configure production hosting" already has a due date in the past.
    await harness.navigateByUrl('/boards/platform-launch/tasks/7/edit');

    await setValue('#edit-due-date', '2020-01-01');
    expect(errorMessages()).toEqual(["The due date can't be in the past."]);

    await setValue('#edit-due-date', '2026-10-30');
    await setValue('#edit-title', 'Configure production hosting and CDN');
    await submit();

    expect(router.url).toBe('/boards/platform-launch/tasks/7');
    expect(boardService.getTask('platform-launch', '7')?.title).toBe('Configure production hosting and CDN');
  });

  it('"Discard changes" puts back the saved values', async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/3/edit');
    await setValue('#edit-title', 'Something else');

    button('Discard changes').click();
    await harness.fixture.whenStable();

    expect(query<HTMLInputElement>('#edit-title').value).toBe('Prototype mobile app navigation');
    expect(button('Discard changes').disabled).toBe(true);
  });

  it('asks before leaving with unsaved changes, and leaves when the user confirms (CanDeactivate)', async () => {
    await harness.navigateByUrl('/boards/roadmap/tasks/3/edit');
    await setValue('#edit-title', 'Unsaved title');

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    button('Cancel').click();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/boards/roadmap/tasks/3/edit');

    confirmSpy.mockReturnValue(true);
    button('Cancel').click();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/boards/roadmap');
    expect(boardService.getTask('roadmap', '3')?.title).toBe('Prototype mobile app navigation');
  });
});
