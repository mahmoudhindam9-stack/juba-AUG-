const fs = require('fs');
const path = 'src/routes/admin/system-update.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/inventoryItems:/g, "inventory:");
content = content.replace(/treasuryAccounts:/g, "treasuries:");
content = content.replace(/erpState\.menuItems/g, "erpState.menu");
content = content.replace(/tableOrdersStore\.getOrders\(\)/g, "tableOrdersStore.getAllOrders()");

// Also fix the property 'data' does not exist error
content = content.replace(/res\.data/g, "('data' in res ? res.data : [])");

fs.writeFileSync(path, content, 'utf8');
