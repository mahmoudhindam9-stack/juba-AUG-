const fs = require('fs');
const path = 'src/shared/utils/oracleParser.ts';
let content = fs.readFileSync(path, 'utf8');

// Journal numbers repeat every period/year. Never merge rows from different
// dates merely because Oracle reused the same journal number.
const old = '    const key = journalNum ? `j_${journalNum}` : `bal_${cleanText(row.account_code) || "?"}`;';
const replacement = '    const dateKey = cleanText(row.date) || "NO_DATE";\n    const key = journalNum\n      ? `j_${dateKey}_${period}_${journalNum}`\n      : `bal_${dateKey}_${period}_${cleanText(row.account_code) || "?"}`;';
if (content.includes(old)) content = content.replace(old, replacement);
else if (!content.includes('const dateKey = cleanText(row.date)')) throw new Error('Oracle grouping key marker not found');

fs.writeFileSync(path, content, 'utf8');
console.log('Oracle journal grouping is now isolated by date/period/journal number.');
