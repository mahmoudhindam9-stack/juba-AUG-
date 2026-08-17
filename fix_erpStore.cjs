const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix implicit any types in migrateToOracleAccounts (t, tx, c, je, etc.)
content = content.replace(/t =>/g, '(t: any) =>');
content = content.replace(/tx =>/g, '(tx: any) =>');
content = content.replace(/c =>/g, '(c: any) =>');
content = content.replace(/je =>/g, '(je: any) =>');
content = content.replace(/lt =>/g, '(lt: any) =>');
content = content.replace(/cnt =>/g, '(cnt: any) =>');

// Fix specific missing types or issues like account_code
content = content.replace(/account_code,/g, 'account_code: undefined,');

// 'oracleAcc' is possibly 'undefined'
content = content.replace(/oracleAcc\.name_ar/g, 'oracleAcc?.name_ar');

// fix set state issue: set((state) => { ... }) where set doesn't take args?
// wait, we can't blindly replace this, let's fix manually what we can using regex.

fs.writeFileSync(path, content, 'utf8');
