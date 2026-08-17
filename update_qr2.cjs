const fs = require('fs');
let code = fs.readFileSync('src/routes/captain.tsx', 'utf-8');

// I need to add badge and additions passing logic somewhere. But first let me look at the table order QR URL
code = code.replace(/const qrUrl = window.location.origin \+ \`\/menu\?table=\$\{qrTableId\}\`;/g, 'const qrUrl = window.location.origin + `/menu?table=${qrTableId}`; // Note: customer additions & badge logic exist in menu.tsx and admin/menu.tsx');

fs.writeFileSync('src/routes/captain.tsx', code);
console.log("Updated captain QR url notes");
