const fs = require('fs');
const path = 'src/routes/admin/index.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/function AdminDashboard\(\) \{/, 'export function AdminDashboard() {');

fs.writeFileSync(path, content, 'utf8');
