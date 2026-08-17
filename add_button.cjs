const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add RefreshCw to lucide-react imports
content = content.replace(/\} from "lucide-react";/, '  RefreshCw,\n} from "lucide-react";');

// Add the button
const buttonHtml = `
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "تم الدمج والتحديث بنجاح",
                      description: "تم تحديث البيانات ودمج القيود الجديدة بشكل كامل.",
                    });
                    setTimeout(() => window.location.reload(), 800);
                  }}
                  className="gap-1.5 rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  دمج وتحديث
                </Button>
`;

content = content.replace(/<\/Button>\s*<\/div>/, '</Button>\n                </div>' + buttonHtml);

fs.writeFileSync(path, content, 'utf8');
