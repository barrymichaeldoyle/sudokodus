#!/bin/bash

# Combine all schema files
echo "-- TYPES --" > supabase/schema/current_schema.sql
for file in supabase/schema/types/*.sql; do
  cat "$file" >> supabase/schema/current_schema.sql
  echo "" >> supabase/schema/current_schema.sql
done

echo "-- TABLES --" >> supabase/schema/current_schema.sql
for file in supabase/schema/tables/*.sql; do
  cat "$file" >> supabase/schema/current_schema.sql
  echo "" >> supabase/schema/current_schema.sql
done

echo "-- POLICIES --" >> supabase/schema/current_schema.sql
for file in supabase/schema/policies/*.sql; do
  cat "$file" >> supabase/schema/current_schema.sql
  echo "" >> supabase/schema/current_schema.sql
done

echo "-- FUNCTIONS --" >> supabase/schema/current_schema.sql
for file in supabase/schema/functions/*.sql; do
  cat "$file" >> supabase/schema/current_schema.sql
  echo "" >> supabase/schema/current_schema.sql
done

echo "Schema updated successfully!"