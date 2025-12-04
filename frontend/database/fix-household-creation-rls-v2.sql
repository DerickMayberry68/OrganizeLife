-- =====================================================
-- Fix RLS Policy for Household Creation (Version 2)
-- =====================================================
-- This script creates a SECURITY DEFINER function to allow household creation
-- This bypasses RLS for the creation, ensuring it works even during registration

-- Step 1: Drop existing policy
DROP POLICY IF EXISTS "Users can create their own households" ON households;

-- Step 1.5: Drop existing function if it exists (required to change return type)
DROP FUNCTION IF EXISTS create_household(varchar, uuid);

-- Step 2: Create a SECURITY DEFINER function to create household
-- This function runs with the privileges of the function owner (postgres/supabase_admin)
-- and can bypass RLS to create the household
CREATE OR REPLACE FUNCTION create_household(
  p_name varchar(200),
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_household_id uuid;
  v_household jsonb;
BEGIN
  -- Verify the user_id matches the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID does not match authenticated user';
  END IF;

  -- Insert the household (bypasses RLS because we're SECURITY DEFINER)
  INSERT INTO households (name, created_by, updated_by)
  VALUES (p_name, p_user_id, p_user_id)
  RETURNING id INTO v_household_id;

  -- Also create the household_members entry
  INSERT INTO household_members (
    household_id,
    user_id,
    role,
    is_active,
    joined_at,
    created_by,
    updated_by
  )
  VALUES (
    v_household_id,
    p_user_id,
    'Admin',
    true,
    NOW(),
    p_user_id,
    p_user_id
  );

  -- Return the household data as JSONB to avoid RLS issues with SELECT
  -- Build JSONB directly from the inserted values to avoid SELECT query
  SELECT jsonb_build_object(
    'id', v_household_id,
    'name', p_name,
    'created_by', p_user_id,
    'updated_by', p_user_id,
    'created_at', NOW(),
    'updated_at', NOW(),
    'is_active', true
  ) INTO v_household;

  RETURN v_household;
END;
$$;

-- Step 3: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_household(varchar, uuid) TO authenticated;

-- Note: The function returns JSONB to avoid RLS issues when fetching the created household

-- Step 4: Also keep the direct INSERT policy for backwards compatibility
-- This should work if auth.uid() is properly set
CREATE POLICY "Users can create their own households"
  ON households
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
  );

-- Step 5: Add comments
COMMENT ON FUNCTION create_household(varchar, uuid) IS 
  'Creates a household and adds the creator as an Admin member. Bypasses RLS using SECURITY DEFINER. Use this function when direct INSERT fails due to RLS.';

COMMENT ON POLICY "Users can create their own households" ON households IS 
  'Allows authenticated users to create households where they are the creator. Requires auth.uid() to match created_by.';

