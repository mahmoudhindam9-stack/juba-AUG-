const fs = require('fs');
const path = 'src/routes/cashier-treasury.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/cnt\.type/g, "cnt.category");
content = content.replace(/acc\.type/g, "acc.category"); // if it's TreasuryContainer
content = content.replace(/tx\.date/g, "tx.timestamp");
content = content.replace(/t\.date/g, "t.timestamp");
content = content.replace(/transaction\.date/g, "transaction.timestamp");
content = content.replace(/trx\.date/g, "trx.timestamp");
content = content.replace(/x\.date/g, "x.timestamp");

fs.writeFileSync(path, content, 'utf8');
