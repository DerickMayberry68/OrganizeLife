-- =====================================================
-- Fix RLS Policy for Household Creation
-- =====================================================
-- This script creates a SECURITY DEFINER function to allow household creation
-- during registration when the user might not have any existing household memberships

-- Drop existing policy
DROP POLICY IF EXISTS "Users can create their own households" ON households;

-- Create a SECURITY DEFINER function to check if user can create household
-- This bypasses RLS for the check, allowing new users to create their first household
CREATE OR REPLACE FUNCTION can_create_household(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Allow if the user_id matches the authenticated user
  SELECT p_user_id = auth.uid();
$$;

-- Create the INSERT policy using the function
CREATE POLICY "Users can create their own households"
  ON households
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND can_create_household(created_by)
  );

-- Add comment
COMMENT ON POLICY "Users can create their own households" ON households IS 
  'Allows authenticated users to create households where they are the creator. Uses SECURITY DEFINER function to bypass RLS for the check.';

