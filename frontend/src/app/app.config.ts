import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// HTTP client removed - all services now use Supabase directly
// Auth interceptor removed - Supabase handles authentication automatically

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Always enable zoneless for now to avoid bootstrap errors
    // The conditional check was causing issues with environment import
    // We can add conditional logic back later once bootstrap is stable
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
