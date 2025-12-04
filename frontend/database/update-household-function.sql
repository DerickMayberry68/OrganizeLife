-- =====================================================
-- Update create_household function to return JSONB
-- =====================================================
-- Run this after running fix-household-creation-rls-v2.sql
-- This updates the function to return full household data instead of just ID

-- Step 1: Drop the existing function (required to change return type)
DROP FUNCTION IF EXISTS create_household(varchar, uuid);

-- Step 2: Create the function with JSONB return type
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

-- Step 3: Grant execute permission (in case it was dropped)
GRANT EXECUTE ON FUNCTION create_household(varchar, uuid) TO authenticated;

