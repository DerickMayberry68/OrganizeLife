import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
// HTTP client removed - all services now use Supabase directly
// Auth interceptor removed - Supabase handles authentication automatically
// Zoneless change detection temporarily disabled - may cause freezing with Supabase async operations

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideZonelessChangeDetection(), // Temporarily disabled - may cause freezing with Supabase
    provideRouter(routes)
  ]
};
