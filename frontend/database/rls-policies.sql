-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- These policies enable secure access control for Supabase Auth
-- Run this AFTER creating your schema and enabling RLS
-- 
-- IMPORTANT: Test these policies thoroughly before deploying to production

-- =====================================================
-- HOUSEHOLDS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own households
CREATE POLICY "Users can create their own households"
  ON households
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can view households they are members of
-- Note: This policy queries household_members, but since household_members policies
-- allow users to see their own records, this should work without recursion
CREATE POLICY "Users can view their household memberships"
  ON households
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM household_members hm
      WHERE hm.household_id = households.id
        AND hm.user_id = auth.uid()
        AND hm.is_active = true
    )
  );

-- Policy: Users can update households they created or are admin of
CREATE POLICY "Admins can update their households"
  ON households
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() 
        AND role = 'Admin' 
        AND is_active = true
    )
  );

-- =====================================================
-- HOUSEHOLD_MEMBERS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can add themselves to households (during registration)
CREATE POLICY "Users can add themselves as members"
  ON household_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view household members
-- This policy allows users to see:
-- 1. Their own membership record (user_id = auth.uid())
-- 2. Other members of households where they have an active membership
-- Note: We use a security definer function to avoid infinite recursion
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
    -- Use the function to check membership and role
    EXISTS (
      SELECT 1 
      FROM household_members hm
      WHERE hm.household_id = household_members.household_id
        AND hm.user_id = auth.uid() 
        AND hm.role = 'Admin' 
        AND hm.is_active = true
    )
  );

-- =====================================================
-- HOUSEHOLD_SETTINGS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE household_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view settings
CREATE POLICY "Household members can view settings"
  ON household_settings
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy: Admins can manage settings
CREATE POLICY "Admins can manage household settings"
  ON household_settings
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() 
        AND role = 'Admin' 
        AND is_active = true
    )
  );

