const fs = require('fs');
const path = 'src/routes/menu.tsx';
let content = fs.readFileSync(path, 'utf8');

// revert the mistakes:
content = content.replace(/p\.selectedAddition\(s: any\)/g, "p.selectedAdditions");
content = content.replace(/selectedAddition\(s: any\)/g, "selectedAdditions");
content = content.replace(/statu\(s: any\)/g, "status");
content = content.replace(/\(s: any, /g, "(s, ");
content = content.replace(/\(a: any\) => /g, "a => ");
content = content.replace(/\(s: any\) => /g, "s => ");

fs.writeFileSync(path, content, 'utf8');
