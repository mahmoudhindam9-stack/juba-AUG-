import fs from "fs";

const path = "src/routes/index.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuExportOpen(true)}
              className="flex items-center gap-2 bg-primary-foreground/15 hover:bg-primary-foreground/25 backdrop-blur border border-primary-foreground/20 text-primary-foreground text-sm font-bold px-4 py-3 rounded-2xl transition active:scale-95 shadow-sm"
              title={lang === "ar" ? "تصدير وطباعة المنيو" : "Export Menu"}
            >
              <Sparkles size={18} className="text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">
                {lang === "ar" ? "تصدير المنيو" : "Export Menu"}
              </span>
            </button>
          </div>`,
  ``,
);

fs.writeFileSync(path, content, "utf8");
