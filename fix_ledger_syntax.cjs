const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<h3 className="text-sm font-semibold text-foreground">[\s\S]*?دمج وتحديث\s*<\/Button>/m;
const replacement = `<h3 className="text-sm font-semibold text-foreground">
                      أسطر الحركة المالية (Double-Entry lines)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewEntryLines([
                          ...newEntryLines,
                          {
                            account_code: "",
                            debit: 0,
                            credit: 0,
                            description: "",
                            currency: "EGP",
                            rate: 1,
                          },
                        ])
                      }
                      className="gap-1.5 rounded-xl border-dashed"
                    >
                      <PlusCircle className="h-4 w-4" />
                      إضافة سطر
                    </Button>
                  </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
