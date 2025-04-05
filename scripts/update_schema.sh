#!/bin/bash

# Clear the file first
> supabase/schema/current_schema.sql

# Combine all schema files in the correct dependency order
echo "-- EXTENSIONS --" >> supabase/schema/current_schema.sql
for file in supabase/schema/extensions/*.sql; do
  echo "-- File: $(basename "$file")" >> supabase/schema/current_schema.sql
  cat "$file" >> supabase/schema/current_schema.sql
  echo -e "\n" >> supabase/schema/current_schema.sql
done

echo -e "\n-- TYPES --" >> supabase/schema/current_schema.sql
for file in supabase/schema/types/*.sql; do
  echo "-- File: $(basename "$file")" >> supabase/schema/current_schema.sql
  cat "$file" >> supabase/schema/current_schema.sql
  echo -e "\n" >> supabase/schema/current_schema.sql
done

echo -e "\n-- TABLES --" >> supabase/schema/current_schema.sql
for file in supabase/schema/tables/*.sql; do
  echo "-- File: $(basename "$file")" >> supabase/schema/current_schema.sql
  cat "$file" >> supabase/schema/current_schema.sql
  echo -e "\n" >> supabase/schema/current_schema.sql
done

echo -e "\n-- FUNCTIONS --" >> supabase/schema/current_schema.sql
for file in supabase/schema/functions/*.sql; do
  echo "-- File: $(basename "$file")" >> supabase/schema/current_schema.sql
  cat "$file" >> supabase/schema/current_schema.sql
  echo -e "\n" >> supabase/schema/current_schema.sql
done

echo -e "\n-- POLICIES --" >> supabase/schema/current_schema.sql
for file in supabase/schema/policies/*.sql; do
  echo "-- File: $(basename "$file")" >> supabase/schema/current_schema.sql
  cat "$file" >> supabase/schema/current_schema.sql
  echo -e "\n" >> supabase/schema/current_schema.sql
done

echo "Schema updated successfully!"
