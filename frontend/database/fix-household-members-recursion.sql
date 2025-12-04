-- =====================================================
-- FIX INFINITE RECURSION IN HOUSEHOLD_MEMBERS POLICIES
-- =====================================================
-- Run this script to fix the infinite recursion error
-- This creates a security definer function to check membership
-- without triggering RLS recursion

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON household_members;
DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;

-- Create a security definer function to check household membership
-- This function bypasses RLS, so it can check membership without recursion
CREATE OR REPLACE FUNCTION check_household_membership(p_household_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM household_members hm
    WHERE hm.household_id = p_household_id
      AND hm.user_id = p_user_id
      AND hm.is_active = true
  );
$$;

-- Create a function to check if user is admin of household
CREATE OR REPLACE FUNCTION check_household_admin(p_household_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM household_members hm
    WHERE hm.household_id = p_household_id
      AND hm.user_id = p_user_id
      AND hm.role = 'Admin'
      AND hm.is_active = true
  );
$$;

-- Policy: Users can view household members
-- This allows users to see:
-- 1. Their own membership record
-- 2. Other members of households where they have an active membership
CREATE POLICY "Users can view household members"
  ON household_members
  FOR SELECT
  USING (
    -- Allow if viewing own record
    auth.uid() = user_id
    OR
    -- Allow if user is a member of this household (using function to avoid recursion)
    check_household_membership(household_id, auth.uid())
  );

-- Policy: Admins can manage household members
CREATE POLICY "Admins can manage household members"
  ON household_members
  FOR ALL
  USING (
    -- Use the function to check if user is admin
    check_household_admin(household_id, auth.uid())
  );

-- Also update the households SELECT policy to use the function
DROP POLICY IF EXISTS "Users can view their household memberships" ON households;

CREATE POLICY "Users can view their household memberships"
  ON households
  FOR SELECT
  USING (
    check_household_membership(id, auth.uid())
  );

