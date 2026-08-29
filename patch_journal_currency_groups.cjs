const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
const src = fs.readFileSync(path, 'utf8');

const importLine = 'import { JournalEntryCurrencyGroups } from "@/components/JournalEntryCurrencyGroups";';
if (!src.includes(importLine)) {
  const anchor = 'import { Separator } from "@/components/ui/separator";';
  if (!src.includes(anchor)) throw new Error('Could not find ledger import anchor');
  fs.writeFileSync(path, src.replace(anchor, `${anchor}\n${importLine}`));
}

let updated = fs.readFileSync(path, 'utf8');
const start = updated.indexOf('        {/* Entry Lines */}');
const endMarker = '        {/* Bottom Balance Difference Bar */}';
const end = updated.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Could not find journal entry lines block');

const replacement = `        {/* Entry Lines - grouped by currency */}\n        <JournalEntryCurrencyGroups\n          entry={entry}\n          accounts={accounts}\n          formatCurrency={formatCurrency}\n          getLineBaseValue={getLineBaseValue}\n          totalBaseDebit={totalBaseDebit}\n          totalBaseCredit={totalBaseCredit}\n          isBalanced={isBalanced}\n        />\n\n`;

updated = updated.slice(0, start) + replacement + updated.slice(end);
fs.writeFileSync(path, updated);
console.log('Journal currency grouping applied successfully.');
