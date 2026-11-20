import { CanDeactivateFn } from '@angular/router';

/** Any page that can tell the guard whether it has unsaved changes. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Asks the user to confirm before leaving a page with unsaved changes.
 *
 * Limitation: the router only runs this for navigation inside the app.
 * Reloading or closing the browser tab does not trigger it.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return window.confirm('You have unsaved changes. Leave this page and discard them?');
};
