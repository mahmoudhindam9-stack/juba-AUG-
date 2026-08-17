import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

const containerUI = `
                      <div className="sm:col-span-5 flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                          <Label className="text-xs font-bold">أوعية العملات (Currency Containers)</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold"
                            onClick={() => {
                              setNewTreasuryForm(s => ({
                                ...s,
                                containers: [...s.containers, { id: "cnt-" + Date.now(), name: "", currency: "SSP", balance: 0 }]
                              }))
                            }}
                          >
                            + إضافة وعاء عملة جديد
                          </Button>
                        </div>
                        {newTreasuryForm.containers.map((cnt, idx) => (
                          <div key={cnt.id} className="grid grid-cols-4 gap-2 items-center bg-muted/50 p-2 rounded border border-border/50 text-right">
                            <Input 
                              placeholder="اسم الوعاء (مثال: كاش جنوب سوداني)" 
                              className="h-8 text-xs font-bold text-right"
                              value={cnt.name}
                              onChange={e => {
                                const newArr = [...newTreasuryForm.containers];
                                newArr[idx].name = e.target.value;
                                setNewTreasuryForm(s => ({...s, containers: newArr}));
                              }}
                            />
                            <select 
                              className="h-8 rounded-md border border-input bg-background px-1.5 text-xs font-bold text-right"
                              value={cnt.currency}
                              onChange={e => {
                                const newArr = [...newTreasuryForm.containers];
                                newArr[idx].currency = e.target.value;
                                setNewTreasuryForm(s => ({...s, containers: newArr}));
                              }}
                            >
                              <option value="SSP">SSP (جنيه جنوب سوداني)</option>
                              <option value="USD">USD (دولار أمريكي)</option>
                              <option value="EGP">EGP (جنيه مصري)</option>
                              <option value="EUR">EUR (يورو)</option>
                            </select>
                            <Input 
                              type="number"
                              placeholder="الرصيد الافتتاحي" 
                              className="h-8 text-xs font-bold text-right"
                              disabled={!!editingTreasuryId}
                              value={cnt.balance}
                              onChange={e => {
                                const newArr = [...newTreasuryForm.containers];
                                newArr[idx].balance = Number(e.target.value);
                                setNewTreasuryForm(s => ({...s, containers: newArr}));
                              }}
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={() => {
                                const newArr = [...newTreasuryForm.containers];
                                newArr.splice(idx, 1);
                                setNewTreasuryForm(s => ({...s, containers: newArr}));
                              }}
                            >
                              حذف الوعاء
                            </Button>
                          </div>
                        ))}
                      </div>
`;

content = content.replace(
  '                      <div className="flex gap-2">',
  containerUI + '\n                      <div className="flex gap-2 sm:col-span-5">',
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
