import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RedirectCommand, Router, withNavigationErrorHandler } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // If a navigation fails (for example, a lazy-loaded file cannot be downloaded),
      // send the user to the not-found page instead of leaving the app stuck.
      withNavigationErrorHandler((navigationError) => {
        console.error('[Router] Navigation failed, redirecting to /not-found:', navigationError.error);
        const router = inject(Router);
        return new RedirectCommand(router.parseUrl('/not-found'));
      }),
    ),
  ],
};
