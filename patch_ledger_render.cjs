const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/setErpState\(erpStore\.getState\(\)\);/g, "setErpState({ ...erpStore.getState() });");

fs.writeFileSync(path, content, 'utf8');
