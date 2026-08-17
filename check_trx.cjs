const data = require('./public/data/oracle_2015.json');
const noJournal = data.filter(r => r.bal_trx === 'TRX' && !r.journal_number && (r.debit > 0 || r.credit > 0));
console.log("TRX with no journal number:", noJournal.length);
