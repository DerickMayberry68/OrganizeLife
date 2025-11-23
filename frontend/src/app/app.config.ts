import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from './config/environment';
// HTTP client removed - all services now use Supabase directly
// Auth interceptor removed - Supabase handles authentication automatically

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Temporarily disable zoneless in production to debug freezing issues
    // Re-enable once async operations are fully compatible
    ...(environment.production ? [] : [provideZonelessChangeDetection()]),
    provideRouter(routes)
  ]
};
