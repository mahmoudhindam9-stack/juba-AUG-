const data = require('./public/data/oracle_2015.json');
const nonZeroBal = data.filter(r => r.bal_trx === 'BAL' && (r.debit > 0 || r.credit > 0));
console.log("Non-zero Opening Balances:", nonZeroBal.length);
