const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<Button\s+variant="outline"\s+size="sm"\s+onClick=\{\(\) => \{\s+setTimeout\(\(\) => window\.location\.reload\(\), 800\);\s+\}\}[\s\S]*?دمج وتحديث\s*<\/Button>/m;

const newBtn = `<Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const store = useERPStore.getState();
                    
                    const existingCodes = new Set(store.accounts.map(a => a.code));
                    const newAccs = [];
                    store.journalEntries.forEach(je => {
                        if (je.id.startsWith("ORACLE")) {
                            je.lines.forEach(l => {
                                if (!existingCodes.has(l.account_code) && l.account_code.trim() !== "") {
                                    existingCodes.add(l.account_code);
                                    
                                    let type = "asset";
                                    if (l.account_code.startsWith("3")) type = "expense";
                                    else if (l.account_code.startsWith("2")) type = "liability";
                                    else if (l.account_code.startsWith("4")) type = "revenue";
                                    else if (l.account_code.startsWith("5")) type = "equity";
                                    
                                    newAccs.push({
                                        id: \`acc-oracle-\${l.account_code}\`,
                                        code: l.account_code,
                                        name_ar: \`حساب أوراكل مستورد (\${l.account_code})\`,
                                        type: type,
                                        level: 3,
                                        system_binding: "none",
                                        currency: l.currency || "EGP",
                                        initial_balance: 0,
                                    });
                                }
                            });
                        }
                    });
                    
                    if (newAccs.length > 0) {
                        useERPStore.setState(state => ({
                            accounts: [...state.accounts, ...newAccs]
                        }));
                    }
                    
                    toast({
                      title: "تم استخراج الحسابات وتحديث النظام",
                      description: \`تم توليد \${newAccs.length} حساب جديد ودمجهم بنجاح.\`,
                    });
                    setTimeout(() => window.location.reload(), 1500);
                  }}
                  className="gap-1.5 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  تأكيد ودمج السجلات
                </Button>`;

if (content.match(regex)) {
    content = content.replace(regex, newBtn);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success");
} else {
    console.log("Could not match regex");
}
