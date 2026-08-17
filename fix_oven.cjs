const fs = require('fs');
const path = 'src/routes/oven.tsx';
let content = fs.readFileSync(path, 'utf8');

// The error is:
// oven.tsx(111,39): error TS2339: Property 'id' does not exist on type 'TableCartLine'.
content = content.replace(/line\.id/g, "line.item.id");
content = content.replace(/line\.name_ar/g, "line.item.name_ar");
content = content.replace(/line\.requires_oven/g, "line.item.requires_oven");

fs.writeFileSync(path, content, 'utf8');
