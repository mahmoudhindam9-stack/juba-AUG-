const fs = require('fs');
const path = 'src/routes/pos.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/capacity: [0-9]+,?/g, "");
content = content.replace(/item\.requires_oven/g, "(item as any).requires_oven");
content = content.replace(/erpStore\.update\(/g, "erpStore.setState(");
content = content.replace(/state =>/g, "(state: any) =>");
content = content.replace(/t =>/g, "(t: any) =>");
content = content.replace(/j =>/g, "(j: any) =>");

content = content.replace(/setPendingCashierOrders/g, "pendingCashierOrders");

fs.writeFileSync(path, content, 'utf8');
