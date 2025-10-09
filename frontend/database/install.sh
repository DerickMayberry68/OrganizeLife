#!/bin/bash

# =====================================================
# TheButler Database Installation Script
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DB_NAME="thebutler"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --db-name)
            DB_NAME="$2"
            shift 2
            ;;
        --db-user)
            DB_USER="$2"
            shift 2
            ;;
        --db-host)
            DB_HOST="$2"
            shift 2
            ;;
        --db-port)
            DB_PORT="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./install.sh [options]"
            echo ""
            echo "Options:"
            echo "  --db-name NAME    Database name (default: thebutler)"
            echo "  --db-user USER    Database user (default: postgres)"
            echo "  --db-host HOST    Database host (default: localhost)"
            echo "  --db-port PORT    Database port (default: 5432)"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      TheButler Database Installation Script       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo "Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Connection string
PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER"

echo -e "${YELLOW}Step 1/5: Checking if database exists...${NC}"
DB_EXISTS=$($PSQL_CMD -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}Warning: Database '$DB_NAME' already exists.${NC}"
    read -p "Do you want to DROP and recreate it? This will delete all data! (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        $PSQL_CMD -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo -e "${YELLOW}Using existing database...${NC}"
    fi
fi

if [ "$DB_EXISTS" != "1" ] || [ "$confirm" = "yes" ]; then
    echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
    $PSQL_CMD -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✓ Database created${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2/4: Installing TheButler application tables (using Supabase Auth)...${NC}"
$PSQL_CMD -d $DB_NAME -f schema.sql
echo -e "${GREEN}✓ Application tables installed (32 tables)${NC}"

echo ""
echo -e "${YELLOW}Step 3/4: Loading seed data...${NC}"
$PSQL_CMD -d $DB_NAME -f seed-data.sql
echo -e "${GREEN}✓ Seed data loaded${NC}"

echo ""
echo -e "${YELLOW}Step 4/4: Verifying installation...${NC}"
TABLE_COUNT=$($PSQL_CMD -d $DB_NAME -tAc "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';")
echo "  Application tables: $TABLE_COUNT"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Installation completed! 🎉               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo "Connection string for .NET:"
echo "Host=$DB_HOST;Database=$DB_NAME;Username=$DB_USER;Password=YOUR_PASSWORD"
echo ""
echo "Next steps:"
echo "1. Configure your .NET application with the connection string above"
echo "2. Review SUPABASE-GUIDE.md for Supabase Auth setup"
echo "3. Review DOTNET-INTEGRATION.md for API development"
echo "4. Disable RLS on tables (see SUPABASE-GUIDE.md)"
echo ""
echo "To connect to the database:"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo ""

