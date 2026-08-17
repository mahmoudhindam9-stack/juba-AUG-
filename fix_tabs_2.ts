import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

// 2. Add TabsTrigger
const triggerRegex =
  /<TabsTrigger value="audit_logs" className="rounded-lg font-bold py-2 px-4">\s*<History size=\{16\} className="ml-1\.5 inline" \/>\s*سجل العمليات والرقابة الأمنية\s*<\/TabsTrigger>/g;
const newTrigger = `<TabsTrigger value="audit_logs" className="rounded-lg font-bold py-2 px-4">
            <History size={16} className="ml-1.5 inline" />
            سجل العمليات والرقابة الأمنية
          </TabsTrigger>
          <TabsTrigger value="system_update" className="rounded-lg font-bold py-2 px-4 bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <RefreshCw size={16} className="ml-1.5 inline" />
            تحديث السيستم
          </TabsTrigger>`;
content = content.replace(triggerRegex, newTrigger);

fs.writeFileSync("src/routes/admin/index.tsx", content);
