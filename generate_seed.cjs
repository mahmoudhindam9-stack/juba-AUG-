const data = require('./public/data/oracle_2015.json');
const fs = require('fs');

// Filter 0s
const validData = data.filter(r => r.debit > 0 || r.credit > 0);

const entries = [];

// Handle Opening Balances (BAL)
const openingLines = validData.filter(r => r.bal_trx === 'BAL');
if (openingLines.length > 0) {
  entries.push({
    id: 'ORACLE-2015-OPENING',
    branch_id: 'b1',
    date: '2015-01-01T00:00:00.000Z',
    description: 'القيد الافتتاحي - أرصدة أول المدة 2015 (أوراكل)',
    reference: 'OPENING-2015',
    currency: 'EGP',
    created_by: 'Oracle Migration',
    is_approved: true,
    created_at: new Date().toISOString(),
    lines: openingLines.map((line, idx) => ({
      id: `OPENING-LINE-${idx}`,
      account_code: line.account_code,
      debit: line.debit,
      credit: line.credit,
      description: line.description,
      currency: line.currency === 'عملة محلية' ? 'EGP' : line.currency === 'جنيه سودانى' ? 'SSP' : line.currency === 'دولار' ? 'USD' : 'EGP',
      rate: 1
    }))
  });
}

// Handle TRX
const trxLines = validData.filter(r => r.bal_trx === 'TRX');
const groups = {};
trxLines.forEach(line => {
  const jNum = line.journal_number;
  if (!groups[jNum]) {
    groups[jNum] = [];
  }
  groups[jNum].push(line);
});

Object.keys(groups).forEach(jNum => {
  const lines = groups[jNum];
  const firstLine = lines[0];
  
  entries.push({
    id: `ORACLE-2015-${jNum}`,
    branch_id: 'b1',
    date: firstLine.date,
    description: firstLine.main_description || `قيد رقم ${jNum} من أوراكل`,
    reference: `ORACLE-${jNum}`,
    currency: 'EGP',
    created_by: 'Oracle Migration',
    is_approved: true,
    created_at: new Date().toISOString(),
    lines: lines.map((line, idx) => ({
      id: `ORACLE-${jNum}-LINE-${idx}`,
      account_code: line.account_code,
      debit: line.debit,
      credit: line.credit,
      description: line.description,
      currency: line.currency === 'عملة محلية' ? 'EGP' : line.currency === 'جنيه سودانى' ? 'SSP' : line.currency === 'دولار' ? 'USD' : 'EGP',
      rate: 1
    }))
  });
});

fs.writeFileSync('src/shared/data/oracle2015Seed.ts', `
import { JournalEntry } from "../services/erpStore";

export const ORACLE_2015_JOURNALS: JournalEntry[] = ${JSON.stringify(entries, null, 2)};
`, 'utf8');

console.log(`Generated seed file with ${entries.length} journal entries.`);

