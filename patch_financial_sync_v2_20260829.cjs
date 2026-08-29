const fs = require('fs');

// 1) Correct Oracle MM/NN grouping and ordering.
const oraclePath = 'src/shared/utils/oracleParser.ts';
let oracle = fs.readFileSync(oraclePath, 'utf8');
const start = oracle.indexOf('export function groupOracleRowsIntoJournalEntries');
if (start < 0) throw new Error('Oracle grouping function not found');
const before = oracle.slice(0, start);
const newGroup = `export function groupOracleRowsIntoJournalEntries(rows: ParsedOracleRow[]): JournalEntry[] {
  if (!rows?.length) return [];
  const groups = new Map<string, { year: number; month: number; sequence: number; journalNum: string; date: string; rows: ParsedOracleRow[] }>();
  for (const row of rows) {
    const rawRef = cleanText(row.journal_number || row.document_number);
    let month = parseInt(cleanText(row.period), 10);
    let sequence = parseInt(rawRef, 10);
    if (rawRef.includes('/')) {
      const parts = rawRef.split('/');
      const refMonth = parseInt(parts[0], 10);
      const refSequence = parseInt(parts[1], 10);
      if (Number.isFinite(refMonth) && refMonth >= 1 && refMonth <= 12) month = refMonth;
      if (Number.isFinite(refSequence)) sequence = refSequence;
    }
    const dateObj = row.date ? new Date(row.date) : null;
    const year = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.getUTCFullYear() : 0;
    if (!Number.isFinite(month) || month < 1 || month > 12) month = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.getUTCMonth() + 1 : 1;
    if (!Number.isFinite(sequence) || sequence < 1) sequence = 0;
    const journalNum = sequence > 0 ? String(sequence) : rawRef || `BAL-${cleanText(row.account_code) || '?'}`;
    const key = `${year}|${String(month).padStart(2, '0')}|${journalNum}`;
    if (!groups.has(key)) groups.set(key, { year, month, sequence, journalNum, date: row.date, rows: [] });
    groups.get(key).rows.push(row);
  }
  const entries: JournalEntry[] = [];
  for (const group of groups.values()) {
    const first = group.rows[0];
    const reference = `${String(group.month).padStart(2, '0')}/${String(group.sequence || 0).padStart(2, '0')}`;
    const primaryCurrency = parseCurrency(first.currency_code, first.currency_name, first.description, first.account_code);
    const lines: JournalLine[] = group.rows.map((r) => ({
      account_code: r.account_code,
      account_name: r.account_name,
      debit: r.curr_debit,
      credit: r.curr_credit,
      description: r.description || r.account_name,
      currency: parseCurrency(r.currency_code, r.currency_name, r.description, r.account_code),
      rate: r.rate || 1,
    }));
    entries.push({
      sequence: 0,
      id: `ORACLE-${String(group.year || '0000')}-${reference.replace('/', '-')}-${Date.now().toString(36)}-${entries.length + 1}`,
      date: group.date,
      reference,
      description: first.description || `قيد رقم (${reference}) - سنة ${group.year || ''}`,
      currency: primaryCurrency,
      lines,
    });
  }
  entries.sort((a, b) => {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    const ya = Number(String(a.date || '').slice(0, 4)) || 0;
    const yb = Number(String(b.date || '').slice(0, 4)) || 0;
    const [ma, sa] = String(a.reference || '00/00').split('/').map((v) => Number(v) || 0);
    const [mb, sb] = String(b.reference || '00/00').split('/').map((v) => Number(v) || 0);
    return ya - yb || ma - mb || sa - sb || da - db || String(a.id).localeCompare(String(b.id));
  });
  entries.forEach((e, i) => { e.sequence = i + 1; });
  return entries;
}
`;
fs.writeFileSync(oraclePath, before + newGroup, 'utf8');

// 2) Database-save button follows pending journals, not total journal count.
const ledgerPath = 'src/routes/admin/ledger.tsx';
let ledger = fs.readFileSync(ledgerPath, 'utf8');
ledger = ledger.replace('disabled={isSavingToDb || journalEntries.length === 0}', 'disabled={isSavingToDb || !hasUnsavedChanges}');
ledger = ledger.replace('{journalEntries.length} قيد', '{unsavedEntries.length} قيد بحاجة للحفظ');

// 3) Return actual newly-created account objects from Oracle import.
const importMethodStart = ledger.indexOf('const result = erpStore.importJournalEntriesAndSyncTreasuries(newEntries, {');
if (importMethodStart >= 0) {
  const importReturnNeedle = '          // Re-sync and update state\n          setErpState({ ...erpStore.getState() });';
  const importReturnReplacement = '          // Re-sync and update state\n          setErpState({ ...erpStore.getState() });';
  if (!ledger.includes('newlyCreatedAccounts: result.newlyCreatedAccounts || []')) {
    // The import report is populated below; the store patch supplies the objects.
  }
}
const pasteReturnNeedle = '    const result = erpStore.importJournalEntriesAndSyncTreasuries(parsedEntriesPreview, {\n      sourceName: "معالجة واستيراد جدول القيود",\n    });';
// Report data is opened immediately after import, using the actual account objects returned by the store.
const fileToast = /          toast\(\{\n            title: "✅ تم استيراد القيود بنجاح",\n            description: `تم إدراج \$\{result\.insertedEntries\} قيد في دفتر اليومية، وإنشاء \$\{result\.newAccountsCreated\} حساب جديد في الدليل العام، وربط \$\{result\.linkedTreasuryTransactions\} حركة مالية بالخزائن الصحيحة\.`,\n          \}\);/;
const fileReplacement = `          const importedEntries = newEntries.filter((entry) => (erpStore.getState().journalEntries || []).some((saved) => saved.id === entry.id));
          const importBalanced = importedEntries.filter((entry) => checkIsEntryBalanced(entry)).length;
          const importTotalBaseUSD = importedEntries.reduce((sum, entry) => sum + (entry.lines || []).reduce((s, l) => s + getLineBaseValue(l.debit, l.rate || 1, l.currency || entry.currency || "USD"), 0), 0);
          setSaveReportData({
            savedEntriesCount: result.insertedEntries,
            savedEntries: importedEntries,
            balancedEntriesCount: importBalanced,
            unbalancedEntriesCount: importedEntries.length - importBalanced,
            newAccountsCreated: result.newAccountsCreated,
            newlyCreatedAccounts: result.newlyCreatedAccounts || [],
            totalAccountsCount: erpStore.getState().accounts.length,
            linkedTreasuryTransactions: result.linkedTreasuryTransactions,
            totalBaseUSD: importTotalBaseUSD,
            savedAt: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          });
          setIsSaveReportOpen(true);
          toast({
            title: "✅ تم استيراد القيود بنجاح",
            description: `تم إدراج \${result.insertedEntries} قيد في دفتر اليومية، وإنشاء \${result.newAccountsCreated} حساب جديد في الدليل العام، وربط \${result.linkedTreasuryTransactions} حركة مالية بالخزائن الصحيحة.`,
          });`;
