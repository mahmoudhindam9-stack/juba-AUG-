import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

content = content.replace(
  `                      <span className="text-lg font-black text-amber-700 dark:text-amber-300 mt-1 block">
                        {bd.walletSSP.toLocaleString()} SSP
                      </span>
                    </div>
                  </div>`,
  `                      <span className="text-lg font-black text-amber-700 dark:text-amber-300 mt-1 block">
                        {bd.walletSSP.toLocaleString()} SSP
                      </span>
                    </div>
                  </div>
                  {selectedTreasuryForDetails.containers && selectedTreasuryForDetails.containers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-bold mb-2">أوعية العملات (Containers)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedTreasuryForDetails.containers.map((cnt: any) => (
                          <div key={cnt.id} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-border">
                            <span className="text-xs text-muted-foreground block">{cnt.name} ({cnt.currency})</span>
                            <span className="text-md font-bold block mt-1">{(cnt.balance || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}`,
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
