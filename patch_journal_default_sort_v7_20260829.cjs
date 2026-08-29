const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let code = fs.readFileSync(path, 'utf8');
const oldText = '  >("oldest");';
if (!code.includes(oldText)) throw new Error('Journal sort default state not found');
code = code.replace(oldText, '  >("ref_asc");');
fs.writeFileSync(path, code, 'utf8');
console.log('Default journal sort changed to reference order.');
