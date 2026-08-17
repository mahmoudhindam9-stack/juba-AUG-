import fs from "fs";

const path = "src/routes/index.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `{/* Quick Settings (Treasury Interface, Lang & Currency) */}`,
  `{/* Quick Settings (Treasury Interface, Lang & Currency) */}
          <Link
            to="/cashier-treasury"
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 rounded-xl px-3 py-1.5 transition shadow-sm text-xs font-bold text-emerald-300"
          >
            <Wallet size={14} className="text-emerald-400" />
            <span>{lang === "ar" ? "خزينة الكاشير" : "Cashier Treasury"}</span>
          </Link>`,
);

fs.writeFileSync(path, content, "utf8");
