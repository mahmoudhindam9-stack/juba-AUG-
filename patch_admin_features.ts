import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

// Add useRef
content = content.replace(
  'import { useState, useEffect, useMemo } from "react";',
  'import { useState, useEffect, useMemo, useRef } from "react";\nimport { useToast } from "@/hooks/use-toast";',
);

// Add functions
const functionsStr = `
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const saveDataToDatabase = async () => {
    try {
      const stateToSave = erpStore.getState();
      const { error } = await supabase.from('app_settings' as any).upsert({ id: 'erp_state', data: stateToSave });
      if (error) throw error;
      toast({ title: "تم الحفظ", description: "تم حفظ بيانات البرنامج على قاعدة البيانات بنجاح", variant: "default" });
    } catch (err: any) {
      toast({ title: "خطأ في الحفظ", description: err.message || "يرجى التأكد من وجود جدول app_settings", variant: "destructive" });
    }
  };

  const downloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(erpStore.getState()));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "erp_backup_" + Date.now() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && json.branches) {
          localStorage.setItem('erp_store_state', JSON.stringify(json));
          window.location.reload();
        } else {
          toast({ title: "ملف غير صالح", description: "الرجاء رفع ملف نسخة احتياطية صحيح", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "خطأ", description: "حدث خطأ أثناء قراءة الملف", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };
`;

content = content.replace(
  "function AdminDashboard() {\n  const { formatPrice } = useSettings();",
  "function AdminDashboard() {\n  const { formatPrice } = useSettings();\n" + functionsStr,
);

// Add UI buttons
const buttonsUI = `
        <div className="flex items-center gap-2">
          <Button onClick={saveDataToDatabase} variant="outline" size="sm" className="text-xs h-8">حفظ البيانات</Button>
          <Button onClick={downloadBackup} variant="outline" size="sm" className="text-xs h-8">نسخة احتياطية</Button>
          <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={restoreBackup} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="text-xs h-8">استعادة نسخة</Button>
        </div>
`;

content = content.replace(
  '{/* Branch switcher & reports */}\n        <div className="flex items-center gap-3">',
  '{/* Branch switcher & reports */}\n        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">\n' +
    buttonsUI,
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
