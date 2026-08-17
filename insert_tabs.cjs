const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/accounts.tsx', 'utf-8');

if (!code.includes('import { Tabs')) {
  code = code.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\nimport { OracleAccountsViewer } from "@/components/admin/OracleAccountsViewer";\nimport { Button } from "@/components/ui/button";'
  );
}

const targetPoint = '      {/* Summary KPI Cards */}';
const targetIndex = code.indexOf(targetPoint);

if (targetIndex !== -1) {
  const tabsStart = `
      <Tabs defaultValue="oracle_tree" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl flex w-full max-w-xl mx-auto mb-6">
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

  // We wrap the rest of the file in the TabsContent
  // The rest of the page ends with:
  //       </Dialog>
  //     </div>
  //   );
  // }
  
  const divEndIndex = code.lastIndexOf('</div>\n  );\n}');
  
  if (divEndIndex !== -1) {
    let newCode = code.substring(0, targetIndex) + tabsStart + code.substring(targetIndex, divEndIndex) + '\n        </TabsContent>\n      </Tabs>\n      </div>\n  );\n}';
    fs.writeFileSync('src/routes/admin/accounts.tsx', newCode);
    console.log("Successfully added tabs.");
  } else {
    console.log("Could not find end div.");
  }
} else {
  console.log("Could not find Summary KPI Cards");
}
