const fs = require('fs');
let content = fs.readFileSync('src/shared/data/oracle2015Seed.ts', 'utf8');
content = content.replace(/\"id\":\s*\"[^\"]*\",\n\s*/g, "");
fs.writeFileSync('src/shared/data/oracle2015Seed.ts', content, 'utf8');
