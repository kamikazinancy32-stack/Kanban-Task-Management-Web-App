import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validation rules shared by the Add Task (template-driven) and Edit Task (reactive) forms.

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 300;

/** At least one character that isn't a space, so "   " is not accepted as a title. */
export const NOT_BLANK_PATTERN = '.*\\S.*';

/**
 * Custom validator: the title must not already be used by another task on the same board.
 * `isTaken` does the lookup, so this function stays independent of where the data lives.
 */
export function uniqueTitleValidator(isTaken: (title: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const title = String(control.value ?? '').trim();
    return title && isTaken(title) ? { duplicateTitle: true } : null;
  };
}

/**
 * Custom validator: a due date can't be in the past.
 * `allowedDate` lets an existing task keep the due date it already has, even if that date has passed.
 */
export function notInPastValidator(allowedDate?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const date: string = control.value ?? '';
    if (!date || date === allowedDate) {
      return null;
    }
    // yyyy-mm-dd strings sort the same way as the dates they represent.
    return date < todayIsoDate() ? { pastDate: true } : null;
  };
}

/** Today's local date in yyyy-mm-dd format, the format used by <input type="date">. */
export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Turns a control's validation errors into one message for the user. */
export function getErrorMessage(errors: ValidationErrors | null): string {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return 'This field is required.';
  }
  if (errors['pattern']) {
    return "Can't be only spaces.";
  }
  if (errors['minlength']) {
    return `Must be at least ${errors['minlength'].requiredLength} characters.`;
  }
  if (errors['maxlength']) {
    return `Must be ${errors['maxlength'].requiredLength} characters or fewer.`;
  }
  if (errors['duplicateTitle']) {
    return 'A task with this title already exists on this board.';
  }
  if (errors['pastDate']) {
    return "The due date can't be in the past.";
  }
  return 'This value is not valid.';
}
