# Vercel Deployment Troubleshooting Guide

## Issue: App Hangs After Deployment to Vercel

If the Angular app works locally but hangs when deployed to Vercel, check the following:

### 1. Check Browser Console Logs

**This is the most important debugging step!** Vercel logs only show static file requests, not runtime errors.

Open the browser DevTools (F12) and check the Console tab. Look for:
- `[SupabaseService]` logs showing initialization status
- `🚨 Global Error:` - Enhanced error logging with full context
- `🚨 Unhandled Promise Rejection:` - Async errors
- `🚨 Bootstrap Error:` - App initialization errors
- Any CORS errors
- Network errors or timeouts
- Connection test results

**Enhanced Error Logging:**
The app now logs detailed error information including:
- Error message and stack trace
- File name and line numbers
- Timestamp and current URL
- Full error object for debugging

### 2. Check Network Tab

Open DevTools → Network tab and look for:
- Failed requests to `*.supabase.co`
- CORS errors (red requests with CORS warnings)
- Timeout errors (requests taking > 30 seconds)

### 3. Verify Supabase CORS Settings

In your Supabase Dashboard:
1. Go to **Settings** → **API**
2. Scroll to **CORS Configuration**
3. Add your Vercel domain(s):
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/*`
   - Any preview domains you use

**Note:** You may need to add:
- `https://*.vercel.app` (for preview deployments)
- Your production domain (if using custom domain)

### 4. Verify Supabase URL is Reachable

Test the Supabase URL from your deployment:
```bash
curl -I https://cwvkrkiejntyexfxzxpx.supabase.co/rest/v1/
```

Should return HTTP 200 or 404 (not a connection error).

### 5. Understanding Vercel Logs

**Important:** Vercel logs for Angular SPAs only show static file requests, not runtime errors.

**What Vercel Logs Show:**
- `GET /` → 200 (successful request for index.html)
- `GET /` → 304 (browser using cached content)
- Static asset requests (JS, CSS, images)

**What Vercel Logs DON'T Show:**
- JavaScript errors
- Runtime exceptions
- API call failures
- Authentication issues
- Client-side errors

**To Debug Runtime Issues:**
1. Use browser DevTools Console (most important!)
2. Check Network tab for failed API calls
3. Look for `🚨` prefixed error logs in console

### 6. Check Vercel Build Logs

In Vercel Dashboard:
1. Go to **Deployments**
2. Click on the deployment
3. Check **Build Logs** for:
   - Build errors (TypeScript, compilation)
   - Environment variable issues
   - Network timeouts during build
   - Missing dependencies

**Note:** Build logs show build-time errors, not runtime errors. Runtime errors appear in browser console.

### 6. Verify Environment Configuration

The app uses hardcoded Supabase credentials in `src/app/config/environment.ts`. Verify:
- URL: `https://cwvkrkiejntyexfxzxpx.supabase.co`
- Anon key is correct
- These values are baked into the build (no environment variables needed)

### 7. Check Supabase Project Status

In Supabase Dashboard:
1. Go to **Project Settings**
2. Verify project is **Active** (not paused)
3. Check **Database** → **Settings** → **Connection pooling** is enabled if needed

### 8. Test Supabase Connection Manually

Open browser console on deployed site and run:
```javascript
fetch('https://cwvkrkiejntyexfxzxpx.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  }
}).then(r => console.log('Connection:', r.status))
  .catch(e => console.error('Error:', e));
```

### 9. Common Issues

#### CORS Error
**Symptom:** Browser console shows CORS policy error
**Fix:** Add Vercel domain to Supabase CORS settings (see #3)

#### Network Timeout
**Symptom:** Requests hang indefinitely
**Fix:** Check Supabase project is active and not rate-limited

#### Invalid API Key
**Symptom:** 401 Unauthorized errors
**Fix:** Verify anon key in `environment.ts` matches Supabase dashboard

#### Authentication Blocking
**Symptom:** App loads but hangs on login/auth check
**Fix:** Check `AuthService` initialization - may need timeout/retry logic

### 10. Enable Detailed Logging

The app now includes detailed logging in `SupabaseService`:
- Look for `[SupabaseService]` prefixed logs
- These will show initialization progress
- Connection test results will appear after initialization

### Quick Debug Checklist

- [ ] Browser console shows `[SupabaseService] ✓ Client initialized successfully`
- [ ] Browser console shows `[SupabaseService] ✓ Connection test successful`
- [ ] No CORS errors in browser console
- [ ] Network tab shows successful requests to Supabase
- [ ] Vercel domain is in Supabase CORS whitelist
- [ ] Supabase project is active (not paused)
- [ ] Build logs show successful build (no errors)

### Still Not Working?

1. **Check Vercel Function Logs** (if using serverless functions)
2. **Check Supabase Logs** in Dashboard → Logs
3. **Compare local vs deployed** - what's different?
4. **Test with curl** - verify Supabase is reachable from outside
5. **Check firewall/security** - is anything blocking requests?

### Next Steps

If the connection test fails or times out, the issue is likely:
1. **CORS configuration** - Most common issue
2. **Network/firewall** - Less common but possible
3. **Supabase project status** - Check if paused/rate-limited

