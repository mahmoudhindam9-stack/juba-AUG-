const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/accounts.tsx', 'utf-8');

if (!code.includes('import { Tabs')) {
  code = code.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\nimport { OracleAccountsViewer } from "@/components/admin/OracleAccountsViewer";\nimport { Button } from "@/components/ui/button";'
  );
}

const returnIndex = code.indexOf('return (');
if (returnIndex !== -1) {
  const innerIndex = code.indexOf('<div className="space-y-6 pb-12"', returnIndex);
  
  if (innerIndex !== -1) {
    const afterHeaderIndex = code.indexOf('</p>\n          </div>\n        </div>\n      </div>', innerIndex);
    
    if (afterHeaderIndex !== -1) {
      const insertionPoint = afterHeaderIndex + '</p>\n          </div>\n        </div>\n      </div>'.length;
      
      const tabsStart = `
      <Tabs defaultValue="oracle_tree" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl flex">
          <TabsTrigger value="oracle_tree" className="flex-1 rounded-lg font-bold">
            <Layers size={16} className="ml-2 inline" />
            دليل الحسابات (شجرة أوراكل)
          </TabsTrigger>
          <TabsTrigger value="system_accounts" className="flex-1 rounded-lg font-bold">
            <SlidersHorizontal size={16} className="ml-2 inline" />
            إدارة الحسابات النشطة (قائمة النظام)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oracle_tree" className="mt-4">
          <OracleAccountsViewer />
        </TabsContent>

        <TabsContent value="system_accounts" className="space-y-6 mt-4">
`;
      
      const divEndIndex = code.lastIndexOf('</div>\n  );');
      
      let newCode = code.substring(0, insertionPoint) + tabsStart + code.substring(insertionPoint, divEndIndex) + '\n        </TabsContent>\n      </Tabs>\n' + code.substring(divEndIndex);
      
      fs.writeFileSync('src/routes/admin/accounts.tsx', newCode);
      console.log("Successfully wrapped accounts in tabs.");
    } else {
      console.log("Could not find header.");
    }
  }
}
