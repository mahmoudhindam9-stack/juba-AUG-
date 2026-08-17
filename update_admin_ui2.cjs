const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/index.tsx', 'utf-8');

const newField = `
                      <div className="text-right">
                        <Label className="text-[10px] font-bold">ربط بحساب الدليل المحاسبي (اختياري)</Label>
                        <select
                          className="mt-1 w-full h-8 rounded-md border border-input bg-background px-1.5 text-[10px] font-bold focus:outline-none text-right"
                          value={newTreasuryForm.account_code || ""}
                          onChange={(e) =>
                            setNewTreasuryForm((s) => ({ ...s, account_code: e.target.value }))
                          }
                        >
                          <option value="">-- بدون ربط --</option>
                          {oracleAccounts
                            .filter(acc => acc.type === "asset" || acc.type === "liability")
                            .map((acc) => (
                              <option key={acc.code} value={acc.code}>
                                {acc.code} - {acc.name_ar}
                              </option>
                          ))}
                        </select>
                      </div>`;

if (!code.includes('ربط بحساب الدليل المحاسبي')) {
  code = code.replace(/<div className="text-right">\s*<Label className="text-\[10px\] font-bold">الرصيد الافتتاحي<\/Label>/, newField + '\n                      <div className="text-right">\n                        <Label className="text-[10px] font-bold">الرصيد الافتتاحي</Label>');
}

fs.writeFileSync('src/routes/admin/index.tsx', code);
