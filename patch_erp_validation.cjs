const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /if \(Math\.abs\(totalDebit - totalCredit\) > 0\.05\) \{\s*console\.error\([\s\S]*?\);\s*return;\s*\}/m;
const replacement = `
    if (Math.abs(totalDebit - totalCredit) > 0.05) {
      console.error(
        \`Double-entry balance mismatch error: Debit (Base): \${totalDebit}, Credit (Base): \${totalCredit}\`,
      );
      if (!customId?.startsWith('ORACLE')) {
        return;
      } else {
        console.warn("Bypassing strict double-entry validation for legacy Oracle import.");
      }
    }
`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
