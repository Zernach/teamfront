#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

DEFAULT_SQL_FILE="$ROOT_DIR/backend/src/main/resources/db/seed/seed_customers_invoices.sql"
SQL_FILE="${1:-$DEFAULT_SQL_FILE}"

usage() {
  echo "Usage: PGHOST=<host> PGPORT=<port> PGUSER=<user> PGPASSWORD=<password> PGDATABASE=<db> $0 [sql_file]"
  echo
  echo "Defaults:"
  echo "  sql_file: $DEFAULT_SQL_FILE"
  echo
  echo "Example:"
  echo "  PGHOST=mydb.abc123.us-east-1.rds.amazonaws.com \\"
  echo "  PGPORT=5432 PGUSER=app_user PGPASSWORD=*** PGDATABASE=invoiceme \\"
  echo "  $0"
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql not found. Install PostgreSQL client (psql) and retry."
  exit 1
fi

if [[ ! -f "$SQL_FILE" ]]; then
  echo "Error: SQL file not found: $SQL_FILE"
  exit 1
fi

: "${PGHOST:?PGHOST is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
PGPORT="${PGPORT:-5432}"

echo "Seeding AWS RDS PostgreSQL..."
echo "  Host: $PGHOST"
echo "  Port: $PGPORT"
echo "  Database: $PGDATABASE"
echo "  User: $PGUSER"
echo "  File: $SQL_FILE"
echo

PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-10}" \
psql \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  -d "$PGDATABASE" \
  -v ON_ERROR_STOP=1 \
  -f "$SQL_FILE"

echo "✅ Seed completed successfully."


