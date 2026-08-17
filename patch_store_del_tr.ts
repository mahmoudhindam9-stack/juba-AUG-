import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

content = content.replace(
  '  deleteTreasury(id: string) {\n    const tr = this.state.treasuries.find((t) => t.id === id);\n    if (tr) {\n      if (tr.is_open) {\n        throw new Error(\n          "لا يمكن حذف الخزينة وهي مفتوحة للتشغيل اليومي. يرجى إغلاقها أولاً من قائمة التحكم.",\n        );\n      }\n      if (tr.balance !== 0) {\n        throw new Error(\n          `لا يمكن حذف الخزينة وهي تحتوي على رصيد مالي نشط (${tr.balance.toLocaleString()} ${tr.currency}). يرجى تصفية الرصيد أو تحويله بالكامل إلى خزينة/حساب آخر أولاً لتجنب حدوث عجز أو اختلافات في الدفاتر المحاسبية والتقارير المالية للفرع.`,\n        );\n      }\n      tr.deleted = true;\n      this.saveState();\n      this.logAction(\n        "ADMIN",\n        "حذف خزينة (حذف مؤقت)",\n        `تم حذف الخزينة ${tr.name_ar} مؤقتاً`,\n        "DELETE",\n      );\n    }\n  }',
  `  deleteTreasury(id: string) {
    const trIndex = this.state.treasuries.findIndex((t) => t.id === id);
    const tr = this.state.treasuries[trIndex];
    if (tr) {
      if (tr.is_open) {
        throw new Error("لا يمكن حذف الخزينة وهي مفتوحة للتشغيل اليومي. يرجى إغلاقها أولاً من قائمة التحكم.");
      }
      if (tr.balance !== 0) {
        throw new Error(\`لا يمكن حذف الخزينة وهي تحتوي على رصيد مالي نشط (\${tr.balance.toLocaleString()} \${tr.currency}).\`);
      }
      
      const hasTxs = this.state.treasuryTransactions.some(tx => tx.treasury_id === id);
      if (hasTxs) {
        tr.deleted = true;
      } else {
        this.state.treasuries.splice(trIndex, 1);
      }
      
      this.saveState();
      this.logAction("ADMIN", "حذف خزينة", \`تم حذف الخزينة \${tr.name_ar}\`, "DELETE");
    }
  }`,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
