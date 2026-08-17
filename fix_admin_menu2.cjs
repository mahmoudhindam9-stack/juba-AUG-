const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/menu.tsx', 'utf-8');

code = code.replace(/inventory_tracking: item\.inventory_tracking \|\| "not_tracked",/g, 'inventory_tracking: item.inventory_tracking || "not_tracked",\n      additions: Array.isArray(item.additions) ? item.additions : [],');

fs.writeFileSync('src/routes/admin/menu.tsx', code);
console.log("Updated admin/menu.tsx");
