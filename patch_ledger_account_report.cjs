const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const importedAccountsBefore = new Set')) {
  const marker = '          const newEntries = groupOracleRowsIntoJournalEntries(parsedRows);';
  if (!content.includes(marker)) throw new Error('Oracle import marker not found; refusing unsafe patch.');
  content = content.replace(
    marker,
    '          const importedAccountsBefore = new Set(erpStore.getState().accounts.map((a) => String(a.code)));\n\n' + marker
  );
}

const oldToast = /          toast\(\{\n\s*title: "✅ تم استيراد القيود بنجاح",\n\s*description: `تم إدراج \$\{result\.insertedEntries\} قيد في دفتر اليومية، وإنشاء \$\{result\.newAccountsCreated\} حساب جديد في الدليل العام، وربط \$\{result\.linkedTreasuryTransactions\} حركة مالية بالخزائن الصحيحة\.`,\n\s*\}\);/;
const newToast = `          const importedAccountsCreated = erpStore\n            .getState()\n            .accounts\n            .filter((a) => !importedAccountsBefore.has(String(a.code)))\n            .map((a) => ({ code: a.code, name: a.name_ar }));\n          const accountsSummary = importedAccountsCreated.length\n            ? importedAccountsCreated.map((a) => \"\${a.code} — \${a.name}\").join("، ")\n            : "لا توجد حسابات جديدة";\n\n          toast({\n            title: "✅ تم استيراد القيود بنجاح",\n            description: \`تم إدراج \${result.insertedEntries} قيد، وإنشاء \${result.newAccountsCreated} حساب جديد، وربط \${result.linkedTreasuryTransactions} حركة بالخزائن. الحسابات الجديدة: \${accountsSummary}\`,\n          });`;

if (oldToast.test(content)) {
  content = content.replace(oldToast, newToast);
} else if (!content.includes('const importedAccountsCreated = erpStore')) {
  throw new Error('Import success toast marker not found; refusing unsafe patch.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Import success report now includes the newly created account codes and names.');
