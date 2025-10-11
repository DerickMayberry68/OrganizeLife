-- ============================================================================
-- Healthcare Schema Migration for TheButler
-- Created: 2025-10-10
-- Description: Adds comprehensive healthcare management tables
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: healthcare_providers
-- Description: Healthcare providers (doctors, clinics, hospitals, specialists, etc.)
-- ============================================================================
CREATE TABLE healthcare_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(100),
    specialty VARCHAR(200),
    phone_number VARCHAR(50),
    email VARCHAR(200),
    website VARCHAR(500),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_healthcare_providers_household ON healthcare_providers(household_id);
CREATE INDEX idx_healthcare_providers_type ON healthcare_providers(provider_type);
CREATE INDEX idx_healthcare_providers_specialty ON healthcare_providers(specialty);

COMMENT ON TABLE healthcare_providers IS 'Healthcare providers (doctors, clinics, hospitals, specialists, etc.).';

-- ============================================================================
-- Table: medical_records
-- Description: Medical records and health history for household members
-- ============================================================================
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    record_date DATE NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    test_results TEXT,
    follow_up_instructions TEXT,
    follow_up_date DATE,
    document_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_medical_records_household ON medical_records(household_id);
CREATE INDEX idx_medical_records_member ON medical_records(household_member_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);

COMMENT ON TABLE medical_records IS 'Medical records and health history for household members.';

-- ============================================================================
-- Table: medications
-- Description: Prescription and over-the-counter medications for household members
-- ============================================================================
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(100),
    reason VARCHAR(500),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_prescription BOOLEAN DEFAULT FALSE,
    prescription_number VARCHAR(100),
    refills_remaining INTEGER,
    pharmacy VARCHAR(200),
    pharmacy_phone VARCHAR(50),
    side_effects TEXT,
    instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_medications_household ON medications(household_id);
CREATE INDEX idx_medications_member ON medications(household_member_id);
CREATE INDEX idx_medications_active ON medications(is_active);

COMMENT ON TABLE medications IS 'Prescription and over-the-counter medications for household members.';

-- ============================================================================
-- Table: medication_schedules
-- Description: Medication schedules and reminders for when to take medications
-- ============================================================================
CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL,
    day_of_week VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_minutes_before INTEGER DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_medication_schedules_medication ON medication_schedules(medication_id);
CREATE INDEX idx_medication_schedules_active ON medication_schedules(is_active);

COMMENT ON TABLE medication_schedules IS 'Medication schedules and reminders for when to take medications.';

-- ============================================================================
-- Table: appointments
-- Description: Medical appointments for household members
-- ============================================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    appointment_type VARCHAR(100),
    reason VARCHAR(500),
    status VARCHAR(50) DEFAULT 'scheduled',
    location VARCHAR(500),
    provider_name VARCHAR(200),
    reminder_days INTEGER DEFAULT 1,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    prep_instructions TEXT,
    follow_up_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_appointments_household ON appointments(household_id);
CREATE INDEX idx_appointments_member ON appointments(household_member_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

COMMENT ON TABLE appointments IS 'Medical appointments for household members.';

-- ============================================================================
-- Table: vaccinations
-- Description: Vaccination and immunization records for household members
-- ============================================================================
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    vaccine_name VARCHAR(200) NOT NULL,
    date_administered DATE NOT NULL,
    dose_number VARCHAR(50),
    lot_number VARCHAR(100),
    site VARCHAR(100),
    route VARCHAR(100),
    next_dose_date DATE,
    is_up_to_date BOOLEAN DEFAULT TRUE,
    administered_by VARCHAR(200),
    location VARCHAR(500),
    reactions TEXT,
    document_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_vaccinations_household ON vaccinations(household_id);
CREATE INDEX idx_vaccinations_member ON vaccinations(household_member_id);
CREATE INDEX idx_vaccinations_date ON vaccinations(date_administered);
CREATE INDEX idx_vaccinations_vaccine_name ON vaccinations(vaccine_name);

COMMENT ON TABLE vaccinations IS 'Vaccination and immunization records for household members.';

-- ============================================================================
-- Table: allergies
-- Description: Allergy information for household members
-- ============================================================================
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    allergy_type VARCHAR(100) NOT NULL,
    allergen VARCHAR(200) NOT NULL,
    severity VARCHAR(50),
    reaction TEXT,
    diagnosed_date DATE,
    treatment VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_allergies_household ON allergies(household_id);
CREATE INDEX idx_allergies_member ON allergies(household_member_id);
CREATE INDEX idx_allergies_type ON allergies(allergy_type);
CREATE INDEX idx_allergies_severity ON allergies(severity);

COMMENT ON TABLE allergies IS 'Allergy information for household members.';

-- ============================================================================
-- Table: health_metrics
-- Description: Health metrics and vital signs tracking for household members
-- ============================================================================
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    household_member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_time TIME,
    metric_type VARCHAR(100) NOT NULL,
    value NUMERIC(10,2),
    unit VARCHAR(50),
    weight NUMERIC(10,2),
    height NUMERIC(10,2),
    bmi NUMERIC(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature NUMERIC(5,2),
    blood_glucose INTEGER,
    oxygen_saturation INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_health_metrics_household ON health_metrics(household_id);
CREATE INDEX idx_health_metrics_member ON health_metrics(household_member_id);
CREATE INDEX idx_health_metrics_date ON health_metrics(record_date);
CREATE INDEX idx_health_metrics_type ON health_metrics(metric_type);

COMMENT ON TABLE health_metrics IS 'Health metrics and vital signs tracking for household members.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- - 8 new tables created
-- - 28 indexes created for query performance
-- - All tables include soft delete support (deleted_at)
-- - All tables include audit fields (created_by, updated_by, created_at, updated_at)
-- - Foreign keys properly configured with appropriate cascade/set null behavior
-- ============================================================================

-- Verify tables were created
SELECT 
    'healthcare_providers' as table_name, 
    COUNT(*) as row_count 
FROM healthcare_providers
UNION ALL
SELECT 'medical_records', COUNT(*) FROM medical_records
UNION ALL
SELECT 'medications', COUNT(*) FROM medications
UNION ALL
SELECT 'medication_schedules', COUNT(*) FROM medication_schedules
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'vaccinations', COUNT(*) FROM vaccinations
UNION ALL
SELECT 'allergies', COUNT(*) FROM allergies
UNION ALL
SELECT 'health_metrics', COUNT(*) FROM health_metrics;

