const fs = require('fs');
let code = fs.readFileSync('src/features/menu/services/menuService.ts', 'utf-8');

// adding additions to payload
code = code.replace(/badge: payload\.badge \|\| null,/g, 'badge: payload.badge || null,\n      additions: payload.additions || [],');
code = code.replace(/badge: formattedPayload\.badge,/g, 'badge: formattedPayload.badge,\n      additions: formattedPayload.additions || [],');

fs.writeFileSync('src/features/menu/services/menuService.ts', code);
console.log("Updated menuService");
