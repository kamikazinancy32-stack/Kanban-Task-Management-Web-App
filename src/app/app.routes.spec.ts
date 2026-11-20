import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { SettingsService } from './data/settings.service';
import { Settings } from './settings/settings';

/**
 * Routing tests: each test navigates to a URL using the real route config
 * and checks which page is displayed and where the router ended up.
 */
describe('App routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  /** Text of the page currently displayed by the router. */
  function pageText(): string {
    return harness.routeNativeElement?.textContent ?? '';
  }

  /** Task titles currently shown on the board. */
  function taskTitles(): string[] {
    const titles = harness.routeNativeElement?.querySelectorAll('.task-title') ?? [];
    return Array.from(titles, (title) => title.textContent?.trim() ?? '');
  }

  it('redirects the empty path to the lazy-loaded boards overview', async () => {
    await harness.navigateByUrl('/');

    expect(router.url).toBe('/boards');
    expect(pageText()).toContain('All boards');
    expect(pageText()).toContain('Platform Launch');
  });

  it('shows the board that matches the :boardId route parameter', async () => {
    await harness.navigateByUrl('/boards/roadmap');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Roadmap');
    expect(taskTitles()).toContain('Prototype mobile app navigation');
  });

  it('updates the board when only the route parameter changes', async () => {
    await harness.navigateByUrl('/boards/roadmap');
    await harness.navigateByUrl('/boards/marketing-plan');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Marketing Plan');
  });

  it('redirects an unknown board id to the not-found page (CanActivate guard)', async () => {
    await harness.navigateByUrl('/boards/does-not-exist');

    expect(router.url).toBe('/not-found');
    expect(pageText()).toContain("This page doesn't exist");
  });

  it('shows the not-found page for any undefined route (wildcard)', async () => {
    await harness.navigateByUrl('/some/unknown/page');

    expect(router.url).toBe('/some/unknown/page');
    expect(pageText()).toContain("This page doesn't exist");
  });

  it('opens the task modal as a child route on top of the board', async () => {
    await harness.navigateByUrl('/boards/platform-launch/tasks/4');

    const dialog = harness.routeNativeElement?.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('Build the pricing page');
    expect(dialog?.textContent).toContain('Subtasks (2 of 4)');
    // The parent board is still displayed behind the modal.
    expect(taskTitles()).toContain('Design the sign-up flow');
  });

  it('shows a "Task not found" message for an unknown task id', async () => {
    await harness.navigateByUrl('/boards/platform-launch/tasks/999');

    const dialog = harness.routeNativeElement?.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('Task not found');
  });

  it('closes the task modal by navigating back to the board, keeping the query parameters', async () => {
    await harness.navigateByUrl('/boards/platform-launch/tasks/4?priority=high');

    const closeButton = harness.routeNativeElement?.querySelector<HTMLButtonElement>('.modal-close');
    closeButton?.click();
    await harness.fixture.whenStable();

    expect(router.url).toBe('/boards/platform-launch?priority=high');
    expect(harness.routeNativeElement?.querySelector('[role="dialog"]')).toBeNull();
  });

  it('filters tasks using the ?priority query parameter', async () => {
    await harness.navigateByUrl('/boards/platform-launch?priority=low');

    expect(taskTitles()).toEqual(['Write the launch announcement', 'Create the brand style guide']);
  });

  it('updates the query parameter when the priority dropdown changes (programmatic navigation)', async () => {
    await harness.navigateByUrl('/boards/platform-launch');

    const select = harness.routeNativeElement?.querySelector('select') as HTMLSelectElement;
    select.value = 'medium';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();

    expect(router.url).toBe('/boards/platform-launch?priority=medium');
    expect(taskTitles()).toEqual([
      'Set up error monitoring',
      'Add search to the help center',
      'Plan beta tester sessions',
    ]);
  });

  it('uses the saved default priority only when the URL has no ?priority', async () => {
    TestBed.inject(SettingsService).defaultPriority.set('low');

    await harness.navigateByUrl('/boards/platform-launch');
    expect(taskTitles()).toEqual(['Write the launch announcement', 'Create the brand style guide']);

    await harness.navigateByUrl('/boards/platform-launch?priority=all');
    expect(taskTitles().length).toBe(9);
  });

  it('lazy-loads the settings page', async () => {
    await harness.navigateByUrl('/settings', Settings);

    expect(pageText()).toContain('Default priority filter');
  });

  describe('unsaved changes on the settings page (CanDeactivate guard)', () => {
    async function openSettingsWithUnsavedChanges(): Promise<void> {
      const settingsPage = await harness.navigateByUrl('/settings', Settings);
      const select = harness.routeNativeElement?.querySelector('select') as HTMLSelectElement;
      select.value = 'high';
      select.dispatchEvent(new Event('change'));
      await harness.fixture.whenStable();
      expect(settingsPage.hasUnsavedChanges()).toBe(true);
    }

    afterEach(() => vi.restoreAllMocks());

    it('stays on the page when the user cancels the confirmation', async () => {
      await openSettingsWithUnsavedChanges();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      await harness.navigateByUrl('/boards');

      expect(confirmSpy).toHaveBeenCalled();
      expect(router.url).toBe('/settings');
    });

    it('leaves the page when the user confirms', async () => {
      await openSettingsWithUnsavedChanges();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await harness.navigateByUrl('/boards');

      expect(router.url).toBe('/boards');
    });

    it('does not ask for confirmation when there are no unsaved changes', async () => {
      await harness.navigateByUrl('/settings', Settings);
      const confirmSpy = vi.spyOn(window, 'confirm');

      await harness.navigateByUrl('/boards');

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(router.url).toBe('/boards');
    });
  });
});
