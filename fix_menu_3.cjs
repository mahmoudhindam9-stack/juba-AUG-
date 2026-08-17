const fs = require('fs');
const path = 'src/routes/menu.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/useState<\{ item: MenuItem; quantity: number \}\[\]>/g, "useState<any[]>");

fs.writeFileSync(path, content, 'utf8');
