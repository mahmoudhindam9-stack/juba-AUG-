const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/cost_center\?: string;/g, "cost_center?: string;\n  description?: string;\n  id?: string;");

fs.writeFileSync(path, content, 'utf8');
