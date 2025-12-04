-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- =====================================================
-- Run this script BEFORE running rls-policies.sql
-- This enables RLS on all tables in one go
--
-- Note: After enabling RLS, you MUST create policies or all access will be blocked
-- Run rls-policies.sql immediately after this script

-- =====================================================
-- CORE TABLES
-- =====================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FINANCIAL TABLES
-- =====================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MAINTENANCE TABLES
-- =====================================================
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DOCUMENT TABLES
-- =====================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INVENTORY TABLES
-- =====================================================
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSURANCE TABLES
-- =====================================================
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_beneficiaries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HEALTHCARE TABLES
-- =====================================================
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SYSTEM TABLES
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- LOOKUP/REFERENCE TABLES
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_types ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this query to verify RLS is enabled on all tables:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. After enabling RLS, ALL access is blocked until policies are created
-- 2. Run rls-policies.sql immediately after this script
-- 3. Test thoroughly in a development environment first
-- 4. Keep a backup of your data before enabling RLS in production
-- 5. If you need to disable RLS temporarily, use:
--    ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

