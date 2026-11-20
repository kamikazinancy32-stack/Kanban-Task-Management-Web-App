import { Injectable } from '@angular/core';
import { MOCK_BOARDS } from './mock-boards';
import { Board, Task } from './models';

/**
 * Single place to read board data. The data is local mock data;
 * there is no backend in this project.
 */
@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly boards = MOCK_BOARDS;

  getBoards(): Board[] {
    return this.boards;
  }

  getBoard(boardId: string): Board | undefined {
    return this.boards.find((board) => board.id === boardId);
  }

  getTask(boardId: string, taskId: string): Task | undefined {
    return this.getBoard(boardId)?.tasks.find((task) => task.id === taskId);
  }
}
