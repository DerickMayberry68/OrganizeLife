# PostgreSQL Query Reference

## Common Queries for TheButler

### Setup & Verification

```sql
-- Verify all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check table row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = schemaname AND table_name = tablename) AS columns
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- List all foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

### Dashboard Queries

```sql
-- Get household dashboard statistics
SELECT
    h.id AS household_id,
    h.name AS household_name,
    (SELECT COUNT(*) FROM bills WHERE household_id = h.id 
     AND status = 'pending' AND deleted_at IS NULL) AS pending_bills,
    (SELECT COUNT(*) FROM bills WHERE household_id = h.id 
     AND status = 'overdue' AND deleted_at IS NULL) AS overdue_bills,
    (SELECT COUNT(*) FROM maintenance_tasks WHERE household_id = h.id 
     AND status IN ('pending', 'scheduled') AND deleted_at IS NULL) AS pending_maintenance,
    (SELECT COUNT(*) FROM documents WHERE household_id = h.id 
     AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' 
     AND deleted_at IS NULL) AS expiring_documents,
    (SELECT COALESCE(SUM(balance), 0) FROM accounts 
     WHERE household_id = h.id AND deleted_at IS NULL) AS total_balance
FROM households h
WHERE h.id = 'YOUR_HOUSEHOLD_ID' AND h.deleted_at IS NULL;

-- Recent activity feed
SELECT 
    al.action,
    al.entity_type,
    al.entity_name,
    al.description,
    al.created_at,
    u.user_name
FROM activity_logs al
LEFT JOIN "AspNetUsers" u ON al.user_id = u.id
WHERE al.household_id = 'YOUR_HOUSEHOLD_ID'
ORDER BY al.created_at DESC
LIMIT 10;
```

### Financial Queries

```sql
-- Monthly spending by category
SELECT 
    c.name AS category,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_spent
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.household_id = 'YOUR_HOUSEHOLD_ID'
  AND t.type = 'expense'
  AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
  AND t.deleted_at IS NULL
GROUP BY c.name
ORDER BY total_spent DESC;

-- Account balances summary
SELECT 
    a.name,
    a.type,
    a.institution,
    a.balance,
    a.last_synced_at,
    (SELECT COUNT(*) FROM transactions 
     WHERE account_id = a.id AND deleted_at IS NULL) AS transaction_count
FROM accounts a
WHERE a.household_id = 'YOUR_HOUSEHOLD_ID'
  AND a.deleted_at IS NULL
ORDER BY a.type, a.name;

-- Budget performance (current month)
SELECT 
    b.name AS budget_name,
    c.name AS category,
    bp.limit_amount,
    bp.spent_amount,
    bp.percentage_used,
    bp.status,
    bp.limit_amount - bp.spent_amount AS remaining
FROM budgets b
JOIN categories c ON b.category_id = c.id
JOIN budget_periods bp ON b.id = bp.budget_id
WHERE b.household_id = 'YOUR_HOUSEHOLD_ID'
  AND b.is_active = true
  AND b.deleted_at IS NULL
  AND bp.period_start <= CURRENT_DATE
  AND bp.period_end >= CURRENT_DATE
ORDER BY bp.percentage_used DESC;

-- Income vs Expenses (last 6 months)
SELECT 
    DATE_TRUNC('month', date) AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net
FROM transactions
WHERE household_id = 'YOUR_HOUSEHOLD_ID'
  AND date >= CURRENT_DATE - INTERVAL '6 months'
  AND deleted_at IS NULL
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- Top spending categories (last 30 days)
SELECT 
    c.name AS category,
    COUNT(t.id) AS transactions,
    SUM(t.amount) AS total,
    ROUND(AVG(t.amount), 2) AS avg_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.household_id = 'YOUR_HOUSEHOLD_ID'
  AND t.type = 'expense'
  AND t.date >= CURRENT_DATE - INTERVAL '30 days'
  AND t.deleted_at IS NULL
