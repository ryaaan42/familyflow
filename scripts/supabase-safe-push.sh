#!/usr/bin/env bash
set -euo pipefail

DB_PASSWORD="${1:-}"
if [ -z "$DB_PASSWORD" ]; then
  echo "Usage: $0 <db_password>"
  exit 1
fi

LOG_FILE="$(mktemp)"
trap 'rm -f "$LOG_FILE"' EXIT

declare -A REPAIRED=()
MAX_ATTEMPTS=40

run_push_capture() {
  set +e
  supabase db push --password "$DB_PASSWORD" >"$LOG_FILE" 2>&1
  local code=$?
  set -e
  return $code
}

extract_failing_version() {
  # Example line: "Applying migration 20260311170500_init_familyflow.sql..."
  local line
  line="$(grep -E "Applying migration [0-9]{14}[_a-zA-Z0-9-]*\.sql" "$LOG_FILE" | tail -n1 || true)"
  if [ -z "$line" ]; then
    echo ""
    return 0
  fi

  local version
  version="$(printf '%s' "$line" | grep -Eo '[0-9]{14}' | head -n1 || true)"
  printf '%s' "$version"
}

is_existing_schema_conflict() {
  grep -Eq 'already exists|SQLSTATE 42P07|duplicate_object|relation ".*" already exists' "$LOG_FILE"
}

echo "[safe-push] Starting supabase db push..."

attempt=1
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  if run_push_capture; then
    cat "$LOG_FILE"
    echo "[safe-push] Supabase migrations applied successfully."
    exit 0
  fi

  cat "$LOG_FILE"

  if ! is_existing_schema_conflict; then
    echo "[safe-push] Push failed for a non-repairable reason. Aborting."
    exit 1
  fi

  version="$(extract_failing_version)"
  if [ -z "$version" ]; then
    echo "[safe-push] Could not extract failing migration version. Aborting."
    exit 1
  fi

  if [[ -n "${REPAIRED[$version]:-}" ]]; then
    echo "[safe-push] Version $version already repaired in this run, but push still fails. Aborting to avoid loop."
    exit 1
  fi

  echo "[safe-push] Repairing migration history for version $version (mark as applied)..."
  supabase migration repair --status applied "$version"
  REPAIRED[$version]=1

  attempt=$((attempt + 1))
done

echo "[safe-push] Reached max attempts ($MAX_ATTEMPTS). Aborting."
exit 1