if (fileToast.test(ledger)) ledger = ledger.replace(fileToast, fileReplacement);

const pasteToast = /    toast\(\{\n      title: "🎉 تم استيراد القيود بنجاح",\n      description: `تم إدراج \$\{result\.insertedEntries\} قيد في دفتر اليومية، وإنشاء \$\{result\.newAccountsCreated\} حساب جديد في الدليل العام، وربط \$\{result\.linkedTreasuryTransactions\} حركة بالخزائن الصحيحة\.`,\n    \}\);/;
const pasteReplacement = `    setSaveReportData({
      savedEntriesCount: result.insertedEntries,
      savedEntries: parsedEntriesPreview,
      balancedEntriesCount: parsedEntriesPreview.filter(checkIsEntryBalanced).length,
      unbalancedEntriesCount: parsedEntriesPreview.filter((entry) => !checkIsEntryBalanced(entry)).length,
      newAccountsCreated: result.newAccountsCreated,
      newlyCreatedAccounts: result.newlyCreatedAccounts || [],
      totalAccountsCount: erpStore.getState().accounts.length,
      linkedTreasuryTransactions: result.linkedTreasuryTransactions,
      totalBaseUSD: parsedEntriesPreview.reduce((sum, entry) => sum + (entry.lines || []).reduce((s, l) => s + getLineBaseValue(l.debit, l.rate || 1, l.currency || entry.currency || "USD"), 0), 0),
      savedAt: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    });
    setIsSaveReportOpen(true);
    toast({
      title: "🎉 تم استيراد القيود بنجاح",
      description: `تم إدراج \${result.insertedEntries} قيد في دفتر اليومية، وإنشاء \${result.newAccountsCreated} حساب جديد في الدليل العام، وربط \${result.linkedTreasuryTransactions} حركة بالخزائن الصحيحة.`,
    });`;
if (pasteToast.test(ledger)) ledger = ledger.replace(pasteToast, pasteReplacement);
ledger = ledger.replace('<Tabs defaultValue="entries" className="w-full">', '<Tabs defaultValue={saveReportData.newAccountsCreated > 0 ? "accounts" : "entries"} className="w-full">');
fs.writeFileSync(ledgerPath, ledger, 'utf8');

// 4) General ledger is the source of truth for system-bound account balances.
const storePath = 'src/shared/services/erpStore.ts';
let store = fs.readFileSync(storePath, 'utf8');
const bindingStart = store.indexOf('    this.state.accounts.forEach((acc) => {\n      if (acc.system_binding');
const treasuryStart = store.indexOf('    if (this.state.treasuries && this.state.treasuries.length > 0)', bindingStart);
if (bindingStart < 0 || treasuryStart < 0) throw new Error('Account binding block not found');
const bindingReplacement = `    // General Ledger is the source of truth for system-bound accounts.\n    this.state.accounts.forEach((acc) => {\n      if (acc.system_binding && acc.system_binding !== "none" && acc.sync_status !== "pending") {\n        acc.balance = balanceMap[acc.code] ?? acc.initial_balance ?? 0;\n        acc.sync_status = "synced";\n      }\n    });\n`;
store = store.slice(0, bindingStart) + bindingReplacement + store.slice(treasuryStart);

// Return newly-created accounts from import so the UI report can list them.
const importStart = store.indexOf('  importJournalEntriesAndSyncTreasuries(entries, options = {}) {');
const importEnd = store.indexOf('  mergeAndSyncAllData()', importStart);
if (importStart >= 0 && importEnd > importStart) {
  let block = store.slice(importStart, importEnd);
  if (!block.includes('const newlyCreatedAccounts = [];')) {
    block = block.replace('    let newAccountsCreated = 0;\n', '    let newAccountsCreated = 0;\n    const newlyCreatedAccounts = [];\n');
  }
  block = block.replace('          this.state.accounts.push(newAcc);\n          existingAccountCodes.add(code);', '          this.state.accounts.push(newAcc);\n          newlyCreatedAccounts.push(newAcc);\n          existingAccountCodes.add(code);');
  block = block.replace('      newAccountsCreated,\n      linkedTreasuryTransactions,', '      newAccountsCreated,\n      newlyCreatedAccounts,\n      linkedTreasuryTransactions,');
  store = store.slice(0, importStart) + block + store.slice(importEnd);
}
fs.writeFileSync(storePath, store, 'utf8');

console.log('Financial sync v2 applied.');
