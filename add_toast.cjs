const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /onClick=\{.*?setTimeout\(\(\) => window\.location\.reload\(\), 800\);\s*\}\}/s;
const replacement = `onClick={() => {
                    toast({
                      title: "تم تحديث البيانات",
                      description: "تم دمج السجلات وتحديث الشاشة بنجاح.",
                    });
                    setTimeout(() => window.location.reload(), 1500);
                  }}`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
