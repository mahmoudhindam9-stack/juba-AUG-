const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const candidates = [
  'src/shared/services/erpStore.ts',
  'src/features/ledger/JournalImport.tsx',
  'src/features/ledger/JournalImport.jsx',
  'src/components/JournalImport.tsx',
  'src/components/JournalImport.jsx',
  'src/routes/ledger.tsx',
];

for (const rel of candidates) {
  const file = path.join(root, rel);
  if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    console.log(`FOUND ${rel} (${text.length} chars)`);
    for (const needle of ['journal_number', 'journalNumber', 'accountCount', 'createdAccounts', 'created accounts', 'Import']) {
      const i = text.toLowerCase().indexOf(needle.toLowerCase());
      if (i >= 0) console.log(`  ${needle}: ${text.slice(Math.max(0,i-180), i+320).replace(/\n/g,' ')}`);
    }
  }
}
