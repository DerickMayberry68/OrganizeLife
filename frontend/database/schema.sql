-- =====================================================
-- TheButler Database Schema for PostgreSQL
-- Normalized to 3NF with Supabase Auth Integration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LOOKUP TABLES (Reference Data)
-- =====================================================

-- Categories for bills, transactions, maintenance, documents, etc.
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'bill', 'transaction', 'maintenance', 'document', 'subscription'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, type)
);

-- Frequencies for recurring items
CREATE TABLE frequencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'weekly', 'monthly', 'quarterly', 'semi-annual', 'yearly'
    interval_days INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Priorities
CREATE TABLE priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'low', 'medium', 'high', 'urgent'
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insurance Types
CREATE TABLE insurance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'home', 'auto', 'health', 'life', 'disability', 'umbrella', 'other'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CORE: HOUSEHOLDS & USERS
-- =====================================================

-- Households (main organizational unit)
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL, -- References auth.users.id (Supabase Auth)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Household Members (links Supabase Auth users to households)
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth user
    role VARCHAR(50) NOT NULL DEFAULT 'Member', -- 'Admin', 'Member'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    UNIQUE(household_id, user_id)
);

-- Household Settings & Preferences
CREATE TABLE household_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(50) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    UNIQUE(household_id, setting_key)
);

-- =====================================================
-- FINANCIAL: ACCOUNTS
-- =====================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'credit', 'investment'
    institution VARCHAR(200) NOT NULL,
    account_number_last4 VARCHAR(4), -- Last 4 digits for security
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    plaid_account_id VARCHAR(255), -- For future bank integration
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- FINANCIAL: TRANSACTIONS
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'income', 'expense'
    merchant_name VARCHAR(200),
    notes TEXT,
    plaid_transaction_id VARCHAR(255), -- For bank import tracking
    is_recurring BOOLEAN DEFAULT false,
    parent_transaction_id UUID REFERENCES transactions(id), -- For linked/split transactions
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_household ON transactions(household_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- =====================================================
-- FINANCIAL: BUDGETS
-- =====================================================

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Budget Period Snapshots (monthly tracking)
CREATE TABLE budget_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    transaction_count INTEGER DEFAULT 0,
    percentage_used DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE WHEN limit_amount > 0 THEN (spent_amount / limit_amount * 100) ELSE 0 END
    ) STORED,
    status VARCHAR(50) GENERATED ALWAYS AS (
        CASE 
            WHEN spent_amount >= limit_amount THEN 'critical'
            WHEN spent_amount >= (limit_amount * 0.8) THEN 'warning'
            ELSE 'good'
        END
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(budget_id, period_start)
);

CREATE INDEX idx_budget_periods_dates ON budget_periods(period_start, period_end);

-- =====================================================
-- FINANCIAL: GOALS
-- =====================================================

CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL,
    is_achieved BOOLEAN DEFAULT false,
    achieved_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- FINANCIAL: SUBSCRIPTIONS
-- =====================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    billing_cycle_id UUID NOT NULL REFERENCES frequencies(id) ON DELETE RESTRICT,
    next_billing_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    merchant_website VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- BILLS & PAYMENTS
-- =====================================================

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'paid', 'pending', 'overdue'
    is_recurring BOOLEAN DEFAULT false,
    frequency_id UUID REFERENCES frequencies(id) ON DELETE SET NULL,
    payment_method VARCHAR(100),
    auto_pay_enabled BOOLEAN DEFAULT false,
    reminder_days INTEGER DEFAULT 3,
    payee_name VARCHAR(200),
    payee_account_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_bills_household ON bills(household_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_status ON bills(status);

-- Payment History
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    paid_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    confirmation_number VARCHAR(100),
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL
);

CREATE INDEX idx_payment_history_bill ON payment_history(bill_id);
CREATE INDEX idx_payment_history_date ON payment_history(paid_date);

-- =====================================================
-- MAINTENANCE
-- =====================================================

-- Service Providers (shared across households)
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL
);

-- Maintenance Tasks
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in-progress', 'completed', 'scheduled'
    due_date DATE NOT NULL,
    completed_date DATE,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    is_recurring BOOLEAN DEFAULT false,
    frequency_id UUID REFERENCES frequencies(id) ON DELETE SET NULL,
    location VARCHAR(200), -- e.g., "Kitchen", "Living Room"
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_maintenance_household ON maintenance_tasks(household_id);
CREATE INDEX idx_maintenance_due_date ON maintenance_tasks(due_date);
CREATE INDEX idx_maintenance_status ON maintenance_tasks(status);

-- =====================================================
-- INVENTORY
-- =====================================================

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2),
    location VARCHAR(200) NOT NULL, -- e.g., "Garage", "Bedroom"
    serial_number VARCHAR(100),
    model_number VARCHAR(100),
    manufacturer VARCHAR(100),
    notes TEXT,
    photo_urls TEXT[], -- Array of file paths
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Warranties
CREATE TABLE warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    provider VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_details TEXT,
    document_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL
);

