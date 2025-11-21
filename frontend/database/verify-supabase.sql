-- =====================================================
-- Supabase Database Verification Script
-- Run this in Supabase SQL Editor to verify your database setup
-- =====================================================

-- Check if tables exist
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 30 THEN '✅ PASS - Tables exist'
        WHEN COUNT(*) > 0 THEN '⚠️ WARNING - Some tables missing'
        ELSE '❌ FAIL - No tables found'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%';

-- List all application tables
SELECT 
    'Table List' as check_type,
    tablename,
    CASE 
        WHEN tablename IN ('households', 'household_members', 'categories', 'frequencies') THEN '✅ Core'
        ELSE '📋 App'
    END as type
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_prisma%'
ORDER BY 
    CASE 
        WHEN tablename IN ('households', 'household_members') THEN 1
        WHEN tablename = 'categories' THEN 2
        ELSE 3
    END,
    tablename;

-- Check if critical tables exist
SELECT 
    'Critical Tables' as check_type,
    tablename,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES 
    ('households'),
    ('household_members'),
    ('categories'),
    ('frequencies')
) AS required_tables(tablename)
LEFT JOIN pg_tables pt ON pt.tablename = required_tables.tablename 
    AND pt.schemaname = 'public';

-- Check if categories table has data
SELECT 
    'Seed Data' as check_type,
    COUNT(*) as category_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '⚠️ EMPTY - Run seed-data.sql'
    END as status
FROM categories
WHERE EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'categories'
);

-- Check for household_members table and data
SELECT 
    'Household Members' as check_type,
    COUNT(*) as member_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS MEMBERS'
        ELSE '⚠️ EMPTY - No household members yet (normal for new users)'
    END as status
FROM household_members
WHERE EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'household_members'
);

-- Quick summary
SELECT 
    'SUMMARY' as check_type,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%') as total_tables,
    (SELECT COUNT(*) FROM categories WHERE EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories')) as categories_with_data,
    (SELECT COUNT(*) FROM household_members WHERE EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'household_members')) as household_members_count;

