-- =====================================================
-- CREATE TEST DATA FOR ALERTS SYSTEM
-- This script creates sample data to trigger various alerts
-- =====================================================

-- NOTE: Replace these variables with your actual IDs from your database
-- Run these queries first to get your IDs:
--   SELECT id FROM households LIMIT 1;
--   SELECT id FROM household_members LIMIT 1;
--   SELECT user_id FROM household_members LIMIT 1;

-- For this example, we'll use placeholders - REPLACE THEM!
DO $$
DECLARE
    v_household_id UUID;
    v_user_id UUID;
    v_member_id UUID;
    v_category_id UUID;
BEGIN
    -- Get the first household and user (CUSTOMIZE THIS!)
    SELECT id INTO v_household_id FROM households WHERE is_active = true LIMIT 1;
    SELECT user_id INTO v_user_id FROM household_members WHERE household_id = v_household_id LIMIT 1;
    SELECT id INTO v_member_id FROM household_members WHERE household_id = v_household_id LIMIT 1;
    
    -- Get or create a "Utilities" category
    SELECT id INTO v_category_id FROM categories WHERE name = 'Utilities' LIMIT 1;
    IF v_category_id IS NULL THEN
        INSERT INTO categories (id, household_id, name, type, icon, color, is_active, created_at, created_by, updated_at, updated_by)
        VALUES (gen_random_uuid(), v_household_id, 'Utilities', 'Expense', '💡', '#4CAF50', true, NOW(), v_user_id, NOW(), v_user_id)
        RETURNING id INTO v_category_id;
    END IF;

    RAISE NOTICE 'Using Household ID: %', v_household_id;
    RAISE NOTICE 'Using User ID: %', v_user_id;
    RAISE NOTICE 'Using Member ID: %', v_member_id;

    -- =====================================================
    -- 1. BILLS - Create bills at different stages
    -- =====================================================
    
    RAISE NOTICE 'Creating test bills...';
    
    -- Bill due in 7 days (should trigger "Bill Due Soon" alert)
    INSERT INTO bills (
        id, household_id, category_id, name, amount, due_date, status,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'Electric Bill', 127.50, CURRENT_DATE + INTERVAL '7 days', 'Pending',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- Bill due in 3 days (should trigger "Bill Due This Week" alert)
    INSERT INTO bills (
        id, household_id, category_id, name, amount, due_date, status,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'Water Bill', 45.00, CURRENT_DATE + INTERVAL '3 days', 'Pending',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- Bill due today (should trigger "Bill Due Today" alert)
    INSERT INTO bills (
        id, household_id, category_id, name, amount, due_date, status,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'Internet Bill', 89.99, CURRENT_DATE, 'Pending',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- Overdue bill (should trigger "Bill Overdue" alert)
    INSERT INTO bills (
        id, household_id, category_id, name, amount, due_date, status,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'Gas Bill', 62.30, CURRENT_DATE - INTERVAL '2 days', 'Pending',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- =====================================================
    -- 2. MAINTENANCE TASKS
    -- =====================================================
    
    RAISE NOTICE 'Creating test maintenance tasks...';
    
    -- Task due in 7 days
    INSERT INTO maintenance_tasks (
        id, household_id, category_id, title, description, status, due_date,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'HVAC Filter Replacement', 'Replace air filters in main HVAC unit', 'Pending', CURRENT_DATE + INTERVAL '7 days',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- Task due in 3 days
    INSERT INTO maintenance_tasks (
        id, household_id, category_id, title, description, status, due_date,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'Gutter Cleaning', 'Clean gutters before rainy season', 'Pending', CURRENT_DATE + INTERVAL '3 days',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- Overdue task
    INSERT INTO maintenance_tasks (
        id, household_id, category_id, title, description, status, due_date,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(), v_household_id, v_category_id,
        'Smoke Detector Battery', 'Replace batteries in all smoke detectors', 'Pending', CURRENT_DATE - INTERVAL '3 days',
        NOW(), v_user_id, NOW(), v_user_id
    );

    -- =====================================================
    -- 3. HEALTHCARE APPOINTMENTS (if table exists)
    -- =====================================================
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        RAISE NOTICE 'Creating test healthcare appointments...';
        
        -- Appointment in 7 days
        INSERT INTO appointments (
            id, household_id, household_member_id, appointment_date, appointment_time,
            appointment_type, provider_name, status,
            created_at, created_by, updated_at, updated_by
        ) VALUES (
            gen_random_uuid(), v_household_id, v_member_id,
            CURRENT_DATE + INTERVAL '7 days', '10:00:00'::time,
            'Annual Checkup', 'Dr. Smith', 'Scheduled',
            NOW(), v_user_id, NOW(), v_user_id
        );

        -- Appointment in 3 days
        INSERT INTO appointments (
            id, household_id, household_member_id, appointment_date, appointment_time,
            appointment_type, provider_name, status,
            created_at, created_by, updated_at, updated_by
        ) VALUES (
            gen_random_uuid(), v_household_id, v_member_id,
            CURRENT_DATE + INTERVAL '3 days', '14:30:00'::time,
            'Dental Cleaning', 'Dr. Johnson', 'Scheduled',
            NOW(), v_user_id, NOW(), v_user_id
        );

        -- Appointment tomorrow
        INSERT INTO appointments (
            id, household_id, household_member_id, appointment_date, appointment_time,
            appointment_type, provider_name, status,
            created_at, created_by, updated_at, updated_by
        ) VALUES (
            gen_random_uuid(), v_household_id, v_member_id,
            CURRENT_DATE + INTERVAL '1 day', '09:00:00'::time,
            'Eye Exam', 'Dr. Williams', 'Scheduled',
            NOW(), v_user_id, NOW(), v_user_id
        );
    END IF;

    -- =====================================================
    -- 4. DOCUMENTS (if table exists)
    -- =====================================================
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        RAISE NOTICE 'Creating test documents...';
        
        -- Document expiring in 30 days
        INSERT INTO documents (
            id, household_id, category_id, title, description,
            file_name, file_path, file_type, file_size_bytes, upload_date, expiry_date,
            created_at, created_by, updated_at, updated_by
        ) VALUES (
            gen_random_uuid(), v_household_id, v_category_id,
            'Passport - John Doe', 'Primary passport',
            'passport.pdf', '/documents/passport.pdf', 'application/pdf', 1024000,
            CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
            NOW(), v_user_id, NOW(), v_user_id
        );

        -- Document expiring in 7 days
        INSERT INTO documents (
            id, household_id, category_id, title, description,
            file_name, file_path, file_type, file_size_bytes, upload_date, expiry_date,
            created_at, created_by, updated_at, updated_by
        ) VALUES (
            gen_random_uuid(), v_household_id, v_category_id,
            'Driver License', 'State drivers license',
            'license.pdf', '/documents/license.pdf', 'application/pdf', 512000,
            CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days',
            NOW(), v_user_id, NOW(), v_user_id
        );
    END IF;

    RAISE NOTICE '✅ Test data created successfully!';
    RAISE NOTICE 'Now run: POST /api/Alerts/generate/all/%', v_household_id;
    
END $$;

-- =====================================================
-- VERIFY TEST DATA WAS CREATED
-- =====================================================

SELECT '=== TEST DATA SUMMARY ===' as section;

SELECT 
    'Bills' as entity_type,
    COUNT(*) as count,
    COUNT(CASE WHEN due_date >= CURRENT_DATE THEN 1 END) as upcoming,
    COUNT(CASE WHEN due_date < CURRENT_DATE AND status = 'Pending' THEN 1 END) as overdue
FROM bills
WHERE created_at > NOW() - INTERVAL '1 minute';

SELECT 
    'Maintenance Tasks' as entity_type,
    COUNT(*) as count,
    COUNT(CASE WHEN due_date >= CURRENT_DATE THEN 1 END) as upcoming,
    COUNT(CASE WHEN due_date < CURRENT_DATE THEN 1 END) as overdue
FROM maintenance_tasks
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Show upcoming bills
SELECT '=== UPCOMING/OVERDUE BILLS ===' as section;
SELECT name, amount, due_date, 
    CASE 
        WHEN due_date < CURRENT_DATE THEN '❌ OVERDUE'
        WHEN due_date = CURRENT_DATE THEN '⚠️  DUE TODAY'
        WHEN due_date <= CURRENT_DATE + INTERVAL '3 days' THEN '⚠️  DUE SOON'
        ELSE '📅 UPCOMING'
    END as status_indicator
FROM bills
WHERE status = 'Pending'
ORDER BY due_date;

-- =====================================================
-- NEXT STEPS
-- =====================================================

SELECT '=== NEXT STEPS ===' as section;
SELECT 'Now trigger alert generation manually or wait for the background service!' as instruction
UNION ALL
SELECT 'Use Swagger: POST /api/Alerts/generate/all/{householdId}'
UNION ALL
SELECT 'Or wait up to 60 minutes for automatic generation'
UNION ALL
SELECT 'Then check: GET /api/Alerts/household/{householdId}';

