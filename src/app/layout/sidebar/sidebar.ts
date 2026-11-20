import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BoardService } from '../../data/board.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly boards = inject(BoardService).getBoards();

  /** Tells the parent (App) that the user clicked "Hide Sidebar". */
  readonly hide = output<void>();
}
