import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

content = content.replace(
  `                                  <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full border border-primary/20">
                                    {tr.currency === "MULTI"
                                      ? "متعدد العملات (Multi)"
                                      : tr.currency}
                                  </span>`,
  `                                  <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full border border-primary/20">
                                    {tr.currency === "MULTI"
                                      ? "متعدد العملات (Multi)"
                                      : tr.currency}
                                  </span>
                                  {tr.containers && tr.containers.length > 0 && (
                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                                      {tr.containers.length} أوعية
                                    </span>
                                  )}`,
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
