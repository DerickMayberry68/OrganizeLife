# Vercel Environment Variables Setup

This document explains how to configure Supabase environment variables in Vercel for the Angular application.

## Environment Variables Required

The application expects the following environment variables to be set in Vercel:

### Required Variables

1. **`SUPABASE_URL`** (or `NEXT_PUBLIC_SUPABASE_URL`)
   - Your Supabase project URL
   - Example: `https://cwvkrkiejntyexfxzxpx.supabase.co`

2. **`SUPABASE_ANON_KEY`** (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Your Supabase anonymous/public key
   - This is safe to expose in client-side code (it's public by design)

### Optional Variables

3. **`SYNCFUSION_LICENSE_KEY`** (optional)
   - Your Syncfusion license key
   - Only needed if you want to use a different license key in production

## How It Works

1. **Build-Time Injection**: The `scripts/inject-env.js` script runs before each build (`prebuild` hook)
2. **Environment Variable Reading**: The script reads environment variables from `process.env` (provided by Vercel)
3. **File Generation**: The script generates `src/app/config/environment.prod.ts` with the injected values
4. **Angular Build**: Angular uses the generated environment file during the production build

## Setting Up in Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
   | `SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |
   | `SYNCFUSION_LICENSE_KEY` | `your-license-key` | Production, Preview (optional) |

4. Click **Save** for each variable

### Option 2: Via Vercel CLI

```bash
# Set Supabase URL
vercel env add SUPABASE_URL production

# Set Supabase Anon Key
vercel env add SUPABASE_ANON_KEY production

# Set Syncfusion License Key (optional)
vercel env add SYNCFUSION_LICENSE_KEY production
```

### Option 3: Via Vercel Integration

If you've set up the Supabase integration in Vercel, the variables may be automatically added with different names:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The script checks for these alternative names as well.

## Variable Name Priority

The injection script checks for environment variables in this order:

1. `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` → `VERCEL_SUPABASE_URL`
2. `SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `VERCEL_SUPABASE_ANON_KEY`
3. `SYNCFUSION_LICENSE_KEY`

If none are found, it falls back to the default values (for local development).

## Local Development

For local development, you can:

1. **Use the defaults**: The environment files have fallback values for local development
2. **Create a `.env.local` file** (not committed to git):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
3. **Run the injection script manually**:
   ```bash
   node scripts/inject-env.js
   ```

## Verifying Configuration

After setting up environment variables in Vercel:

1. **Check Vercel Build Logs**: Look for the injection script output:
   ```
   🔧 Injecting environment variables...
      SUPABASE_URL: https://your-project.supabase.co...
      SUPABASE_ANON_KEY: SET
      SYNCFUSION_LICENSE_KEY: SET
   ✅ Updated: src/app/config/environment.prod.ts
   ✅ Environment variables injected successfully!
   ```

2. **Check the Generated File**: The `environment.prod.ts` file should contain your Vercel environment variables after build

3. **Test the Application**: Verify that Supabase connections work in production

## Troubleshooting

### Variables Not Being Injected

- **Check Vercel Dashboard**: Ensure variables are set for the correct environment (Production/Preview/Development)
- **Check Variable Names**: Ensure they match exactly (case-sensitive)
- **Check Build Logs**: Look for errors in the `prebuild` script execution

### Using Different Variable Names

If Vercel uses different variable names (e.g., from an integration), you can:
1. Update `scripts/inject-env.js` to check for your specific variable names
2. Or create aliases in Vercel that match the expected names

### Local Development Issues

If local development fails:
- Check that fallback values in `environment.ts` are correct
- Or create a `.env.local` file with your local Supabase credentials

## Security Notes

- **Supabase Anon Key**: This is safe to expose in client-side code. It's designed to be public.
- **Supabase Service Key**: Never expose this in client-side code. It's not used in this application.
- **Syncfusion License Key**: This is also safe to expose, but you may want to keep it private.

## Related Files

- `scripts/inject-env.js` - Environment variable injection script
- `src/app/config/environment.ts` - Development environment (with fallbacks)
- `src/app/config/environment.prod.ts` - Production environment (auto-generated)
- `package.json` - Contains the `prebuild` script hook

