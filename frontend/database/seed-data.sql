-- =====================================================
-- TheButler Database - Seed Data
-- Populates lookup tables with initial reference data
-- =====================================================

-- =====================================================
-- CATEGORIES
-- =====================================================

-- Bill Categories
INSERT INTO categories (name, type, description) VALUES
('Utilities', 'bill', 'Electric, gas, water, internet, phone'),
('Housing', 'bill', 'Rent, mortgage, HOA fees'),
('Insurance', 'bill', 'Home, auto, health, life insurance premiums'),
('Subscriptions', 'bill', 'Streaming, software, memberships'),
('Credit Cards', 'bill', 'Credit card payments'),
('Loans', 'bill', 'Personal, auto, student loans'),
('Other', 'bill', 'Miscellaneous bills');

-- Transaction Categories
INSERT INTO categories (name, type, description) VALUES
('Groceries', 'transaction', 'Food and household supplies'),
('Dining', 'transaction', 'Restaurants and takeout'),
('Transportation', 'transaction', 'Gas, parking, public transit'),
('Healthcare', 'transaction', 'Medical, dental, pharmacy'),
('Entertainment', 'transaction', 'Movies, events, hobbies'),
('Shopping', 'transaction', 'Clothing, electronics, general retail'),
('Travel', 'transaction', 'Flights, hotels, vacations'),
('Education', 'transaction', 'Tuition, books, courses'),
('Personal Care', 'transaction', 'Salon, gym, wellness'),
('Home Improvement', 'transaction', 'Repairs, renovations, furniture'),
('Gifts', 'transaction', 'Presents and donations'),
('Income', 'transaction', 'Salary, bonuses, side income'),
('Refunds', 'transaction', 'Returns and reimbursements');

-- Maintenance Categories
INSERT INTO categories (name, type, description) VALUES
('Plumbing', 'maintenance', 'Pipes, drains, water heaters'),
('Electrical', 'maintenance', 'Wiring, outlets, lighting'),
('HVAC', 'maintenance', 'Heating, cooling, ventilation'),
('Appliance', 'maintenance', 'Kitchen and laundry appliances'),
('Landscaping', 'maintenance', 'Lawn care, gardening, trees'),
('Cleaning', 'maintenance', 'Deep cleaning, carpet cleaning'),
('Pest Control', 'maintenance', 'Extermination and prevention'),
('Roofing', 'maintenance', 'Roof repairs and gutters'),
('Painting', 'maintenance', 'Interior and exterior painting'),
('Flooring', 'maintenance', 'Carpet, tile, hardwood'),
('General', 'maintenance', 'General repairs and odd jobs');

-- Document Categories
INSERT INTO categories (name, type, description) VALUES
('Legal', 'document', 'Contracts, deeds, legal documents'),
('Financial', 'document', 'Tax returns, bank statements'),
('Medical', 'document', 'Health records, prescriptions'),
('Insurance', 'document', 'Insurance policies and claims'),
('Property', 'document', 'Home inspection, appraisals'),
('Personal', 'document', 'IDs, passports, certificates'),
('Receipts', 'document', 'Purchase receipts and warranties'),
('Vehicle', 'document', 'Vehicle titles, registrations');

-- Subscription Categories
INSERT INTO categories (name, type, description) VALUES
('Streaming', 'subscription', 'Video and music streaming'),
('Software', 'subscription', 'Software and cloud services'),
('News', 'subscription', 'News and magazine subscriptions'),
('Fitness', 'subscription', 'Gym and fitness apps'),
('Professional', 'subscription', 'Professional memberships');

-- Inventory Categories
INSERT INTO categories (name, type, description) VALUES
('Electronics', 'inventory', 'Computers, phones, tablets, TVs, audio equipment'),
('Furniture', 'inventory', 'Chairs, tables, sofas, beds, cabinets'),
('Appliances', 'inventory', 'Kitchen and laundry appliances'),
('Vehicles', 'inventory', 'Cars, trucks, motorcycles, boats, RVs'),
('Tools', 'inventory', 'Power tools, hand tools, workshop equipment'),
('Outdoor', 'inventory', 'Lawn mowers, grills, patio furniture, garden tools'),
('Sports & Recreation', 'inventory', 'Exercise equipment, bicycles, sports gear'),
('Collectibles', 'inventory', 'Art, antiques, collectible items'),
('Other', 'inventory', 'Miscellaneous inventory items');

-- =====================================================
-- FREQUENCIES
-- =====================================================

INSERT INTO frequencies (name, interval_days) VALUES
('Weekly', 7),
('Bi-Weekly', 14),
('Monthly', 30),
('Quarterly', 90),
('Semi-Annual', 180),
('Yearly', 365);

-- =====================================================
-- PRIORITIES
-- =====================================================

INSERT INTO priorities (name, sort_order) VALUES
('Low', 1),
('Medium', 2),
('High', 3),
('Urgent', 4);

-- =====================================================
-- INSURANCE TYPES
-- =====================================================

INSERT INTO insurance_types (name, description) VALUES
('Home', 'Homeowners or renters insurance'),
('Auto', 'Vehicle insurance'),
('Health', 'Medical and health insurance'),
('Life', 'Life insurance policies'),
('Disability', 'Disability income insurance'),
('Umbrella', 'Umbrella liability insurance'),
('Pet', 'Pet health insurance'),
('Travel', 'Travel insurance'),
('Dental', 'Dental insurance'),
('Vision', 'Vision insurance'),
('Other', 'Other insurance types');

-- =====================================================
-- END OF SEED DATA
-- =====================================================

