const fs = require('fs');
const path = 'src/routes/admin/restaurant.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/erpStore\.menuItems/g, "erpStore.getState().menuItems");
content = content.replace(/erpStore\.inventory/g, "erpStore.getState().inventory");
content = content.replace(/erpStore\.orders/g, "erpStore.getState().orders");

fs.writeFileSync(path, content, 'utf8');
