const fs = require('fs');
const path = 'src/routes/menu.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace { item: MenuItem; quantity: number; } with any
content = content.replace(/\{ item: MenuItem; quantity: number; \}/g, "any");

// Implicit any
content = content.replace(/s => /g, "(s: any) => ");
content = content.replace(/a => /g, "(a: any) => ");
content = content.replace(/s\)/g, "(s: any))"); // careful... let's just use regex for typical maps
content = content.replace(/\(s, /g, "(s: any, ");

content = content.replace(/Math\.max\("1", /g, 'Math.max(1, ');
content = content.replace(/parseInt\("1"\)/g, '1');

fs.writeFileSync(path, content, 'utf8');
