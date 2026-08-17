import fs from "fs";

const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleOpenManage()}`,
  `          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsQrModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 shadow-sm"
            >
              <QrCode size={16} />
              {lang === "ar" ? "باركود الطلب الذاتي" : "Self-Order QR"}
            </Button>
            <Button
              onClick={() => handleOpenManage()}`,
);

fs.writeFileSync(path, content, "utf8");
