/**
 * Environment Configuration
 * Supabase configuration values
 * 
 * For local development, these values are set here.
 * For production, set NG_APP_SUPABASE_URL and NG_APP_SUPABASE_ANON_KEY environment variables.
 */
export const environment = {
  production: false,
  supabase: {
    url: 'https://cwvkrkiejntyexfxzxpx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmtya2llam50eWV4Znh6eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Nzc5NDksImV4cCI6MjA3NTU1Mzk0OX0.mTYN5JRhJDrs1XUblMnUJzVVp0rUR-j9mKiX62b-Kbs'
  }
};

/**
 * Production environment
 * In production, these values should be set via environment variables for security
 */
export const environmentProd = {
  production: true,
  supabase: {
    url: 'https://cwvkrkiejntyexfxzxpx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmtya2llam50eWV4Znh6eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Nzc5NDksImV4cCI6MjA3NTU1Mzk0OX0.mTYN5JRhJDrs1XUblMnUJzVVp0rUR-j9mKiX62b-Kbs'
  }
};
