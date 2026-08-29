const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const importedAccountsBefore')) {
  content = content.replace(
    /let count = 0;\n\s*let linesCount = 0;/,
    `let count = 0;\n          let linesCount = 0;\n          const importedAccountsBefore = new Set(erpStore.getState().accounts.map((a) => String(a.code)));`
  );
}

const oldGrouping = /const groups = \{\};\n\s*trxLines\.forEach\(line => \{\n\s*const jNum = line\.journal_number \|\| 'UNKNOWN';\n\s*if \(!groups\[jNum\]\) groups\[jNum\] = \[\];\n\s*groups\[jNum\]\.push\(line\);\n\s*\}\);\n\n\s*Object\.keys\(groups\)\.forEach\(jNum => \{[\s\S]*?\n\s*\}\);/;

const newGrouping = `const groups = {};\n          trxLines.forEach((line) => {\n            const d = new Date(line.date);\n            const year = Number.isNaN(d.getTime()) ? "0000" : String(d.getUTCFullYear());\n            const month = Number.isNaN(d.getTime()) ? "01" : String(d.getUTCMonth() + 1).padStart(2, "0");\n            const periodKey = \"\${year}-\${month}\";\n            if (!groups[periodKey]) groups[periodKey] = [];\n            groups[periodKey].push(line);\n          });\n\n          // Oracle journal numbers are YY-independent within each calendar year:\n          // MM/01, MM/02, ... reset for every month and every year.\n          Object.keys(groups)\n            .sort()\n            .forEach((periodKey) => {\n              const lines = groups[periodKey].slice().sort((a, b) => {\n                const da = new Date(a.date).getTime() || 0;\n                const db = new Date(b.date).getTime() || 0;\n                if (da !== db) return da - db;\n                return String(a.journal_number || \"\").localeCompare(String(b.journal_number || \"\"), undefined, { numeric: true });\n              });\n\n              // Keep original Oracle journal groups intact, but order them by their first date.\n              const journalGroups = [];\n              const byOriginal = new Map();\n              lines.forEach((line) => {\n                const original = String(line.journal_number || \"UNKNOWN\");\n                if (!byOriginal.has(original)) {\n                  const group = [];\n                  byOriginal.set(original, group);\n                  journalGroups.push(group);\n                }\n                byOriginal.get(original).push(line);\n              });\n              journalGroups.sort((a, b) => {\n                const da = new Date(a[0]?.date).getTime() || 0;\n                const db = new Date(b[0]?.date).getTime() || 0;\n                if (da !== db) return da - db;\n                return String(a[0]?.journal_number || \"\").localeCompare(String(b[0]?.journal_number || \"\"), undefined, { numeric: true });\n              });\n\n              journalGroups.forEach((groupLines, index) => {\n                const firstLine = groupLines[0];\n                const d = new Date(firstLine.date);\n                const month = Number.isNaN(d.getTime()) ? String(periodKey).slice(5, 7) : String(d.getUTCMonth() + 1).padStart(2, "0");\n                const normalizedJournalNumber = \"\${month}/\${String(index + 1).padStart(2, "0")}\";\n                const entryId = \`ORACLE-\${periodKey}-\${String(index + 1).padStart(4, "0")}\`;\n\n                erpStore.addJournalEntry(\n                  firstLine.main_description || \`قيد رقم \${normalizedJournalNumber} من أوراكل\`,\n                  groupLines.map((line) => ({\n                    account_code: line.account_code,\n                    debit: line.debit,\n                    credit: line.credit,\n                    description: line.description,\n                    currency: line.currency === 'عملة محلية' ? 'EGP' : line.currency === 'جنيه سودانى' ? 'SSP' : line.currency === 'دولار' ? 'USD' : 'EGP',\n                    rate: 1\n                  })),\n                  entryId,\n                  'EGP',\n                  firstLine.date,\n                  \`ORACLE-TRX-\${periodKey}-\${String(index + 1).padStart(4, "0")}\`\n                );\n                count++;\n                linesCount += groupLines.length;\n              });\n            });`;

if (oldGrouping.test(content)) {
  content = content.replace(oldGrouping, newGrouping);
} else if (!content.includes('normalizedJournalNumber')) {
  throw new Error('Oracle journal grouping block was not found; refusing unsafe patch.');
}

if (!content.includes('const importedAccountsCreated')) {
  content = content.replace(
    /alert\(\\`تم استيراد \\$\{count\} قيد \(بإجمالي \\$\{linesCount\} سطر\) من الملف \\$\{file\.name\} بنجاح!\\`\);/,
    `const importedAccountsCreated = erpStore.getState().accounts\n            .filter((a) => !importedAccountsBefore.has(String(a.code)))\n            .map((a) => \"\${a.code} — \${a.name_ar}\");\n          const accountsReport = importedAccountsCreated.length\n            ? \`\\nالحسابات الجديدة (\${importedAccountsCreated.length}):\\n\${importedAccountsCreated.join("\\n")}\`\n            : "\\nلم يتم إنشاء حسابات جديدة.";\n          alert(\`تم استيراد \${count} قيد (بإجمالي \${linesCount} سطر) من الملف \${file.name} بنجاح!\${accountsReport}\`);`
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Applied journal numbering and created-account report patch.');
