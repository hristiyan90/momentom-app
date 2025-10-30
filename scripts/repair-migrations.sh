#!/bin/bash

# Repair migration history to mark intermediate migrations as applied
# This allows us to push only the October 29 workout library migrations

echo "Marking intermediate migrations as applied..."

npx supabase migration repair --status applied 20250118
npx supabase migration repair --status applied 20250925
npx supabase migration repair --status applied 20250926
npx supabase migration repair --status applied 20250927
npx supabase migration repair --status applied 20250930
npx supabase migration repair --status applied 20251011000001
npx supabase migration repair --status applied 20251011000002

echo ""
echo "Migration history repaired!"
echo "Now you can run: npx supabase db push"
