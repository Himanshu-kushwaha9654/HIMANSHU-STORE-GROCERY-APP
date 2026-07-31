const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      const regex1 = /\$\{\s*(.+?)\.toFixed\(\d\)\s*\}/g;
      if (regex1.test(content)) {
        content = content.replace(regex1, '{formatCurrency($1)}');
        modified = true;
      }
      
      const regex2 = /\$\$\{\s*(.+?)\.toFixed\(\d\)\s*\}/g;
      if (regex2.test(content)) {
        content = content.replace(regex2, '${formatCurrency($1)}');
        modified = true;
      }

      if (modified) {
         if (!content.includes('import { formatCurrency } from "@/lib/currency"')) {
            content = `import { formatCurrency } from "@/lib/currency";\n` + content;
         }
         fs.writeFileSync(fullPath, content, 'utf8');
         console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
