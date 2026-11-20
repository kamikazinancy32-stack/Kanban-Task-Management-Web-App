import { Injectable, signal } from '@angular/core';
import { PriorityFilter } from './models';

/**
 * Holds the user's saved settings in memory, so the Settings page and the
 * board page share the same value. Settings reset when the page is reloaded.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  /** Used by the board page when the URL has no `?priority=` query parameter. */
  readonly defaultPriority = signal<PriorityFilter>('all');
}
