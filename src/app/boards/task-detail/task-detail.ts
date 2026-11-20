import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BoardService } from '../../data/board.service';
import { countCompletedSubtasks, getStatusLabel } from '../../data/models';

@Component({
  selector: 'app-task-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
  host: {
    // Pressing Escape anywhere on the page closes the modal.
    '(document:keydown.escape)': 'close()',
  },
})
export class TaskDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);

  protected readonly countCompletedSubtasks = countCompletedSubtasks;
  protected readonly getStatusLabel = getStatusLabel;

  // :boardId belongs to the parent route (BoardDetail), :taskId to this child route.
  private readonly boardId = toSignal(
    this.route.parent!.paramMap.pipe(map((params) => params.get('boardId') ?? '')),
    { initialValue: '' },
  );

  private readonly taskId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('taskId') ?? '')),
    { initialValue: '' },
  );

  protected readonly task = computed(() =>
    this.boardService.getTask(this.boardId(), this.taskId()),
  );

  /** Closes the modal by navigating back to the parent board route, keeping any ?priority filter. */
  close(): void {
    this.router.navigate(['./'], {
      relativeTo: this.route.parent,
      queryParamsHandling: 'preserve',
    });
  }
}