GROUP BY c.name
ORDER BY total DESC
LIMIT 10;
```

### Bills & Payments

```sql
-- Upcoming bills (next 30 days)
SELECT 
    b.name,
    b.amount,
    b.due_date,
    b.status,
    c.name AS category,
    a.name AS account,
    b.due_date - CURRENT_DATE AS days_until_due
FROM bills b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN accounts a ON b.account_id = a.id
WHERE b.household_id = 'YOUR_HOUSEHOLD_ID'
  AND b.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND b.status IN ('pending', 'overdue')
  AND b.deleted_at IS NULL
ORDER BY b.due_date;

-- Bill payment history
SELECT 
    b.name AS bill_name,
    ph.paid_date,
    ph.amount,
    ph.confirmation_number,
    ph.payment_method,
    t.description AS transaction_description
FROM payment_history ph
JOIN bills b ON ph.bill_id = b.id
LEFT JOIN transactions t ON ph.transaction_id = t.id
WHERE b.household_id = 'YOUR_HOUSEHOLD_ID'
ORDER BY ph.paid_date DESC
LIMIT 20;

-- Recurring bills summary
SELECT 
    b.name,
    b.amount,
    f.name AS frequency,
    b.next_due_date,
    COUNT(ph.id) AS payment_count,
    SUM(ph.amount) AS total_paid
FROM bills b
JOIN frequencies f ON b.frequency_id = f.id
LEFT JOIN payment_history ph ON b.id = ph.bill_id
WHERE b.household_id = 'YOUR_HOUSEHOLD_ID'
  AND b.is_recurring = true
  AND b.deleted_at IS NULL
GROUP BY b.id, b.name, b.amount, f.name, b.next_due_date
ORDER BY b.name;
```

### Maintenance

```sql
-- Overdue maintenance tasks
SELECT 
    mt.title,
    c.name AS category,
    p.name AS priority,
    mt.due_date,
    CURRENT_DATE - mt.due_date AS days_overdue,
    mt.estimated_cost,
    sp.name AS service_provider
FROM maintenance_tasks mt
LEFT JOIN categories c ON mt.category_id = c.id
LEFT JOIN priorities p ON mt.priority_id = p.id
LEFT JOIN service_providers sp ON mt.service_provider_id = sp.id
WHERE mt.household_id = 'YOUR_HOUSEHOLD_ID'
  AND mt.status != 'completed'
  AND mt.due_date < CURRENT_DATE
  AND mt.deleted_at IS NULL
ORDER BY p.sort_order DESC, mt.due_date;

-- Maintenance cost summary
SELECT 
    c.name AS category,
    COUNT(mt.id) AS task_count,
    SUM(mt.estimated_cost) AS estimated_total,
    SUM(mt.actual_cost) AS actual_total,
    SUM(COALESCE(mt.actual_cost, mt.estimated_cost)) AS total_cost
FROM maintenance_tasks mt
JOIN categories c ON mt.category_id = c.id
WHERE mt.household_id = 'YOUR_HOUSEHOLD_ID'
  AND mt.deleted_at IS NULL
GROUP BY c.name
ORDER BY total_cost DESC;

-- Service provider performance
SELECT 
    sp.name,
    sp.category_id,
    sp.rating,
    COUNT(mt.id) AS jobs_completed,
    ROUND(AVG(mt.actual_cost), 2) AS avg_cost
FROM service_providers sp
LEFT JOIN maintenance_tasks mt ON sp.id = mt.service_provider_id 
    AND mt.status = 'completed'
WHERE sp.is_active = true
GROUP BY sp.id
ORDER BY sp.rating DESC, jobs_completed DESC;
```

### Inventory & Warranties

```sql
-- Inventory by location
SELECT 
    i.location,
    COUNT(i.id) AS item_count,
    SUM(i.purchase_price) AS total_purchase_value,
    SUM(COALESCE(i.current_value, i.purchase_price)) AS total_current_value
