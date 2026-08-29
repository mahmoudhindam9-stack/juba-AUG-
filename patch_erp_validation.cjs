const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');

// Fail closed on journal integrity: imported and normal journals use the same
// double-entry validation. Legacy Oracle IDs must never bypass accounting checks.
const regex = /if \(Math\.abs\(totalDebit - totalCredit\) > 0\.5\) \{\s*console\.error\([\s\S]*?\n\s*\}\n\s*const entry = \{/m;
const replacement = `if (Math.abs(totalDebit - totalCredit) > 0.000001) {
      console.error(
        \`Double-entry balance mismatch error: Debit (Base): \${totalDebit}, Credit (Base): \${totalCredit}\`,
      );
      throw new Error(
        \`Unbalanced journal entry: debit=\${totalDebit}, credit=\${totalCredit}\`,
      );
    }
    const entry = {`;

if (!regex.test(content)) {
  throw new Error('Could not find the journal balance validation block in erpStore.ts');
}
content = content.replace(regex, replacement);

// Add strict line validation immediately before the balance calculation.
const marker = `    const totalDebit = lines.reduce(`;
const guard = `    if (!Array.isArray(lines) || lines.length < 2) {
      throw new Error("A journal entry requires at least two lines");
    }
    for (const line of lines) {
      const debit = Number(line?.debit ?? 0);
      const credit = Number(line?.credit ?? 0);
      if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit < 0 || credit < 0) {
        throw new Error("Journal debit/credit values must be finite and non-negative");
      }
      if (debit > 0 && credit > 0) {
        throw new Error("A journal line cannot contain both debit and credit");
      }
      if (debit === 0 && credit === 0) {
        throw new Error("A journal line must contain a positive debit or credit");
      }
    }
${marker}`;

if (!content.includes('A journal line must contain a positive debit or credit')) {
  if (!content.includes(marker)) {
    throw new Error('Could not find journal total calculation marker in erpStore.ts');
  }
  content = content.replace(marker, guard);
}

fs.writeFileSync(path, content, 'utf8');
console.log('erpStore journal/import validation hardened successfully.');
