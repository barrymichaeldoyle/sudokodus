#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./scripts/create_migration.sh migration_name"
  exit 1
fi

timestamp=$(date +%Y%m%d_%H%M%S)
migration_file="supabase/migrations/${timestamp}_$1.sql"

# Generate migration
supabase db diff --use-migra -f "$1" > "$migration_file"

echo "Created migration in $migration_file"
