// Just touching a file to trigger dev server update if any state is stuck
const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');
content = content + '\n// Force reload';
fs.writeFileSync(path, content, 'utf8');
setTimeout(() => {
    content = content.replace('\n// Force reload', '');
    fs.writeFileSync(path, content, 'utf8');
}, 1000);
