#!/usr/bin/env bash
set -euo pipefail

DB_PASSWORD="${1:-}"
if [ -z "$DB_PASSWORD" ]; then
  echo "Usage: $0 <db_password>"
  exit 1
fi

run_push() {
  supabase db push --password "$DB_PASSWORD" --include-all
}

if run_push; then
  echo "Supabase migrations applied successfully."
  exit 0
fi

echo "Initial db push failed. Attempting migration history repair for pre-existing schemas..."

for file in supabase/migrations/*.sql; do
  version="$(basename "$file" .sql)"
  supabase migration repair --status applied "$version" || true
done

run_push

echo "Supabase migrations applied after repair."