FROM inventory_items i
WHERE i.household_id = 'YOUR_HOUSEHOLD_ID'
  AND i.deleted_at IS NULL
GROUP BY i.location
ORDER BY total_current_value DESC;

-- Expiring warranties
SELECT 
    i.name AS item_name,
    w.provider,
    w.start_date,
    w.end_date,
    w.end_date - CURRENT_DATE AS days_remaining
FROM warranties w
JOIN inventory_items i ON w.inventory_item_id = i.id
WHERE i.household_id = 'YOUR_HOUSEHOLD_ID'
  AND w.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND i.deleted_at IS NULL
ORDER BY w.end_date;

-- Items needing maintenance
SELECT 
    i.name AS item_name,
    ims.task,
    f.name AS frequency,
    ims.next_due,
    ims.next_due - CURRENT_DATE AS days_until_due
FROM item_maintenance_schedules ims
JOIN inventory_items i ON ims.inventory_item_id = i.id
JOIN frequencies f ON ims.frequency_id = f.id
WHERE i.household_id = 'YOUR_HOUSEHOLD_ID'
  AND ims.is_active = true
  AND ims.next_due <= CURRENT_DATE + INTERVAL '30 days'
  AND i.deleted_at IS NULL
ORDER BY ims.next_due;
```

### Documents

```sql
-- Documents by category
SELECT 
    c.name AS category,
    COUNT(d.id) AS document_count,
    SUM(d.file_size_bytes) AS total_size_bytes,
    pg_size_pretty(SUM(d.file_size_bytes)::bigint) AS total_size
FROM documents d
JOIN categories c ON d.category_id = c.id
WHERE d.household_id = 'YOUR_HOUSEHOLD_ID'
  AND d.deleted_at IS NULL
GROUP BY c.name
ORDER BY document_count DESC;

-- Expiring documents
SELECT 
    d.title,
    c.name AS category,
    d.expiry_date,
    d.expiry_date - CURRENT_DATE AS days_until_expiry,
    d.is_important
FROM documents d
JOIN categories c ON d.category_id = c.id
WHERE d.household_id = 'YOUR_HOUSEHOLD_ID'
  AND d.expiry_date IS NOT NULL
  AND d.expiry_date >= CURRENT_DATE
  AND d.deleted_at IS NULL
ORDER BY d.expiry_date;

-- Search documents by tag
SELECT 
    d.title,
    c.name AS category,
    d.upload_date,
    array_agg(dt.tag) AS tags
FROM documents d
JOIN categories c ON d.category_id = c.id
JOIN document_tags dt ON d.id = dt.document_id
WHERE d.household_id = 'YOUR_HOUSEHOLD_ID'
  AND dt.tag ILIKE '%YOUR_SEARCH_TERM%'
  AND d.deleted_at IS NULL
GROUP BY d.id, d.title, c.name, d.upload_date
ORDER BY d.upload_date DESC;
```

### Insurance

```sql
-- Active insurance policies
SELECT 
    ip.provider,
    it.name AS insurance_type,
    ip.policy_number,
    ip.premium,
    f.name AS billing_frequency,
    ip.renewal_date,
    ip.renewal_date - CURRENT_DATE AS days_until_renewal
FROM insurance_policies ip
JOIN insurance_types it ON ip.insurance_type_id = it.id
JOIN frequencies f ON ip.billing_frequency_id = f.id
WHERE ip.household_id = 'YOUR_HOUSEHOLD_ID'
  AND ip.is_active = true
  AND ip.deleted_at IS NULL
ORDER BY ip.renewal_date;

-- Insurance costs summary
SELECT 
    it.name AS insurance_type,
    COUNT(ip.id) AS policy_count,
    SUM(ip.premium) AS total_premium,
    SUM(ip.coverage_amount) AS total_coverage
FROM insurance_policies ip
JOIN insurance_types it ON ip.insurance_type_id = it.id
WHERE ip.household_id = 'YOUR_HOUSEHOLD_ID'
  AND ip.is_active = true
  AND ip.deleted_at IS NULL