CREATE INDEX idx_warranties_end_date ON warranties(end_date);
CREATE INDEX idx_warranties_item ON warranties(inventory_item_id);

-- Item Maintenance Schedules
CREATE TABLE item_maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    task VARCHAR(200) NOT NULL,
    description TEXT,
    frequency_id UUID NOT NULL REFERENCES frequencies(id) ON DELETE RESTRICT,
    last_completed DATE,
    next_due DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL
);

-- =====================================================
-- DOCUMENTS
-- =====================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'jpg', etc.
    file_size_bytes BIGINT NOT NULL,
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    is_important BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_household ON documents(household_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- Document Tags (many-to-many)
CREATE TABLE document_tags (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (document_id, tag)
);

CREATE INDEX idx_document_tags_tag ON document_tags(tag);

-- =====================================================
-- INSURANCE
-- =====================================================

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    insurance_type_id UUID NOT NULL REFERENCES insurance_types(id) ON DELETE RESTRICT,
    provider VARCHAR(200) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    premium DECIMAL(10, 2) NOT NULL,
    billing_frequency_id UUID NOT NULL REFERENCES frequencies(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    coverage_amount DECIMAL(15, 2),
    deductible DECIMAL(10, 2),
    coverage_details TEXT,
    is_active BOOLEAN DEFAULT true,
    document_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_insurance_household ON insurance_policies(household_id);
CREATE INDEX idx_insurance_renewal ON insurance_policies(renewal_date);

-- Insurance Beneficiaries (many-to-many)
CREATE TABLE insurance_beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insurance_policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100),
    percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100),
    contact_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL
);

-- =====================================================
-- NOTIFICATIONS & REMINDERS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth user
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'bill_due', 'maintenance_due', 'document_expiring', 'budget_alert', 'insurance_renewal'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url VARCHAR(500),
    related_entity_type VARCHAR(100), -- 'bill', 'maintenance_task', 'document', etc.
    related_entity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Reminders (scheduled notifications)
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID, -- NULL = all household members
    related_entity_type VARCHAR(100) NOT NULL, -- 'bill', 'maintenance_task', 'document', 'insurance_policy'
    related_entity_id UUID NOT NULL,
    reminder_type VARCHAR(50) NOT NULL, -- 'due_date', 'expiry', 'renewal', 'maintenance'
    remind_at TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    recurrence_pattern VARCHAR(100), -- For recurring reminders
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL
);

CREATE INDEX idx_reminders_remind_at ON reminders(remind_at) WHERE is_sent = false AND is_active = true;

