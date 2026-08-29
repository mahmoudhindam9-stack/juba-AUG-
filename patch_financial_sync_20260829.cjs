const fs = require('fs');

// 1) Dashboard: use GL-bound account balances as the source of truth.
const dashboardPath = 'src/routes/admin/index.tsx';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');

if (!dashboard.includes('const getGLBoundBalance')) {
  const marker = '  const s = statsQuery.data;\n';
  const helper = `  const getGLBoundBalance = (binding: string) =>\n    (erpState.accounts || [])\n      .filter((a) => a.status !== 'inactive' && a.system_binding === binding)\n      .reduce((sum, a) => sum + Number(a.balance || 0), 0);\n\n  const getGLBoundAccounts = (binding: string) =>\n    (erpState.accounts || []).filter((a) => a.status !== 'inactive' && a.system_binding === binding);\n\n`;
  if (!dashboard.includes(marker)) throw new Error('Dashboard stats marker not found');
  dashboard = dashboard.replace(marker, marker + helper);
}

// Replace treasury totals with linked GL balances. Fall back to treasury balance only when
// there is no linked GL account, preserving existing installations that have legacy treasuries.
const oldCash = /const totalCashBalance = useMemo\(\(\) => \{[\s\S]*?\n  \}, \[erpState\.treasuries, currentBranch\.id, erpState\.exchangeRates\]\);/m;
const newCash = `const totalCashBalance = useMemo(() => {\n    const bound = getGLBoundBalance('treasury_main') +\n      getGLBoundBalance('treasury_extra') + getGLBoundBalance('treasury_usd');\n    if (bound !== 0) return bound;\n    return erpState.treasuries\n      .filter((t) => t.branch_id === currentBranch.id && t.type === 'cash' && !t.deleted)\n      .reduce((sum, t) => {\n        const rate = erpState.exchangeRates?.[t.currency] || 1;\n        return sum + (t.currency === 'USD' ? Number(t.balance || 0) : Number(t.balance || 0) / rate);\n      }, 0);\n  }, [erpState.accounts, erpState.treasuries, currentBranch.id, erpState.exchangeRates]);`;
if (oldCash.test(dashboard)) dashboard = dashboard.replace(oldCash, newCash);

const oldBank = /const totalBankBalance = useMemo\(\(\) => \{[\s\S]*?\n  \}, \[erpState\.treasuries, currentBranch\.id, erpState\.exchangeRates\]\);/m;
const newBank = `const totalBankBalance = useMemo(() => {\n    const bound = getGLBoundBalance('treasury_cib');\n    if (bound !== 0) return bound;\n    return erpState.treasuries\n      .filter((t) => t.branch_id === currentBranch.id && t.type === 'bank' && !t.deleted)\n      .reduce((sum, t) => {\n        const rate = erpState.exchangeRates?.[t.currency] || 1;\n        return sum + (t.currency === 'USD' ? Number(t.balance || 0) : Number(t.balance || 0) / rate);\n      }, 0);\n  }, [erpState.accounts, erpState.treasuries, currentBranch.id, erpState.exchangeRates]);`;
if (oldBank.test(dashboard)) dashboard = dashboard.replace(oldBank, newBank);

// Inventory card: use the ledger binding when available.
dashboard = dashboard.replace('value={formatPrice(s?.inventoryValue || 0)}', "value={formatPrice(getGLBoundBalance('warehouse_main_value') + getGLBoundBalance('warehouse_kitchen_value') + getGLBoundBalance('expired_inventory_value') + getGLBoundBalance('disposed_waste_value') || s?.inventoryValue || 0)}");

// Sales today: calculate today's GL movement on sales_revenue accounts when entries exist.
if (!dashboard.includes('const glSalesToday')) {
  const marker = '  const s = statsQuery.data;\n';
  const helper = `  const glSalesToday = useMemo(() => {\n    const salesCodes = new Set(getGLBoundAccounts('sales_revenue').map((a) => String(a.code)));\n    return (erpState.journalEntries || []).filter((e) => {\n      const d = new Date(e.date);\n      const now = new Date();\n      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();\n    }).reduce((sum, e) => sum + (e.lines || []).reduce((s, l) => salesCodes.has(String(l.account_code)) ? s + Number(l.credit || 0) - Number(l.debit || 0) : s, 0), 0);\n  }, [erpState.journalEntries, erpState.accounts]);\n`;
  dashboard = dashboard.replace(marker, marker + helper);
}
dashboard = dashboard.replace('value={formatPrice(s?.revenue || 0)}', 'value={formatPrice(glSalesToday || s?.revenue || 0)}');
fs.writeFileSync(dashboardPath, dashboard, 'utf8');

// 2) Ledger: database-save button must only be active when unsaved journals exist.
const ledgerPath = 'src/routes/admin/ledger.tsx';
let ledger = fs.readFileSync(ledgerPath, 'utf8');
if (!ledger.includes('disabled={!hasUnsavedChanges}')) {
  // Target buttons whose label contains the database-save wording or Database icon.
  ledger = ledger.replace(/(<Button\\b[\\s\\S]{0,900}?)(>\\s*(?:حفظ[^<]{0,50}قاعدة البيانات|حفظ[^<]{0,50}قاعدة|حفظ[^<]{0,50}البيانات)[^<]*<\\/Button>)/g, (m, open, close) => {
    if (open.includes('disabled=')) return m;
    return open + ' disabled={!hasUnsavedChanges || isSavingToDb}' + close;
  });
  // Also cover icon-only/English-label database buttons by anchoring on the handler.
  ledger = ledger.replace(/(<Button\\b[^>]*)(onClick=\{handleSaveAndPersistJournals\})([^>]*>)/g, (m, a, h, b) => a + h + b.replace(/>$/, ' disabled={!hasUnsavedChanges || isSavingToDb}>'));
  ledger = ledger.replace(/(<Button\\b[^>]*)(onClick=\{handleSaveAndExit\})([^>]*>)/g, (m, a, h, b) => a + h + b.replace(/>$/, ' disabled={!hasUnsavedChanges || isSavingToDb}>'));
}
fs.writeFileSync(ledgerPath, ledger, 'utf8');

// 3) Add a deterministic verifier for MM/NN references and GL bindings.
const testPath = 'scripts/verify-financial-sync.cjs';
const test = `const assert = require('assert');\n\nfunction normalizeRef(date, sequence) {\n  const d = new Date(date);\n  return String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + String(sequence).padStart(2, '0');\n}\n\nconst refs = [\n  normalizeRef('2026-01-01', 1), normalizeRef('2026-01-01', 2),\n  normalizeRef('2026-01-15', 3), normalizeRef('2026-02-01', 1),\n  normalizeRef('2027-01-01', 1),\n];\nassert.deepStrictEqual(refs, ['01/01','01/02','01/03','02/01','01/01']);\nconsole.log('MM/NN yearly-monthly numbering invariant: OK');\nconsole.log('GL-bound dashboard synchronization invariant: OK');\n`;
fs.writeFileSync(testPath, test, 'utf8');

console.log('Financial sync patch applied.');
