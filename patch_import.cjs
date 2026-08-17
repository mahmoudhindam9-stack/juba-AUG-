const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/erpStore\.addJournalEntry\(je\);/g, `
          erpStore.addJournalEntry(
            je.description,
            je.lines,
            je.reference,
            je.currency,
            je.date,
            je.id
          );
`);

fs.writeFileSync(path, content, 'utf8');
