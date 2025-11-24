// src/main.ts

import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import { registerLicense } from '@syncfusion/ej2-base';
import { environment } from './app/config/environment';

// ──────────────────────────────────────────────────────────────
// 1. Production mode
// ──────────────────────────────────────────────────────────────
if (environment.production) {
  enableProdMode();
}

// ──────────────────────────────────────────────────────────────
// 2. Syncfusion License (must be first!)
// ──────────────────────────────────────────────────────────────
if (environment.syncfusion?.licenseKey) {
  try {
    registerLicense(environment.syncfusion.licenseKey);
    console.log('Syncfusion license registered successfully');
  } catch (error) {
    console.error('Failed to register Syncfusion license:', error);
  }
} else {
  console.warn('Syncfusion license key not found in environment configuration');
}

// ──────────────────────────────────────────────────────────────
// 3. Global Error Handling (unchanged — love this!)
// ──────────────────────────────────────────────────────────────
window.addEventListener('error', (event) => {
  console.error('Global Error:', {
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
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
});

// ──────────────────────────────────────────────────────────────
// 4. Bootstrap with ZONLESS + merged config
// ──────────────────────────────────────────────────────────────
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideZonelessChangeDetection()  // This kills NG0908
  ]
})
  .catch((err) => {
    console.error('Bootstrap Error:', {
      error: err,
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      cause: err?.cause,
      timestamp: new Date().toISOString()
    });
    console.error('Full Bootstrap Error Object:', err);

    // Show red error banner in DOM
    if (typeof document !== 'undefined') {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position:fixed;top:0;left:0;right:0;background:#ff0000;color:#fff;
        padding:20px;z-index:99999;font-family:monospace;font-size:14px;
        overflow:auto;max-height:100vh;
      `;
      errorDiv.innerHTML = `
        <h2>Bootstrap Error</h2>
        <p><strong>Message:</strong> ${err?.message || 'Unknown error'}</p>
        <p><strong>Name:</strong> ${err?.name || 'Unknown'}</p>
        <pre style="background:#333;color:#0f0;padding:10px;border-radius:4px;">${err?.stack || 'No stack trace'}</pre>
      `;
      document.body.appendChild(errorDiv);
    }
  });