import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';

@Component({
  imports: [RouterOutlet, Sidebar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  protected readonly sidebarHidden = signal(false);

  constructor() {
    this.logNavigationEvents();
  }

  /** Logs the main router events so you can follow each navigation in the browser console. */
  private logNavigationEvents(): void {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('[Router] Navigation started:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('[Router] Navigation ended:', event.urlAfterRedirects);
      } else if (event instanceof NavigationCancel) {
        console.warn('[Router] Navigation cancelled:', event.url, '-', event.reason);
      } else if (event instanceof NavigationError) {
        console.error('[Router] Navigation error:', event.url, event.error);
      }
    });
  }
}
