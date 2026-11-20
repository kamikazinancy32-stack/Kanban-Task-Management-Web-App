import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  function pageWithUnsavedChanges(value: boolean): HasUnsavedChanges {
    return { hasUnsavedChanges: () => value };
  }

  afterEach(() => vi.restoreAllMocks());

  it('allows leaving when there are no unsaved changes', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');

    expect(unsavedChangesGuard(pageWithUnsavedChanges(false), route, state, state)).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('blocks leaving when the user cancels the confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    expect(unsavedChangesGuard(pageWithUnsavedChanges(true), route, state, state)).toBe(false);
  });

  it('allows leaving when the user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    expect(unsavedChangesGuard(pageWithUnsavedChanges(true), route, state, state)).toBe(true);
  });
});
