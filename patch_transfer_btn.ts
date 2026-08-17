import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `            <Button
              onClick={() => handleSyncSales(true)}`,
  `            <Button
              onClick={() => setTransferDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <ArrowLeftRight size={16} />
              <span>{lang === "ar" ? "تحويل نقدية / إنهاء الشيفت" : "Transfer / End Shift"}</span>
            </Button>

            <Button
              onClick={() => handleSyncSales(true)}`,
);

fs.writeFileSync(path, content, "utf8");
