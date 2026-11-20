import { Directive, inject, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { BoardService } from '../../data/board.service';
import { notInPastValidator, uniqueTitleValidator } from './task-validators';

/*
 * Template-driven forms add validators through attributes in the template.
 * These directives make the custom validators usable that way, for example:
 *   <input name="title" ngModel [appUniqueTitle]="boardId" />
 * Providing NG_VALIDATORS tells Angular's ngModel to call validate() on every change.
 */

@Directive({
  selector: '[appUniqueTitle]',
  providers: [{ provide: NG_VALIDATORS, useExisting: UniqueTitleValidatorDirective, multi: true }],
})
export class UniqueTitleValidatorDirective implements Validator {
  private readonly boardService = inject(BoardService);

  /** The board whose task titles must not be repeated. */
  readonly boardId = input.required<string>({ alias: 'appUniqueTitle' });

  private readonly validator = uniqueTitleValidator((title) =>
    this.boardService.isTitleTaken(this.boardId(), title),
  );

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }
}

@Directive({
  selector: '[appNotInPast]',
  providers: [{ provide: NG_VALIDATORS, useExisting: NotInPastValidatorDirective, multi: true }],
})
export class NotInPastValidatorDirective implements Validator {
  private readonly validator = notInPastValidator();

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }
}
