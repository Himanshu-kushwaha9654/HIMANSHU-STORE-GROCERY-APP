const fs = require('fs');
let sql = fs.readFileSync('supabase_missing_migrations.sql', 'utf8');

// Safe ENUM creation
sql = sql.replace(/CREATE TYPE (public\.\w+) AS ENUM \(([^)]+)\);/g, (match, typeName, values) => {
    const typeNameOnly = typeName.replace('public.', '');
    return `DO $$ BEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${typeNameOnly}') THEN\n    CREATE TYPE ${typeName} AS ENUM (${values});\n  END IF;\nEND $$;`;
});

// Safe TABLE creation
sql = sql.replace(/CREATE TABLE (public\.\w+)/g, 'CREATE TABLE IF NOT EXISTS $1');

// Safe INDEX creation
sql = sql.replace(/CREATE INDEX (idx_\w+) ON (public\.\w+)/g, 'CREATE INDEX IF NOT EXISTS $1 ON $2');

// Safe TRIGGER creation (Drop first)
sql = sql.replace(/CREATE TRIGGER (\w+)/g, 'DROP TRIGGER IF EXISTS $1 ON public.orders;\nCREATE TRIGGER $1');

// Safe POLICY creation
sql = sql.replace(/CREATE POLICY "([^"]+)" ON (public\.\w+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2');
sql = sql.replace(/CREATE POLICY "([^"]+)" ON (storage\.\w+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2');

// Also adding a command to reload the schema cache at the very end in case the 404 is from stale cache
sql += "\n\n-- Reload PostgREST schema cache to make sure tables are exposed immediately\nNOTIFY pgrst, 'reload schema';\n";

fs.writeFileSync('supabase_safe_migrations.sql', sql);
console.log('Created supabase_safe_migrations.sql');
