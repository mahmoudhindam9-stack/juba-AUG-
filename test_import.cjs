const data = require('./public/data/oracle_2015.json');
const validData = data.filter((r) => r.debit > 0 || r.credit > 0);
const openingLines = validData.filter((r) => r.bal_trx === 'BAL');
console.log("Opening lines count:", openingLines.length);
let obDebit = 0, obCredit = 0;
openingLines.forEach(l => { obDebit += l.debit; obCredit += l.credit; });
console.log("Opening Balance -> Debit:", obDebit, "Credit:", obCredit, "Diff:", obDebit - obCredit);