-- =====================================================
-- ACTIVITY LOG (Audit Trail)
-- =====================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth user
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'paid', 'completed', etc.
    entity_type VARCHAR(100) NOT NULL, -- 'bill', 'transaction', 'maintenance_task', etc.
    entity_id UUID NOT NULL,
    entity_name VARCHAR(200),
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- Store additional context
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_household ON activity_logs(household_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Budget Performance (current period)
CREATE VIEW v_budget_performance AS
SELECT 
    b.id AS budget_id,
    b.household_id,
    b.name AS budget_name,
    c.name AS category_name,
    bp.period_start,
    bp.period_end,
    bp.limit_amount,
    bp.spent_amount,
    bp.percentage_used,
    bp.status,
    bp.transaction_count
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN budget_periods bp ON b.id = bp.budget_id
WHERE b.is_active = true 
  AND b.deleted_at IS NULL
  AND bp.period_start <= CURRENT_DATE 
  AND bp.period_end >= CURRENT_DATE;

-- View: Upcoming Bills (next 30 days)
CREATE VIEW v_upcoming_bills AS
SELECT 
    b.id,
    b.household_id,
    b.name,
    b.amount,
    b.due_date,
    b.status,
    c.name AS category_name,
    CURRENT_DATE - b.due_date AS days_overdue
FROM bills b
LEFT JOIN categories c ON b.category_id = c.id
WHERE b.deleted_at IS NULL
  AND b.status IN ('pending', 'overdue')
  AND b.due_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY b.due_date;

-- View: Expiring Warranties
CREATE VIEW v_expiring_warranties AS
SELECT 
    w.id,
    i.household_id,
    i.name AS item_name,
    w.provider,
    w.end_date,
    CURRENT_DATE - w.end_date AS days_until_expiry
FROM warranties w
JOIN inventory_items i ON w.inventory_item_id = i.id
WHERE w.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND i.deleted_at IS NULL
ORDER BY w.end_date;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_household_members_updated_at BEFORE UPDATE ON household_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_household_settings_updated_at BEFORE UPDATE ON household_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_periods_updated_at BEFORE UPDATE ON budget_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON warranties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_maintenance_schedules_updated_at BEFORE UPDATE ON item_maintenance_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_beneficiaries_updated_at BEFORE UPDATE ON insurance_beneficiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Update account balance after transaction
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update account balance based on transaction type
    IF TG_OP = 'INSERT' THEN
        UPDATE accounts 
        SET balance = balance + CASE 
            WHEN NEW.type = 'income' THEN NEW.amount 
            ELSE -NEW.amount 
        END,
        updated_at = NOW()
        WHERE id = NEW.account_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Revert old transaction
        UPDATE accounts 
        SET balance = balance - CASE 
            WHEN OLD.type = 'income' THEN OLD.amount 
            ELSE -OLD.amount 
        END
        WHERE id = OLD.account_id;
        
        -- Apply new transaction
        UPDATE accounts 
        SET balance = balance + CASE 
            WHEN NEW.type = 'income' THEN NEW.amount 
            ELSE -NEW.amount 
        END,
        updated_at = NOW()
        WHERE id = NEW.account_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Revert transaction on delete
        UPDATE accounts 
        SET balance = balance - CASE 
            WHEN OLD.type = 'income' THEN OLD.amount 
            ELSE -OLD.amount 
        END,
        updated_at = NOW()
        WHERE id = OLD.account_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function: Update budget period spent amount
CREATE OR REPLACE FUNCTION update_budget_period_spent()
RETURNS TRIGGER AS $$
DECLARE
    v_budget_id UUID;
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    -- Find the budget period for this transaction
    SELECT bp.id, bp.period_start, bp.period_end
    INTO v_budget_id, v_period_start, v_period_end
    FROM budget_periods bp
    JOIN budgets b ON bp.budget_id = b.id
    WHERE b.category_id = NEW.category_id
      AND b.household_id = NEW.household_id
      AND NEW.date BETWEEN bp.period_start AND bp.period_end
      AND b.is_active = true
      AND b.deleted_at IS NULL
    LIMIT 1;
    
    IF FOUND THEN
        -- Update spent amount
        UPDATE budget_periods
        SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE category_id = NEW.category_id
              AND household_id = NEW.household_id
              AND date BETWEEN v_period_start AND v_period_end
              AND type = 'expense'
              AND deleted_at IS NULL
        ),
        transaction_count = (
            SELECT COUNT(*)
            FROM transactions
            WHERE category_id = NEW.category_id
              AND household_id = NEW.household_id
              AND date BETWEEN v_period_start AND v_period_end
              AND type = 'expense'
              AND deleted_at IS NULL
        ),
        updated_at = NOW()
        WHERE id = v_budget_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_budget_period_spent
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_budget_period_spent();

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE households IS 'Main organizational unit for TheButler app. All data is scoped to a household.';
COMMENT ON TABLE household_members IS 'Links ASP.NET Identity users to households with role-based access.';
COMMENT ON TABLE household_settings IS 'Key-value store for household preferences and settings.';
COMMENT ON TABLE accounts IS 'Financial accounts (checking, savings, credit cards, investments).';
COMMENT ON TABLE transactions IS 'All financial transactions. Links to accounts and categories.';
COMMENT ON TABLE budgets IS 'Budget definitions per category.';
COMMENT ON TABLE budget_periods IS 'Monthly snapshots of budget performance with auto-calculated metrics.';
COMMENT ON TABLE bills IS 'Bills to be paid. Can be one-time or recurring.';
COMMENT ON TABLE payment_history IS 'Historical record of bill payments. Links to transactions.';
COMMENT ON TABLE subscriptions IS 'Recurring subscriptions (streaming, software, etc.). Links to accounts.';
COMMENT ON TABLE service_providers IS 'Maintenance service providers. Shared resource across households.';
COMMENT ON TABLE maintenance_tasks IS 'Home maintenance tasks and schedules.';
COMMENT ON TABLE inventory_items IS 'Household items with purchase info, location, and photos.';
COMMENT ON TABLE warranties IS 'Warranty information for inventory items. Check is_active by querying WHERE end_date >= CURRENT_DATE.';
COMMENT ON TABLE item_maintenance_schedules IS 'Recurring maintenance schedules for specific items.';
COMMENT ON TABLE documents IS 'Document vault for important files. Stores file paths, not binary data.';
COMMENT ON TABLE document_tags IS 'Many-to-many tags for documents.';
COMMENT ON TABLE insurance_policies IS 'Insurance policies (home, auto, health, life, etc.).';
COMMENT ON TABLE insurance_beneficiaries IS 'Beneficiaries for insurance policies.';
COMMENT ON TABLE notifications IS 'User notifications for bills, maintenance, expiring documents, etc.';
COMMENT ON TABLE reminders IS 'Scheduled reminders for upcoming events.';
COMMENT ON TABLE activity_logs IS 'Audit trail of all user actions in the system.';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

