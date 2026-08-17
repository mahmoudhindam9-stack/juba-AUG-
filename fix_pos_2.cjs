const fs = require('fs');
const path = 'src/routes/pos.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/c\.\(item as any\)/g, "(c.item as any)");

fs.writeFileSync(path, content, 'utf8');
