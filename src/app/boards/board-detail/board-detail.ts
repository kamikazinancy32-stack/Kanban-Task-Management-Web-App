import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { BoardService } from '../../data/board.service';
import {
  countCompletedSubtasks,
  isPriorityFilter,
  PRIORITY_FILTERS,
  PriorityFilter,
  TASK_STATUSES,
} from '../../data/models';
import { SettingsService } from '../../data/settings.service';

@Component({
  selector: 'app-board-detail',
  imports: [FormsModule, RouterLink, RouterOutlet],
  templateUrl: './board-detail.html',
  styleUrl: './board-detail.css',
})
export class BoardDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  private readonly settings = inject(SettingsService);

  protected readonly priorityOptions = PRIORITY_FILTERS;
  protected readonly countCompletedSubtasks = countCompletedSubtasks;

  // paramMap is an Observable: when the user moves from one board to another,
  // Angular reuses this component, and paramMap emits the new :boardId.
  private readonly boardId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('boardId') ?? '')),
    { initialValue: '' },
  );

  private readonly priorityParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('priority'))),
    { initialValue: null },
  );

  protected readonly board = computed(() => this.boardService.getBoard(this.boardId()));

  /** A valid ?priority= in the URL wins. Otherwise the saved default from Settings is used. */
  protected readonly activePriority = computed<PriorityFilter>(() => {
    const priorityFromUrl = this.priorityParam();
    return isPriorityFilter(priorityFromUrl) ? priorityFromUrl : this.settings.defaultPriority();
  });

  /** The three columns, each with the tasks that match the current priority filter. */
  protected readonly columns = computed(() => {
    const tasks = this.board()?.tasks ?? [];
    const priority = this.activePriority();
    const visibleTasks =
      priority === 'all' ? tasks : tasks.filter((task) => task.priority === priority);

    return TASK_STATUSES.map((column) => ({
      ...column,
      tasks: visibleTasks.filter((task) => task.status === column.status),
    }));
  });

  /** Changing the dropdown updates the URL; the URL then drives what is shown. */
  protected onPriorityChange(priority: PriorityFilter): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { priority },
      queryParamsHandling: 'merge',
    });
  }
}
