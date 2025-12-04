-- =====================================================
-- Fix RLS Policy for Household Creation
-- =====================================================
-- This script ensures users can create households during registration
-- The issue: The policy might be too restrictive or there's a timing issue

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create their own households" ON households;

-- Recreate the policy with explicit check
-- This allows any authenticated user to create a household where they are the creator
CREATE POLICY "Users can create their own households"
  ON households
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
  );

-- Also ensure the policy allows creation even if user has no existing households
-- (This is the default behavior, but making it explicit)
COMMENT ON POLICY "Users can create their own households" ON households IS 
  'Allows authenticated users to create households where they are the creator. Used during registration.';

