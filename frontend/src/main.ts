import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion license
registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWH9ed3ZWR2JZU0B/WUZWYEg=');

// Enhanced error logging for debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('🚨 Bootstrap Error:', {
      error: err,
      message: err?.message,
      stack: err?.stack,
      timestamp: new Date().toISOString()
    });
  });
