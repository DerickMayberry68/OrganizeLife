-- =====================================================
-- VERIFY ALERTS TABLE
-- Checks if the alerts table has all required columns,
-- indexes, and RLS policies
-- =====================================================

\echo '🔍 Checking alerts table structure...'
\echo ''

-- =====================================================
-- 1. CHECK IF TABLE EXISTS
-- =====================================================

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts' AND table_schema = 'public')
        THEN '✅ Table exists'
        ELSE '❌ Table does NOT exist'
    END as table_check;

\echo ''

-- =====================================================
-- 2. CHECK COLUMNS
-- =====================================================

\echo '📋 Checking required columns...'
\echo ''

WITH required_columns AS (
    SELECT unnest(ARRAY[
        'id', 'household_id', 'type', 'category', 'severity', 'priority',
        'title', 'message', 'description', 'related_entity_type', 
        'related_entity_id', 'related_entity_name', 'status', 'is_read',
        'is_dismissed', 'created_at', 'read_at', 'dismissed_at', 'expires_at',
        'action_url', 'action_label', 'is_recurring', 'recurrence_rule',
        'next_occurrence', 'updated_at', 'deleted_at'
    ]) as column_name
),
existing_columns AS (
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'alerts' AND table_schema = 'public'
)
SELECT 
    rc.column_name,
    CASE 
        WHEN ec.column_name IS NOT NULL THEN '✅'
        ELSE '❌ MISSING'
    END as status,
    c.data_type,
    c.is_nullable
FROM required_columns rc
LEFT JOIN existing_columns ec ON rc.column_name = ec.column_name
LEFT JOIN information_schema.columns c 
    ON c.column_name = rc.column_name 
    AND c.table_name = 'alerts' 
    AND c.table_schema = 'public'
ORDER BY 
    CASE WHEN ec.column_name IS NOT NULL THEN 0 ELSE 1 END,
    rc.column_name;

\echo ''

-- =====================================================
-- 3. CHECK INDEXES
-- =====================================================

\echo '📊 Checking indexes...'
\echo ''

WITH required_indexes AS (
    SELECT unnest(ARRAY[
        'idx_alerts_household_id',
        'idx_alerts_household_isread',
        'idx_alerts_household_category',
        'idx_alerts_household_severity',
        'idx_alerts_household_status',
        'idx_alerts_created_at',
        'idx_alerts_related_entity'
    ]) as index_name
),
existing_indexes AS (
    SELECT indexname as index_name
    FROM pg_indexes
    WHERE tablename = 'alerts' AND schemaname = 'public'
)
SELECT 
    ri.index_name,
    CASE 
        WHEN ei.index_name IS NOT NULL THEN '✅'
        ELSE '⚠️  MISSING (recommended for performance)'
    END as status
FROM required_indexes ri
LEFT JOIN existing_indexes ei ON ri.index_name = ei.index_name
ORDER BY 
    CASE WHEN ei.index_name IS NOT NULL THEN 0 ELSE 1 END,
    ri.index_name;

\echo ''

-- =====================================================
-- 4. CHECK ROW LEVEL SECURITY
-- =====================================================

\echo '🔒 Checking Row Level Security...'
\echo ''

-- Check if RLS is enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '⚠️  RLS Disabled (may affect security)'
    END as rls_status
FROM pg_tables
WHERE tablename = 'alerts' AND schemaname = 'public';

\echo ''

-- Check RLS policies
WITH required_policies AS (
    SELECT unnest(ARRAY[
        'alerts_select_policy',
        'alerts_insert_policy',
        'alerts_update_policy',
        'alerts_delete_policy'
    ]) as policy_name
),
existing_policies AS (
    SELECT policyname as policy_name
    FROM pg_policies
    WHERE tablename = 'alerts' AND schemaname = 'public'
)
SELECT 
    rp.policy_name,
    CASE 
        WHEN ep.policy_name IS NOT NULL THEN '✅'
        ELSE '⚠️  MISSING (may affect security)'
    END as status
FROM required_policies rp
LEFT JOIN existing_policies ep ON rp.policy_name = ep.policy_name
ORDER BY 
    CASE WHEN ep.policy_name IS NOT NULL THEN 0 ELSE 1 END,
    rp.policy_name;

\echo ''

-- =====================================================
-- 5. CHECK FOREIGN KEY
-- =====================================================

\echo '🔗 Checking foreign key constraints...'
\echo ''

SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'alerts'
    AND tc.table_schema = 'public';

\echo ''

-- =====================================================
-- 6. SAMPLE DATA CHECK
-- =====================================================

\echo '📈 Checking sample data...'
\echo ''

SELECT 
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_alerts,
    COUNT(CASE WHEN is_read = false AND deleted_at IS NULL THEN 1 END) as unread_alerts,
    COUNT(CASE WHEN severity = 'Critical' AND deleted_at IS NULL THEN 1 END) as critical_alerts
FROM alerts;

\echo ''

-- =====================================================
-- SUMMARY
-- =====================================================

\echo '📊 SUMMARY'
\echo '=========='
\echo ''
\echo 'If you see any ❌ MISSING items above, you may need to:'
\echo '  1. Add missing columns (required for system to work)'
\echo '  2. Add missing indexes (recommended for performance)'
\echo '  3. Enable RLS and add policies (recommended for security)'
\echo ''
\echo 'If everything shows ✅, your table is ready to use!'
\echo ''

-- =====================================================
-- END
-- =====================================================

