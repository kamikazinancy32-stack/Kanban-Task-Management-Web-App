import { Component, ElementRef, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardService } from '../../data/board.service';
import { PRIORITY_OPTIONS, Task, TASK_STATUSES } from '../../data/models';
import { HasUnsavedChanges } from '../../shared/unsaved-changes.guard';
import {
  DESCRIPTION_MAX_LENGTH,
  getErrorMessage,
  NOT_BLANK_PATTERN,
  notInPastValidator,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  uniqueTitleValidator,
} from '../task-form/task-validators';

/**
 * Edit Task form: a REACTIVE form.
 * The form model (controls, initial values and validators) is built here in TypeScript
 * with FormBuilder, from the task being edited. The template only connects to it.
 */
@Component({
  selector: 'app-edit-task',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-task.html',
  host: { '(document:keydown.escape)': 'cancel()' },
})
export class EditTask implements HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  // The modal covers the rest of the page, so this component is always created
  // fresh for one task. Reading the route parameters once (snapshot) is enough.
  private readonly boardId = this.route.parent?.snapshot.paramMap.get('boardId') ?? '';
  private readonly taskId = this.route.snapshot.paramMap.get('taskId') ?? '';

  // taskExistsGuard only activates this route when the task exists.
  private readonly task = this.boardService.getTask(this.boardId, this.taskId) as Task;

  protected readonly statusOptions = TASK_STATUSES;
  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly getErrorMessage = getErrorMessage;

  // NonNullableFormBuilder: reset() goes back to these initial values instead of null.
  protected readonly form = this.formBuilder.group({
    title: [
      this.task.title,
      [
        Validators.required,
        Validators.minLength(TITLE_MIN_LENGTH),
        Validators.maxLength(TITLE_MAX_LENGTH),
        Validators.pattern(NOT_BLANK_PATTERN),
        // Exclude this task, so keeping its own title is allowed.
        uniqueTitleValidator((title) =>
          this.boardService.isTitleTaken(this.boardId, title, this.taskId),
        ),
      ],
    ],
    description: [this.task.description, Validators.maxLength(DESCRIPTION_MAX_LENGTH)],
    status: [this.task.status, Validators.required],
    priority: [this.task.priority, Validators.required],
    // An existing task may keep a due date that has already passed.
    dueDate: [this.task.dueDate ?? '', notInPastValidator(this.task.dueDate)],
  });

  protected readonly submitError = signal('');

  /** Used by unsavedChangesGuard. "dirty" means the user changed at least one field. */
  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  /** Show a field's error after the user leaves the field, or after they try to submit. */
  protected showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // reveals every error message
      this.focusFirstInvalidField();
      return;
    }

    const updatedTask = this.boardService.updateTask(this.boardId, this.taskId, this.form.getRawValue());

    if (!updatedTask) {
      this.submitError.set("The changes couldn't be saved because this task no longer exists.");
      return;
    }

    this.form.markAsPristine(); // saved, so the guard shouldn't warn
    // Show the updated task on top of the board. replaceUrl: Back won't reopen the form.
    this.router.navigate(['tasks', updatedTask.id], {
      relativeTo: this.route.parent,
      queryParamsHandling: 'preserve',
      replaceUrl: true,
    });
  }

  /** Puts every field back to the task's saved values. */
  protected discardChanges(): void {
    this.form.reset();
    this.submitError.set('');
  }

  /** Back to the board. If the form has changes, unsavedChangesGuard asks first. */
  protected cancel(): void {
    this.router.navigate(['./'], { relativeTo: this.route.parent, queryParamsHandling: 'preserve' });
  }

  private focusFirstInvalidField(): void {
    this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus();
  }
}
