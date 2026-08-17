import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");
content = content.replace(/name_ar: "خزينة الكاشير"/g, 'name_ar: "كاشير 1"');
content = content.replace(/\? "خزينة الكاشير"/g, '? "كاشير 1"');
fs.writeFileSync("src/shared/services/erpStore.ts", content);
