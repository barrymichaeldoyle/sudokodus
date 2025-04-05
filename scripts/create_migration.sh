#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./scripts/create_migration.sh migration_name"
  exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI not found. Please install it first."
  exit 1
fi

timestamp=$(date +%Y%m%d_%H%M%S)
migration_file="supabase/migrations/${timestamp}_$1.sql"

# Generate migration
supabase db diff --use-migra -f "$1" > "$migration_file"

# Check if the migration file is empty or only contains comments/whitespace
if [ ! -s "$migration_file" ] || ! grep -v -E "^--.*$|^$" "$migration_file" &> /dev/null; then
  echo "No changes detected. Migration file is empty."
  rm "$migration_file"
  exit 0
fi

echo "Created migration in $migration_file"

# Optionally apply the migration
read -p "Do you want to apply this migration now? [y/N] " apply
if [[ "$apply" =~ ^[Yy]$ ]]; then
  supabase db push
  echo "Migration applied."
fi
