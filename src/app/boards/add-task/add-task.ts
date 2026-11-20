import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardService } from '../../data/board.service';
import { Priority, PRIORITY_OPTIONS, TASK_STATUSES, TaskStatus } from '../../data/models';
import { HasUnsavedChanges } from '../../shared/unsaved-changes.guard';
import {
  DESCRIPTION_MAX_LENGTH,
  getErrorMessage,
  NOT_BLANK_PATTERN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  todayIsoDate,
} from '../task-form/task-validators';
import {
  NotInPastValidatorDirective,
  UniqueTitleValidatorDirective,
} from '../task-form/validator-directives';

/**
 * Add Task form: a TEMPLATE-DRIVEN form.
 * The form, its controls and their validators are declared in the template with
 * ngModel and validator attributes. The component only holds a plain model object.
 */
@Component({
  selector: 'app-add-task',
  imports: [FormsModule, UniqueTitleValidatorDirective, NotInPastValidatorDirective],
  templateUrl: './add-task.html',
  host: { '(document:keydown.escape)': 'cancel()' },
})
export class AddTask implements HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // The modal covers the rest of the page, so this component is always created
  // fresh for one board. Reading the parent's :boardId once (snapshot) is enough.
  protected readonly boardId = this.route.parent?.snapshot.paramMap.get('boardId') ?? '';

  protected readonly statusOptions = TASK_STATUSES;
  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly titleMinLength = TITLE_MIN_LENGTH;
  protected readonly titleMaxLength = TITLE_MAX_LENGTH;
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  protected readonly notBlankPattern = NOT_BLANK_PATTERN;
  protected readonly today = todayIsoDate();
  protected readonly getErrorMessage = getErrorMessage;

  /** The form model: [(ngModel)] reads and writes these properties. */
  protected readonly task = {
    title: '',
    description: '',
    status: '' as TaskStatus | '',
    priority: 'medium' as Priority,
    dueDate: '',
  };

  protected readonly submitError = signal('');

  private readonly form = viewChild.required(NgForm);
  private saved = false;

  /** Used by unsavedChangesGuard. "dirty" means the user changed at least one field. */
  hasUnsavedChanges(): boolean {
    return !this.saved && !!this.form().dirty;
  }

  /** Show a field's error after the user leaves the field, or after they try to submit. */
  protected showError(control: NgModel, form: NgForm): boolean {
    return !!control.invalid && (!!control.touched || form.submitted);
  }

  protected save(form: NgForm): void {
    if (form.invalid) {
      this.focusFirstInvalidField();
      return;
    }

    // status can't be '' here: the "required" validator already passed.
    const createdTask = this.boardService.addTask(this.boardId, {
      ...this.task,
      status: this.task.status as TaskStatus,
    });

    if (!createdTask) {
      this.submitError.set("The task couldn't be created because this board no longer exists.");
      return;
    }

    this.saved = true;
    // Show the new task on top of the board. replaceUrl: Back won't reopen the submitted form.
    this.router.navigate(['tasks', createdTask.id], {
      relativeTo: this.route.parent,
      queryParamsHandling: 'preserve',
      replaceUrl: true,
    });
  }

  /** Back to the board. If the form has changes, unsavedChangesGuard asks first. */
  protected cancel(): void {
    this.router.navigate(['./'], { relativeTo: this.route.parent, queryParamsHandling: 'preserve' });
  }

  private focusFirstInvalidField(): void {
    this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus();
  }
}
