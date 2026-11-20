import { FormControl } from '@angular/forms';
import {
  getErrorMessage,
  notInPastValidator,
  todayIsoDate,
  uniqueTitleValidator,
} from './task-validators';

describe('task validators', () => {
  describe('uniqueTitleValidator', () => {
    const takenTitles = ['build the pricing page'];
    const validator = uniqueTitleValidator((title) => takenTitles.includes(title.toLowerCase()));

    it('accepts a title that is not used yet', () => {
      expect(validator(new FormControl('A brand new task'))).toBeNull();
    });

    it('rejects a title that is already used, ignoring surrounding spaces', () => {
      expect(validator(new FormControl('  Build the pricing page  '))).toEqual({ duplicateTitle: true });
    });

    it('leaves empty values to the "required" validator', () => {
      expect(validator(new FormControl(''))).toBeNull();
    });
  });

  describe('notInPastValidator', () => {
    it('accepts no date, today and future dates', () => {
      const validator = notInPastValidator();
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(todayIsoDate()))).toBeNull();
      expect(validator(new FormControl('2999-01-01'))).toBeNull();
    });

    it('rejects a date in the past', () => {
      expect(notInPastValidator()(new FormControl('2020-01-01'))).toEqual({ pastDate: true });
    });

    it('accepts the allowed past date that a task already has', () => {
      const validator = notInPastValidator('2020-01-01');
      expect(validator(new FormControl('2020-01-01'))).toBeNull();
      expect(validator(new FormControl('2020-01-02'))).toEqual({ pastDate: true });
    });
  });

  it('turns validation errors into user-friendly messages', () => {
    expect(getErrorMessage(null)).toBe('');
    expect(getErrorMessage({ required: true })).toBe('This field is required.');
    expect(getErrorMessage({ minlength: { requiredLength: 3, actualLength: 1 } })).toBe(
      'Must be at least 3 characters.',
    );
    expect(getErrorMessage({ duplicateTitle: true })).toBe(
      'A task with this title already exists on this board.',
    );
  });
});
