import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIORITY_FILTERS } from '../data/models';
import { SettingsService } from '../data/settings.service';
import { HasUnsavedChanges } from '../shared/unsaved-changes.guard';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements HasUnsavedChanges {
  private readonly settings = inject(SettingsService);

  protected readonly priorityOptions = PRIORITY_FILTERS;

  /** The value in the form. It only reaches SettingsService when the user saves. */
  protected readonly selectedPriority = signal(this.settings.defaultPriority());

  /** Called by unsavedChangesGuard before the user leaves this page. */
  hasUnsavedChanges(): boolean {
    return this.selectedPriority() !== this.settings.defaultPriority();
  }

  protected save(): void {
    this.settings.defaultPriority.set(this.selectedPriority());
  }

  protected discardChanges(): void {
    this.selectedPriority.set(this.settings.defaultPriority());
  }
}
