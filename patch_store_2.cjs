const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');

// Revert mistake in Voucher
content = content.replace(/cost_center\?: string;\n  description\?: string;\n  id\?: string;/g, "cost_center?: string;");

// Insert correctly into JournalLine
content = content.replace(/rate\?: number;\n  cost_center\?: string;\n}/, "rate?: number;\n  cost_center?: string;\n  description?: string;\n  id?: string;\n}");

fs.writeFileSync(path, content, 'utf8');
