#!/bin/bash

# Simple migration runner using curl to execute SQL via Supabase REST API

SUPABASE_URL="https://wzimcsxlpfkzvdieicil.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aW1jc3hscGZrenZkaWVpY2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI5NDI2NCwiZXhwIjoyMDk5ODcwMjY0fQ.cTi-umEgxEwvS2Dg1r3LhQAQman8eBkNqnN3C3l_1SQ"

echo "🚀 Running database migration..."
echo ""
echo "⚠️  Note: This script requires psql (PostgreSQL client)"
echo "    Alternatively, copy the SQL from 001_create_formularios_schema.sql"
echo "    and run it in the Supabase SQL Editor:"
echo "    https://supabase.com/dashboard/project/wzimcsxlpfkzvdieicil/sql/new"
echo ""

# Check if psql is available
if command -v psql &> /dev/null; then
    echo "✅ psql found, attempting migration..."

    # Get the connection string (you'll need to add this manually)
    echo "Please provide your Supabase connection string from:"
    echo "https://supabase.com/dashboard/project/wzimcsxlpfkzvdieicil/settings/database"
    echo ""
    read -p "Connection string: " CONN_STRING

    if [ -n "$CONN_STRING" ]; then
        psql "$CONN_STRING" -f 001_create_formularios_schema.sql
        echo ""
        echo "✅ Migration completed!"
    else
        echo "❌ No connection string provided"
    fi
else
    echo "❌ psql not found"
    echo ""
    echo "📋 Manual migration steps:"
    echo "1. Copy the SQL from: migrations/001_create_formularios_schema.sql"
    echo "2. Go to: https://supabase.com/dashboard/project/wzimcsxlpfkzvdieicil/sql/new"
    echo "3. Paste and run the SQL"
fi
