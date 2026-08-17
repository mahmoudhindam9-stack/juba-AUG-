const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<Button\s+variant="default"\s+size="sm"\s+disabled=\{isImportingOracle\}[\s\S]*?<\/Button>\s*<\/div>/m;
const replacement = `
                  <Button
                    variant="default"
                    size="sm"
                    disabled={isImportingOracle}
                    className="gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white w-full pointer-events-none"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {isImportingOracle ? "جاري الاستيراد..." : "رفع ملف قيود أوراكل Excel"}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimeout(() => window.location.reload(), 800);
                  }}
                  className="gap-1.5 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  دمج وتحديث
                </Button>
`;

content = content.replace(regex, replacement.trim());
fs.writeFileSync(path, content, 'utf8');
