const data = require('./public/data/oracle_2015.json');
const validData = data.filter((r) => r.debit > 0 || r.credit > 0);

// Opening Balances
const openingLines = validData.filter((r) => r.bal_trx === 'BAL');
let obDebit = 0, obCredit = 0;
openingLines.forEach(l => { obDebit += l.debit; obCredit += l.credit; });
console.log("Opening Balance -> Debit:", obDebit, "Credit:", obCredit, "Diff:", obDebit - obCredit);

// TRX
const trxLines = validData.filter((r) => r.bal_trx === 'TRX');
const groups = {};
trxLines.forEach(line => {
const jNum = line.journal_number || 'UNKNOWN';
if (!groups[jNum]) groups[jNum] = [];
groups[jNum].push(line);
});

let mismatchCount = 0;
Object.keys(groups).forEach(jNum => {
const lines = groups[jNum];
let d = 0, c = 0;
lines.forEach(l => { d += l.debit; c += l.credit; });
if (Math.abs(d - c) > 0.05) {
    mismatchCount++;
    // console.log(`Journal ${jNum} mismatch -> Debit: ${d}, Credit: ${c}`);
}
});
console.log("Mismatched Journals:", mismatchCount, "out of", Object.keys(groups).length);

