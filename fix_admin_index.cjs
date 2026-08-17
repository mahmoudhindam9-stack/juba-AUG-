const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/index.tsx', 'utf-8');

code = code.replace(/linked_to_restaurant: newTreasuryForm\.linked_to_restaurant,\n        newTreasuryForm\.account_code,\n        account_code: newTreasuryForm\.account_code,/g, 'linked_to_restaurant: newTreasuryForm.linked_to_restaurant,\n        account_code: newTreasuryForm.account_code,');

fs.writeFileSync('src/routes/admin/index.tsx', code);
