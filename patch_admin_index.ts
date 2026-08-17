import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

// 1. Remove the TabsTrigger for system_update
content = content.replace(/<TabsTrigger value="system_update"[\s\S]*?<\/TabsTrigger>/, "");

// 2. Remove the TabsContent for system_update
const tabContentRegex =
  /\{\/\* TAB: SYSTEM UPDATE \*\/\}\s*<TabsContent value="system_update"[\s\S]*?<\/TabsContent>\s*<\/Tabs>/;
content = content.replace(tabContentRegex, "</Tabs>");

// 3. Remove the new functions we added to AdminDashboard
const exportRegex =
  /const systemUpdateRef = useRef<HTMLInputElement>\(null\);[\s\S]*?reader\.readAsText\(file\);\s*\};/m;
content = content.replace(exportRegex, "");

const backupRegex =
  /const fileInputRef = useRef<HTMLInputElement>\(null\);[\s\S]*?reader\.readAsText\(file\);\s*\};/m;
content = content.replace(backupRegex, "");

fs.writeFileSync("src/routes/admin/index.tsx", content);
