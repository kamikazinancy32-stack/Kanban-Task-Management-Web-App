import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BoardService } from '../../data/board.service';
import { Board, TASK_STATUSES } from '../../data/models';

@Component({
  selector: 'app-board-list',
  imports: [RouterLink],
  templateUrl: './board-list.html',
  styleUrl: './board-list.css',
})
export class BoardList {
  private readonly boardService = inject(BoardService);

  protected readonly boards = this.boardService.getBoards().map((board) => this.summarize(board));

  /** Prepares the numbers shown on each board card. */
  private summarize(board: Board) {
    const taskCount = board.tasks.length;
    const doneCount = board.tasks.filter((task) => task.status === 'done').length;

    return {
      id: board.id,
      name: board.name,
      taskCount,
      percentDone: taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100),
      statusCounts: TASK_STATUSES.map((column) => ({
        ...column,
        count: board.tasks.filter((task) => task.status === column.status).length,
      })),
    };
  }
}
