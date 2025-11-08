#!/bin/bash
set -euo pipefail

# Database setup script for Smart Scheduler
# This script creates the PostgreSQL user and database for local development

DB_NAME="smartscheduler_dev"
DB_USER="dev_user"
DB_PASSWORD="dev_password"

echo "Setting up PostgreSQL database for Smart Scheduler..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "PostgreSQL is not running. Please start PostgreSQL first."
    echo "On macOS with Homebrew, run: brew services start postgresql@17"
    exit 1
fi

# Get the PostgreSQL superuser (usually 'postgres' or your macOS username)
# Try common superuser names
SUPERUSER=""
for user in postgres $(whoami); do
    if psql -U "$user" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
        SUPERUSER="$user"
        break
    fi
done

if [ -z "$SUPERUSER" ]; then
    echo "Could not find PostgreSQL superuser. Please run this script as a PostgreSQL superuser."
    echo "Try: sudo -u postgres $0"
    exit 1
fi

echo "Using PostgreSQL superuser: $SUPERUSER"
echo ""

# Create user if it doesn't exist
echo "Creating user '$DB_USER'..."
psql -U "$SUPERUSER" -d postgres <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'User $DB_USER created';
    ELSE
        RAISE NOTICE 'User $DB_USER already exists';
    END IF;
END
\$\$;
EOF

# Create database if it doesn't exist
echo "Creating database '$DB_NAME'..."
psql -U "$SUPERUSER" -d postgres <<EOF
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOF

# Grant privileges
echo "Granting privileges..."
psql -U "$SUPERUSER" -d "$DB_NAME" <<EOF
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

# Enable required extensions
echo "Enabling PostgreSQL extensions..."
psql -U "$SUPERUSER" -d "$DB_NAME" <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Note: PostGIS and pg_trgm are optional and may require additional installation
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOF

echo ""
echo "✓ Database setup complete!"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Next steps:"
echo "  1. Run database migrations: dotnet ef database update"
echo "  2. Or let Entity Framework create the schema automatically on first run"
echo ""