-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage accounts
CREATE POLICY "Household members can manage accounts"
  ON accounts
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage transactions
CREATE POLICY "Household members can manage transactions"
  ON transactions
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- BILLS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage bills
CREATE POLICY "Household members can manage bills"
  ON bills
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- PAYMENT_HISTORY TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view payment history for their bills
CREATE POLICY "Household members can view payment history"
  ON payment_history
  FOR SELECT
  USING (
    bill_id IN (
      SELECT b.id 
      FROM bills b
      INNER JOIN household_members hm ON b.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- Policy: Household members can create payment history
CREATE POLICY "Household members can create payment history"
  ON payment_history
  FOR INSERT
  WITH CHECK (
    bill_id IN (
      SELECT b.id 
      FROM bills b
      INNER JOIN household_members hm ON b.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- =====================================================
-- MAINTENANCE_TASKS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage maintenance tasks
CREATE POLICY "Household members can manage maintenance tasks"
  ON maintenance_tasks
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- SERVICE_PROVIDERS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view service providers (shared resource)
-- Note: This table doesn't have household_id, so it's shared across all users
CREATE POLICY "Authenticated users can view service providers"
  ON service_providers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can create service providers
CREATE POLICY "Authenticated users can create service providers"
  ON service_providers
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update service providers they created
CREATE POLICY "Users can update their service providers"
  ON service_providers
  FOR UPDATE
  USING (auth.uid() = created_by);

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage documents
CREATE POLICY "Household members can manage documents"
  ON documents
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- DOCUMENT_TAGS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage document tags
CREATE POLICY "Household members can manage document tags"
  ON document_tags
  FOR ALL
  USING (
    document_id IN (
      SELECT d.id 
      FROM documents d
      INNER JOIN household_members hm ON d.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- =====================================================
-- BUDGETS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage budgets
CREATE POLICY "Household members can manage budgets"
  ON budgets
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- BUDGET_PERIODS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view budget periods
CREATE POLICY "Household members can view budget periods"
  ON budget_periods
  FOR SELECT
  USING (
    budget_id IN (
      SELECT b.id 
      FROM budgets b
      INNER JOIN household_members hm ON b.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- =====================================================
-- FINANCIAL_GOALS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage financial goals
CREATE POLICY "Household members can manage financial goals"
  ON financial_goals
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage subscriptions
CREATE POLICY "Household members can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- INVENTORY_ITEMS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage inventory items
CREATE POLICY "Household members can manage inventory items"
  ON inventory_items
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- WARRANTIES TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view warranties for their inventory items
CREATE POLICY "Household members can view warranties"
  ON warranties
  FOR SELECT
  USING (
    inventory_item_id IN (
      SELECT i.id 
      FROM inventory_items i
      INNER JOIN household_members hm ON i.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- Policy: Household members can manage warranties
CREATE POLICY "Household members can manage warranties"
  ON warranties
  FOR ALL
  USING (
    inventory_item_id IN (
      SELECT i.id 
      FROM inventory_items i
      INNER JOIN household_members hm ON i.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- =====================================================
-- ITEM_MAINTENANCE_SCHEDULES TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE item_maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage maintenance schedules
CREATE POLICY "Household members can manage maintenance schedules"
  ON item_maintenance_schedules
  FOR ALL
  USING (
    inventory_item_id IN (
      SELECT i.id 
      FROM inventory_items i
      INNER JOIN household_members hm ON i.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- =====================================================
-- INSURANCE_POLICIES TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage insurance policies
CREATE POLICY "Household members can manage insurance policies"
  ON insurance_policies
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- INSURANCE_BENEFICIARIES TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE insurance_beneficiaries ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view beneficiaries for their policies
CREATE POLICY "Household members can view beneficiaries"
  ON insurance_beneficiaries
  FOR SELECT
  USING (
    insurance_policy_id IN (
      SELECT ip.id 
      FROM insurance_policies ip
      INNER JOIN household_members hm ON ip.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- Policy: Household members can manage beneficiaries
CREATE POLICY "Household members can manage beneficiaries"
  ON insurance_beneficiaries
  FOR ALL
  USING (
    insurance_policy_id IN (
      SELECT ip.id 
      FROM insurance_policies ip
      INNER JOIN household_members hm ON ip.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- =====================================================
-- HEALTHCARE TABLES
-- =====================================================

-- HEALTHCARE_PROVIDERS
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage healthcare providers"
  ON healthcare_providers
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- APPOINTMENTS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage appointments"
  ON appointments
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- MEDICATIONS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage medications"
  ON medications
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- MEDICATION_SCHEDULES
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage medication schedules"
  ON medication_schedules
  FOR ALL
  USING (
    medication_id IN (
      SELECT m.id 
      FROM medications m
      INNER JOIN household_members hm ON m.household_id = hm.household_id
      WHERE hm.user_id = auth.uid() AND hm.is_active = true
    )
  );

-- MEDICAL_RECORDS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage medical records"
  ON medical_records
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- HEALTH_METRICS
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage health metrics"
  ON health_metrics
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ALLERGIES
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage allergies"
  ON allergies
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- VACCINATIONS
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage vaccinations"
  ON vaccinations
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can create notifications (handled by backend/triggers)
-- Note: You may need to use service_role for creating notifications

-- =====================================================
-- ALERTS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can view alerts for their households
CREATE POLICY "Household members can view alerts"
  ON alerts
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy: Household members can update alerts (mark as read, dismiss)
CREATE POLICY "Household members can update alerts"
  ON alerts
  FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- REMINDERS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Household members can manage reminders
CREATE POLICY "Household members can manage reminders"
  ON reminders
  FOR ALL
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- ACTIVITY_LOGS TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity logs
CREATE POLICY "Users can view their activity logs"
  ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Household members can view household activity logs
CREATE POLICY "Household members can view household activity logs"
  ON activity_logs
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =====================================================
-- LOOKUP/REFERENCE TABLES (Public Read)
-- =====================================================
-- These tables don't have household_id and are shared reference data

-- CATEGORIES (shared across all users)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories"
  ON categories
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- FREQUENCIES (shared across all users)
ALTER TABLE frequencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view frequencies"
  ON frequencies
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- PRIORITIES (shared across all users)
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view priorities"
  ON priorities
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSURANCE_TYPES (shared across all users)
ALTER TABLE insurance_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view insurance types"
  ON insurance_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- NOTES
-- =====================================================
-- 1. These policies assume users are authenticated (auth.uid() is not null)
-- 2. During registration with email confirmation, household creation is deferred
--    until after email confirmation (when user has a session)
-- 3. Lookup tables (categories, frequencies, priorities, insurance_types) are 
--    readable by all authenticated users but you may want to restrict writes
-- 4. Service providers table doesn't have household_id - it's shared across users
-- 5. Test these policies thoroughly before deploying to production
-- 6. Consider adding policies for service_role operations if you have backend functions
-- 7. You may need to adjust policies based on your specific business rules