GROUP BY it.name
ORDER BY total_premium DESC;

-- Policy beneficiaries
SELECT 
    ip.provider,
    it.name AS insurance_type,
    ib.name AS beneficiary_name,
    ib.relationship,
    ib.percentage
FROM insurance_beneficiaries ib
JOIN insurance_policies ip ON ib.insurance_policy_id = ip.id
JOIN insurance_types it ON ip.insurance_type_id = it.id
WHERE ip.household_id = 'YOUR_HOUSEHOLD_ID'
  AND ip.is_active = true
ORDER BY ip.provider, ib.percentage DESC;
```

### User & Household Management

```sql
-- Household members with roles
SELECT 
    u.user_name,
    u.email,
    hm.role,
    hm.joined_at,
    hm.is_active
FROM household_members hm
JOIN "AspNetUsers" u ON hm.user_id = u.id
WHERE hm.household_id = 'YOUR_HOUSEHOLD_ID'
ORDER BY hm.role, hm.joined_at;

-- User's households
SELECT 
    h.name AS household_name,
    hm.role,
    hm.joined_at,
    (SELECT COUNT(*) FROM household_members WHERE household_id = h.id) AS member_count
FROM household_members hm
JOIN households h ON hm.household_id = h.id
WHERE hm.user_id = 'YOUR_USER_ID'
  AND hm.is_active = true
  AND h.deleted_at IS NULL;

-- Household settings
SELECT 
    setting_key,
    setting_value,
    data_type,
    updated_at
FROM household_settings
WHERE household_id = 'YOUR_HOUSEHOLD_ID'
ORDER BY setting_key;
```

### Notifications & Reminders

```sql
-- Unread notifications
SELECT 
    n.title,
    n.message,
    n.type,
    n.severity,
    n.created_at,
    n.action_url
FROM notifications n
WHERE n.user_id = 'YOUR_USER_ID'
  AND n.is_read = false
ORDER BY n.created_at DESC;

-- Upcoming reminders
SELECT 
    r.reminder_type,
    r.related_entity_type,
    r.remind_at,
    r.remind_at - NOW() AS time_until_reminder
FROM reminders r
WHERE r.household_id = 'YOUR_HOUSEHOLD_ID'
  AND r.is_sent = false
  AND r.is_active = true
  AND r.remind_at <= NOW() + INTERVAL '7 days'
ORDER BY r.remind_at;
```

### Maintenance & Optimization

```sql
-- Find tables with soft-deleted records
SELECT 
    tablename,
    (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) AS total_rows,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = tablename AND column_name = 'deleted_at') AS has_soft_delete
FROM pg_tables
WHERE schemaname = 'public';

-- Clean up old activity logs (archive before running!)
DELETE FROM activity_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Clean up old read notifications
DELETE FROM notifications 
WHERE is_read = true 
  AND read_at < NOW() - INTERVAL '90 days';

-- Vacuum and analyze all tables
VACUUM ANALYZE;

-- Update statistics
ANALYZE;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;
```

### Performance Monitoring

```sql
-- Slow queries (requires pg_stat_statements extension)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_time DESC
LIMIT 10;

-- Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Tips

1. **Always filter by household_id** to ensure data isolation
2. **Check deleted_at IS NULL** for soft-deleted tables
3. **Use prepared statements** in your application to prevent SQL injection
4. **Add indexes** for frequently filtered columns
5. **Use EXPLAIN ANALYZE** to optimize slow queries
6. **Regular VACUUM ANALYZE** to maintain performance
7. **Archive old data** (activity logs, notifications) periodically

## Useful PostgreSQL Commands

```sql
-- Show current connections
SELECT * FROM pg_stat_activity WHERE datname = 'thebutler';

-- Kill a connection
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;

-- Database size
SELECT pg_size_pretty(pg_database_size('thebutler'));

-- List all schemas
\dn

-- List all tables
\dt

-- Describe table
\d+ table_name

-- List all indexes
\di
```

