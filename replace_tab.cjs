const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/index.tsx', 'utf-8');

const startStr = '{/* TAB 4: CHART OF ACCOUNTS (دليل الحسابات المحاسبي المحترف) */}';
const endStr = '</TabsContent>';

const startIndex = code.indexOf(startStr);
const tabsContentStart = code.indexOf('<TabsContent value="chart_of_accounts"', startIndex);
const nextTabsContent = code.indexOf('<TabsContent', tabsContentStart + 10);
let endIndex = code.lastIndexOf('</TabsContent>', nextTabsContent !== -1 ? nextTabsContent : code.length);

if (startIndex !== -1 && endIndex !== -1) {
  const newSection = `        {/* TAB 4: CHART OF ACCOUNTS (دليل الحسابات المحاسبي المحترف) */}
        <TabsContent value="chart_of_accounts" className="space-y-6 mt-4">
          <OracleAccountsViewer />
        </TabsContent>`;
  
  // We need to find the correct closing tag for THIS tab content
  // Since we know the order, let's just use string replace using a regex
  
  let newCode = code.substring(0, startIndex) + newSection + code.substring(endIndex + '</TabsContent>'.length);
  fs.writeFileSync('src/routes/admin/index.tsx', newCode);
  console.log("Successfully replaced the tab content!");
} else {
  console.log("Could not find boundaries.");
}
