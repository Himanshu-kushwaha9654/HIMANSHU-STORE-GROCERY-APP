const fs = require('fs');
let s = fs.readFileSync('supabase/migrations/0002_admin_inventory.sql', 'utf8');

// Safe POLICY creation
s = s.replace(/CREATE POLICY "([^"]+)" ON (public\.\w+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2');

// Safe TRIGGER creation
s = s.replace(/CREATE TRIGGER (\w+)\s+BEFORE UPDATE ON (public\.\w+)/g, 'DROP TRIGGER IF EXISTS $1 ON $2;\nCREATE TRIGGER $1 BEFORE UPDATE ON $2');

s += "\n\nNOTIFY pgrst, 'reload schema';\n";

fs.writeFileSync('safe_inventory.sql', s);
console.log('Done');
