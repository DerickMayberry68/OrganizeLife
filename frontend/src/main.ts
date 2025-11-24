import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { registerLicense } from '@syncfusion/ej2-base';
import { environment } from './app/config/environment';

// Register Syncfusion license from environment configuration
// IMPORTANT: License must be registered BEFORE any Syncfusion components are imported/used
// This includes File Manager and all other Syncfusion components
// To update your license key:
// 1. Get your license key from https://www.syncfusion.com/account/manage-license
// 2. Ensure the key matches your Syncfusion version (check package.json for @syncfusion versions)
// 3. Update the licenseKey in src/app/config/environment.ts and environment.prod.ts
if (environment.syncfusion?.licenseKey) {
  try {
    registerLicense(environment.syncfusion.licenseKey);
    console.log('✓ Syncfusion license registered successfully');
  } catch (error) {
    console.error('✗ Failed to register Syncfusion license:', error);
  }
} else {
  console.warn('⚠️ Syncfusion license key not found in environment configuration');
}

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
      name: err?.name,
      cause: err?.cause,
      timestamp: new Date().toISOString()
    });
    // Also log the full error object for debugging
    console.error('🚨 Full Bootstrap Error Object:', err);
    // Try to display error in DOM if possible
    if (typeof document !== 'undefined') {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff0000;color:#fff;padding:20px;z-index:99999;font-family:monospace;';
      errorDiv.innerHTML = `
        <h2>Bootstrap Error</h2>
        <p><strong>Message:</strong> ${err?.message || 'Unknown error'}</p>
        <p><strong>Name:</strong> ${err?.name || 'Unknown'}</p>
        <pre>${err?.stack || 'No stack trace'}</pre>
      `;
      document.body.appendChild(errorDiv);
    }
  });
