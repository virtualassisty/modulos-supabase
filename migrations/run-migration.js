#!/usr/bin/env node
/**
 * Migration runner for Supabase
 * Reads and executes SQL migration files
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = 'https://wzimcsxlpfkzvdieicil.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aW1jc3hscGZrenZkaWVpY2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI5NDI2NCwiZXhwIjoyMDk5ODcwMjY0fQ.cTi-umEgxEwvS2Dg1r3LhQAQman8eBkNqnN3C3l_1SQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration(filename) {
  try {
    console.log(`\n📄 Running migration: ${filename}`);

    const sqlPath = join(__dirname, filename);
    const sql = readFileSync(sqlPath, 'utf-8');

    // Execute the SQL using Supabase's rpc function or direct query
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
      .catch(async () => {
        // If rpc doesn't exist, try using the REST API directly
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ sql_query: sql })
        });

        if (!response.ok) {
          // If that doesn't work either, we'll need to use a different approach
          throw new Error('Could not execute migration via RPC');
        }

        return { data: await response.json(), error: null };
      });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully');
    return data;

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.log('\n💡 Please run the SQL file manually in the Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/wzimcsxlpfkzvdieicil/sql/new`);
    process.exit(1);
  }
}

// Run the migration
runMigration('001_create_formularios_schema.sql')
  .then(() => {
    console.log('\n🎉 All migrations completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
