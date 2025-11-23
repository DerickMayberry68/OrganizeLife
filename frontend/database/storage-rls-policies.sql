-- =====================================================
-- Supabase Storage RLS Policies for household_documents
-- =====================================================
-- 
-- This file contains Row Level Security (RLS) policies
-- for the household_documents storage bucket.
--
-- Run this in the Supabase SQL Editor after creating
-- the household_documents bucket.
-- =====================================================

-- First, ensure the bucket exists (create it in the Supabase Dashboard if it doesn't)
-- Bucket name: household_documents
-- Public: false (private)

-- =====================================================
-- Policy 1: SELECT (Read Access)
-- =====================================================
-- Allows authenticated users to read files in their household's folder
CREATE POLICY "Users can read their household documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'household_documents' AND
  -- Extract the first folder (household_id) from the path
  (string_to_array(name, '/'))[1] IN (
    SELECT household_id::text
    FROM household_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- =====================================================
-- Policy 2: INSERT (Upload/Create Access)
-- =====================================================
-- Allows authenticated users to upload files and create folders
-- in their household's folder
CREATE POLICY "Users can upload to their household documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'household_documents' AND
  -- Extract the first folder (household_id) from the path
  (string_to_array(name, '/'))[1] IN (
    SELECT household_id::text
    FROM household_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- =====================================================
-- Policy 3: UPDATE (Modify Access)
-- =====================================================
-- Allows authenticated users to update files in their household's folder
CREATE POLICY "Users can update their household documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'household_documents' AND
  -- Extract the first folder (household_id) from the path
  (string_to_array(name, '/'))[1] IN (
    SELECT household_id::text
    FROM household_members
    WHERE user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  bucket_id = 'household_documents' AND
  -- Extract the first folder (household_id) from the path
  (string_to_array(name, '/'))[1] IN (
    SELECT household_id::text
    FROM household_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- =====================================================
-- Policy 4: DELETE (Delete Access)
-- =====================================================
-- Allows authenticated users to delete files in their household's folder
CREATE POLICY "Users can delete their household documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'household_documents' AND
  -- Extract the first folder (household_id) from the path
  (string_to_array(name, '/'))[1] IN (
    SELECT household_id::text
    FROM household_members
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- =====================================================
-- Notes:
-- =====================================================
-- 1. The policies check that the first folder segment matches
--    the user's household_id from the household_members table
--
-- 2. File paths are structured as: {householdId}/{categoryId}/{filename}
--    or {householdId}/{folderPath}/.keep for folders
--
-- 3. Only active household members can access files
--
-- 4. The bucket must be created in the Supabase Dashboard first:
--    - Go to Storage → New Bucket
--    - Name: household_documents
--    - Public: false (private)
--
-- =====================================================

