import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

// 1. Add new functions
const newFunctions = `
  const systemUpdateRef = useRef<HTMLInputElement>(null);

  const exportSystemUpdate = () => {
    const systemData = {
      type: "system_update",
      timestamp: Date.now(),
      erp_state: erpStore.getState(),
      local_orders: localStorage.getItem('pos_local_orders'),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "system_update_" + Date.now() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importSystemUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && json.type === "system_update" && json.erp_state) {
          localStorage.setItem('erp_store_state', JSON.stringify(json.erp_state));
          if (json.local_orders) localStorage.setItem('pos_local_orders', json.local_orders);
          toast({ title: "تم التحديث", description: "تم دمج التحديث وتشغيله بنجاح", variant: "default" });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({ title: "ملف غير صالح", description: "الرجاء رفع ملف تحديث نظام صحيح", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "خطأ", description: "حدث خطأ أثناء قراءة الملف", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };
`;

content = content.replace(
  "  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {",
  newFunctions + "\n  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {",
);

// 2. Remove buttons from header
content = content.replace(
  / {8}<div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">\n {8}<div className="flex items-center gap-2">[\s\S]*? {8}<\/div>\n/,
  '        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">\n',
);

// 3. Add Tab Trigger
const triggerStr = `
          <TabsTrigger value="audit_logs" className="rounded-lg font-bold py-2 px-4">
            <History size={16} className="ml-1.5 inline" />
            سجل العمليات والرقابة الأمنية
          </TabsTrigger>
          <TabsTrigger value="system_update" className="rounded-lg font-bold py-2 px-4 bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <RefreshCw size={16} className="ml-1.5 inline" />
            تحديث السيستم
          </TabsTrigger>`;
content = content.replace(
  / {10}<TabsTrigger value="audit_logs" className="rounded-lg font-bold py-2 px-4">\s*<History size=\{16\} className="ml\.1\.5 inline" \/>\s*سجل العمليات والرقابة الأمنية\s*<\/TabsTrigger>/,
  triggerStr,
);

// 4. Add Tab Content
const contentStr = `
        {/* TAB: SYSTEM UPDATE */}
        <TabsContent value="system_update" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/40 pb-4">
                <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <Database size={20} className="text-primary" />
                  إدارة البيانات والنسخ الاحتياطي
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground">
                  أدوات لحفظ النسخ الاحتياطية واستعادتها من قاعدة البيانات أو كملف محلي
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl">
                    <h4 className="font-bold text-sm mb-1 text-blue-800 dark:text-blue-300">حفظ سحابي</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">حفظ جميع المتغيرات وبيانات النظام على قاعدة البيانات السحابية (Supabase)</p>
                    <Button onClick={saveDataToDatabase} className="w-full gap-2 font-bold shadow-sm">
                      <Save size={16} />
                      حفظ البيانات الآن
                    </Button>
                  </div>
                  
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
                    <h4 className="font-bold text-sm mb-1 text-emerald-800 dark:text-emerald-300">نسخة احتياطية محلية</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">تصدير واستيراد البيانات كملف JSON لضمان حفظ نسخة على جهازك</p>
                    <div className="flex gap-2">
                      <Button onClick={downloadBackup} variant="outline" className="flex-1 gap-2 font-bold border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        <Download size={16} />
                        تنزيل نسخة
                      </Button>
                      <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={restoreBackup} />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 gap-2 font-bold border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        <Upload size={16} />
                        استعادة نسخة
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/40 pb-4">
                <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <RefreshCw size={20} className="text-amber-500" />
                  تحديثات النظام والأكواد
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground">
                  تصدير التحديثات البرمجية أو دمج تحديث جديد مع الملف الحالي لتشغيله بدون أخطاء
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-5 rounded-xl space-y-4 text-center h-full flex flex-col justify-center">
                  <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-2">
                    <Code size={28} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-black text-lg text-amber-800 dark:text-amber-300">إدارة التحديثات</h4>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 max-w-sm mx-auto leading-relaxed">
                    نسخ جميع المتغيرات والأكواد المعدلة وتنزيلها محلياً، أو دمج تحديث جديد مع النسخة الحالية لتشغيله مباشرة بدون مشاكل.
                  </p>
                  
                  <div className="flex flex-col gap-3 mt-4 pt-2">
                    <Button onClick={exportSystemUpdate} className="w-full gap-2 font-bold shadow-sm bg-amber-600 hover:bg-amber-700 text-white">
                      <Download size={16} />
                      تصدير آخر تحديث للسيستم
                    </Button>
                    <input type="file" accept=".json" ref={systemUpdateRef} className="hidden" onChange={importSystemUpdate} />
                    <Button onClick={() => systemUpdateRef.current?.click()} variant="outline" className="w-full gap-2 font-bold border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      <Upload size={16} />
                      تحميل تحديث السيستم
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
`;

content = content.replace(
  "        </TabsContent>\n      </Tabs>",
  "        </TabsContent>\n" + contentStr + "\n      </Tabs>",
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
