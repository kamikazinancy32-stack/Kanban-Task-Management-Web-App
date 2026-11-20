import { TestBed } from '@angular/core/testing';
import { BoardService } from './board.service';
import { MOCK_BOARDS } from './mock-boards';
import { TaskFormValue } from './models';

describe('BoardService', () => {
  let service: BoardService;

  const formValue: TaskFormValue = {
    title: '  Write the API docs  ',
    description: 'Document every endpoint.',
    status: 'doing',
    priority: 'high',
    dueDate: '',
  };

  beforeEach(() => {
    service = TestBed.inject(BoardService);
  });

  it('adds a task with the next id, trimmed text and no subtasks', () => {
    const task = service.addTask('roadmap', formValue);

    expect(task).toEqual({
      id: '5',
      title: 'Write the API docs',
      description: 'Document every endpoint.',
      status: 'doing',
      priority: 'high',
      dueDate: undefined,
      subtasks: [],
    });
    expect(service.getBoard('roadmap')?.tasks.length).toBe(5);
  });

  it('updates only the edited task, keeping its id and subtasks', () => {
    const before = service.getTask('roadmap', '3');

    service.updateTask('roadmap', '3', { ...formValue, dueDate: '2030-05-01' });

    const after = service.getTask('roadmap', '3');
    expect(after?.title).toBe('Write the API docs');
    expect(after?.dueDate).toBe('2030-05-01');
    expect(after?.subtasks).toEqual(before?.subtasks);
    expect(service.getBoard('roadmap')?.tasks.length).toBe(4);
    expect(service.getTask('roadmap', '1')?.title).toBe('Collect feature requests from support');
  });

  it('returns undefined for an unknown board or task', () => {
    expect(service.addTask('unknown-board', formValue)).toBeUndefined();
    expect(service.updateTask('roadmap', '999', formValue)).toBeUndefined();
  });

  it('checks for duplicate titles on one board, optionally excluding a task', () => {
    expect(service.isTitleTaken('roadmap', ' publish THE public roadmap page ')).toBe(true);
    expect(service.isTitleTaken('roadmap', 'Publish the public roadmap page', '4')).toBe(false);
    expect(service.isTitleTaken('marketing-plan', 'Publish the public roadmap page')).toBe(false);
  });

  it('never changes the original mock data', () => {
    service.addTask('roadmap', formValue);

    expect(MOCK_BOARDS.find((board) => board.id === 'roadmap')?.tasks.length).toBe(4);
  });
});
