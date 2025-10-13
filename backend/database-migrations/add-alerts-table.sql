-- =====================================================
-- ALERTS TABLE MIGRATION
-- The Butler - Centralized Notification System
-- =====================================================

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL,
    
    -- Classification
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 4),
    
    -- Content
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    description VARCHAR(2000),
    
    -- Related Entity (for deep linking)
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    related_entity_name VARCHAR(200),
    
    -- Status & Timing
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Action (optional deep link)
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    
    -- Recurrence (for repeating alerts)
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_rule VARCHAR(100),
    next_occurrence TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign Keys
    CONSTRAINT fk_alerts_household FOREIGN KEY (household_id) 
        REFERENCES public.households(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- Primary household queries
CREATE INDEX IF NOT EXISTS idx_alerts_household_id 
    ON public.alerts(household_id) 
    WHERE deleted_at IS NULL;

-- Unread alerts (most common query)
CREATE INDEX IF NOT EXISTS idx_alerts_household_isread 
    ON public.alerts(household_id, is_read) 
    WHERE deleted_at IS NULL;

-- Filter by category
CREATE INDEX IF NOT EXISTS idx_alerts_household_category 
    ON public.alerts(household_id, category) 
    WHERE deleted_at IS NULL;

-- Filter by severity
CREATE INDEX IF NOT EXISTS idx_alerts_household_severity 
    ON public.alerts(household_id, severity) 
    WHERE deleted_at IS NULL;

-- Filter by status
CREATE INDEX IF NOT EXISTS idx_alerts_household_status 
    ON public.alerts(household_id, status) 
    WHERE deleted_at IS NULL;

-- Sort by creation date
CREATE INDEX IF NOT EXISTS idx_alerts_created_at 
    ON public.alerts(created_at DESC) 
    WHERE deleted_at IS NULL;

-- Related entity lookup
CREATE INDEX IF NOT EXISTS idx_alerts_related_entity 
    ON public.alerts(household_id, related_entity_type, related_entity_id) 
    WHERE deleted_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see alerts for households they belong to
CREATE POLICY alerts_select_policy ON public.alerts
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id 
            FROM public.household_members 
            WHERE user_id = auth.uid() 
            AND is_active = true
            AND deleted_at IS NULL
        )
    );

-- Policy: Users can insert alerts for households they belong to
CREATE POLICY alerts_insert_policy ON public.alerts
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM public.household_members 
            WHERE user_id = auth.uid() 
            AND is_active = true
            AND deleted_at IS NULL
        )
    );

-- Policy: Users can update alerts for households they belong to
CREATE POLICY alerts_update_policy ON public.alerts
    FOR UPDATE
    USING (
        household_id IN (
            SELECT household_id 
            FROM public.household_members 
            WHERE user_id = auth.uid() 
            AND is_active = true
            AND deleted_at IS NULL
        )
    );

-- Policy: Users can soft-delete alerts for households they belong to
CREATE POLICY alerts_delete_policy ON public.alerts
    FOR DELETE
    USING (
        household_id IN (
            SELECT household_id 
            FROM public.household_members 
            WHERE user_id = auth.uid() 
            AND is_active = true
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- COMMENTS for documentation
-- =====================================================

COMMENT ON TABLE public.alerts IS 'Centralized notification hub for The Butler application';
COMMENT ON COLUMN public.alerts.type IS 'Alert type: Reminder, Warning, Error, Info, Success';
COMMENT ON COLUMN public.alerts.category IS 'Alert category: Bills, Maintenance, Healthcare, Insurance, Documents, Inventory, Budget, Financial, System';
COMMENT ON COLUMN public.alerts.severity IS 'Alert severity: Low, Medium, High, Critical';
COMMENT ON COLUMN public.alerts.priority IS 'Alert priority: 1=Low, 2=Medium, 3=High, 4=Urgent';
COMMENT ON COLUMN public.alerts.related_entity_type IS 'Type of related entity (Bill, Maintenance, Appointment, etc.)';
COMMENT ON COLUMN public.alerts.related_entity_id IS 'ID of related entity for deep linking';
COMMENT ON COLUMN public.alerts.action_url IS 'Deep link URL for action button (e.g., /bills?id=123)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table was created
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = 'alerts') as column_count
FROM information_schema.tables 
WHERE table_name = 'alerts' AND table_schema = 'public';

-- Check indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'alerts' 
ORDER BY indexname;

-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'alerts';

-- Check policies were created
SELECT 
    policyname,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'alerts'
ORDER BY policyname;

-- =====================================================
-- SUCCESS!
-- =====================================================
SELECT 'Alerts table migration completed successfully!' as status;

