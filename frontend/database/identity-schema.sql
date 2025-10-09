-- =====================================================
-- ASP.NET Core Identity Tables for PostgreSQL
-- Version: ASP.NET Core Identity 8.0
-- Modified for UUID primary keys and PostgreSQL conventions
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ROLES
-- =====================================================

CREATE TABLE "AspNetRoles" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Name" VARCHAR(256),
    "NormalizedName" VARCHAR(256) UNIQUE,
    "ConcurrencyStamp" TEXT
);

CREATE INDEX "IX_AspNetRoles_NormalizedName" ON "AspNetRoles"("NormalizedName");

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE "AspNetUsers" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserName" VARCHAR(256),
    "NormalizedUserName" VARCHAR(256) UNIQUE,
    "Email" VARCHAR(256),
    "NormalizedEmail" VARCHAR(256),
    "EmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "PasswordHash" TEXT,
    "SecurityStamp" TEXT,
    "ConcurrencyStamp" TEXT,
    "PhoneNumber" TEXT,
    "PhoneNumberConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "TwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "LockoutEnd" TIMESTAMPTZ,
    "LockoutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "AccessFailedCount" INTEGER NOT NULL DEFAULT 0,
    
    -- Additional custom fields for TheButler
    "FirstName" VARCHAR(100),
    "LastName" VARCHAR(100),
    "ProfilePhotoUrl" VARCHAR(500),
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "LastLoginAt" TIMESTAMPTZ
);

CREATE INDEX "IX_AspNetUsers_NormalizedUserName" ON "AspNetUsers"("NormalizedUserName");
CREATE INDEX "IX_AspNetUsers_NormalizedEmail" ON "AspNetUsers"("NormalizedEmail");
CREATE INDEX "IX_AspNetUsers_Email" ON "AspNetUsers"("Email");

-- =====================================================
-- USER ROLES (Many-to-Many)
-- =====================================================

CREATE TABLE "AspNetUserRoles" (
    "UserId" UUID NOT NULL REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE,
    "RoleId" UUID NOT NULL REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE,
    PRIMARY KEY ("UserId", "RoleId")
);

CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles"("RoleId");
CREATE INDEX "IX_AspNetUserRoles_UserId" ON "AspNetUserRoles"("UserId");

-- =====================================================
-- USER CLAIMS
-- =====================================================

CREATE TABLE "AspNetUserClaims" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" UUID NOT NULL REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE,
    "ClaimType" TEXT,
    "ClaimValue" TEXT
);

CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims"("UserId");

-- =====================================================
-- USER LOGINS (External Logins: Google, Microsoft, etc.)
-- =====================================================

CREATE TABLE "AspNetUserLogins" (
    "LoginProvider" VARCHAR(128) NOT NULL,
    "ProviderKey" VARCHAR(128) NOT NULL,
    "ProviderDisplayName" TEXT,
    "UserId" UUID NOT NULL REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE,
    PRIMARY KEY ("LoginProvider", "ProviderKey")
);

CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins"("UserId");

-- =====================================================
-- USER TOKENS (Authentication tokens)
-- =====================================================

CREATE TABLE "AspNetUserTokens" (
    "UserId" UUID NOT NULL REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE,
    "LoginProvider" VARCHAR(128) NOT NULL,
    "Name" VARCHAR(128) NOT NULL,
    "Value" TEXT,
    PRIMARY KEY ("UserId", "LoginProvider", "Name")
);

-- =====================================================
-- ROLE CLAIMS
-- =====================================================

CREATE TABLE "AspNetRoleClaims" (
    "Id" SERIAL PRIMARY KEY,
    "RoleId" UUID NOT NULL REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE,
    "ClaimType" TEXT,
    "ClaimValue" TEXT
);

CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims"("RoleId");

-- =====================================================
-- TRIGGER: Auto-update UpdatedAt timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_aspnetusers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_aspnetusers_updated_at
BEFORE UPDATE ON "AspNetUsers"
FOR EACH ROW EXECUTE FUNCTION update_aspnetusers_updated_at();

-- =====================================================
-- DEFAULT ROLES (Optional - for TheButler)
-- =====================================================

-- Uncomment to seed default roles
/*
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
    (uuid_generate_v4(), 'SystemAdmin', 'SYSTEMADMIN', uuid_generate_v4()::text),
    (uuid_generate_v4(), 'HouseholdAdmin', 'HOUSEHOLDADMIN', uuid_generate_v4()::text),
    (uuid_generate_v4(), 'HouseholdMember', 'HOUSEHOLDMEMBER', uuid_generate_v4()::text);
*/

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE "AspNetRoles" IS 'ASP.NET Core Identity roles for application-wide permissions';
COMMENT ON TABLE "AspNetUsers" IS 'ASP.NET Core Identity users with extended profile fields';
COMMENT ON TABLE "AspNetUserRoles" IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE "AspNetUserClaims" IS 'User-specific claims for fine-grained permissions';
COMMENT ON TABLE "AspNetUserLogins" IS 'External authentication provider logins (Google, Microsoft, etc.)';
COMMENT ON TABLE "AspNetUserTokens" IS 'Authentication tokens for users';
COMMENT ON TABLE "AspNetRoleClaims" IS 'Role-based claims that apply to all users with that role';

COMMENT ON COLUMN "AspNetUsers"."FirstName" IS 'Custom field: User first name';
COMMENT ON COLUMN "AspNetUsers"."LastName" IS 'Custom field: User last name';
COMMENT ON COLUMN "AspNetUsers"."ProfilePhotoUrl" IS 'Custom field: URL to user profile photo';
COMMENT ON COLUMN "AspNetUsers"."CreatedAt" IS 'Custom field: When the user account was created';
COMMENT ON COLUMN "AspNetUsers"."UpdatedAt" IS 'Custom field: When the user account was last updated';
COMMENT ON COLUMN "AspNetUsers"."LastLoginAt" IS 'Custom field: When the user last logged in';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables created successfully
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'AspNet%' ORDER BY tablename;

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE 'AspNet%' ORDER BY tablename;

-- =====================================================
-- END OF IDENTITY SCHEMA
-- =====================================================

