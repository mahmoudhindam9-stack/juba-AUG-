const fs = require('fs');
let code = fs.readFileSync('src/features/menu/services/menuService.ts', 'utf-8');

code = code.replace(/          delete fallbackPayload\.requires_oven;/g, '          delete fallbackPayload.requires_oven;\n          delete fallbackPayload.badge;\n          delete fallbackPayload.additions;');

fs.writeFileSync('src/features/menu/services/menuService.ts', code);
console.log("Fixed fallback");
