/**
 * Production Environment Configuration
 * Supabase configuration values for production builds
 * 
 * This file is automatically used when building with --configuration production
 * via fileReplacements in angular.json
 * 
 * Note: These values are safe to commit as the anon key is public by design.
 */
export const environment = {
  production: true,
  version: '0.0.1',
  supabase: {
    url: 'https://cwvkrkiejntyexfxzxpx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmtya2llam50eWV4Znh6eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Nzc5NDksImV4cCI6MjA3NTU1Mzk0OX0.mTYN5JRhJDrs1XUblMnUJzVVp0rUR-j9mKiX62b-Kbs'
  }
};

