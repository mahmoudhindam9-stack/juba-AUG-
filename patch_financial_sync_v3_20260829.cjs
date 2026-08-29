const fs = require('fs');

// Oracle numbering: reference is MM/NN, and the accounting identity includes year + month + journal number.
const oraclePath = 'src/shared/utils/oracleParser.ts';
let oracle = fs.readFileSync(oraclePath, 'utf8');
const oracleStart = oracle.indexOf('export function groupOracleRowsIntoJournalEntries');
if (oracleStart < 0) throw new Error('Oracle grouping function not found');
const oracleBefore = oracle.slice(0, oracleStart);
const oracleFunction = [
  'export function groupOracleRowsIntoJournalEntries(rows: ParsedOracleRow[]): JournalEntry[] {',
  '  if (!rows?.length) return [];',
  '  const groups = new Map<string, { year: number; month: number; sequence: number; journalNum: string; date: string; rows: ParsedOracleRow[] }>();',
  '  for (const row of rows) {',
  '    const rawRef = cleanText(row.journal_number || row.document_number);',
  '    let month = parseInt(cleanText(row.period), 10);',
  '    let sequence = parseInt(rawRef, 10);',
  '    if (rawRef.includes("/")) {',
  '      const parts = rawRef.split("/");',
  '      const refMonth = parseInt(parts[0], 10);',
  '      const refSequence = parseInt(parts[1], 10);',
  '      if (Number.isFinite(refMonth) && refMonth >= 1 && refMonth <= 12) month = refMonth;',
  '      if (Number.isFinite(refSequence)) sequence = refSequence;',
  '    }',
  '    const dateObj = row.date ? new Date(row.date) : null;',
  '    const year = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.getUTCFullYear() : 0;',
  '    if (!Number.isFinite(month) || month < 1 || month > 12) month = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.getUTCMonth() + 1 : 1;',
  '    if (!Number.isFinite(sequence) || sequence < 1) sequence = 0;',
  '    const journalNum = sequence > 0 ? String(sequence) : rawRef || ("BAL-" + (cleanText(row.account_code) || "?"));',
  '    const key = String(year) + "|" + String(month).padStart(2, "0") + "|" + journalNum;',
  '    if (!groups.has(key)) groups.set(key, { year, month, sequence, journalNum, date: row.date, rows: [] });',
  '    groups.get(key).rows.push(row);',
  '  }',
  '  const entries: JournalEntry[] = [];',
  '  for (const group of groups.values()) {',
  '    const first = group.rows[0];',
  '    const reference = String(group.month).padStart(2, "0") + "/" + String(group.sequence || 0).padStart(2, "0");',
  '    const primaryCurrency = parseCurrency(first.currency_code, first.currency_name, first.description, first.account_code);',
  '    const lines: JournalLine[] = group.rows.map((r) => ({ account_code: r.account_code, account_name: r.account_name, debit: r.curr_debit, credit: r.curr_credit, description: r.description || r.account_name, currency: parseCurrency(r.currency_code, r.currency_name, r.description, r.account_code), rate: r.rate || 1 }));',
  '    entries.push({ sequence: 0, id: "ORACLE-" + String(group.year || "0000") + "-" + reference.replace("/", "-") + "-" + Date.now().toString(36) + "-" + (entries.length + 1), date: group.date, reference, description: first.description || ("قيد رقم (" + reference + ") - سنة " + (group.year || "")), currency: primaryCurrency, lines });',
  '  }',
  '  entries.sort((a, b) => {',
  '    const ya = Number(String(a.date || "").slice(0, 4)) || 0;',
  '    const yb = Number(String(b.date || "").slice(0, 4)) || 0;',
  '    const [ma, sa] = String(a.reference || "00/00").split("/").map((v) => Number(v) || 0);',
  '    const [mb, sb] = String(b.reference || "00/00").split("/").map((v) => Number(v) || 0);',
  '    const da = new Date(a.date || 0).getTime();',
  '    const db = new Date(b.date || 0).getTime();',
  '    return ya - yb || ma - mb || sa - sb || da - db || String(a.id).localeCompare(String(b.id));',
  '  });',
  '  entries.forEach((e, i) => { e.sequence = i + 1; });',
  '  return entries;',
  '}',
  ''
].join('\n');
fs.writeFileSync(oraclePath, oracleBefore + oracleFunction, 'utf8');

// Save button: active only when there are unsaved entries.
const ledgerPath = 'src/routes/admin/ledger.tsx';
let ledger = fs.readFileSync(ledgerPath, 'utf8');
ledger = ledger.replace('disabled={isSavingToDb || journalEntries.length === 0}', 'disabled={isSavingToDb || !hasUnsavedChanges}');
ledger = ledger.replace('{journalEntries.length} قيد', '{unsavedEntries.length} قيد بحاجة للحفظ');

// The existing detailed report already renders newlyCreatedAccounts. Make imports populate that report immediately.
const helperMarker = '  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {';
if (!ledger.includes('const showImportReport =')) {
  const helper = [
    '  const showImportReport = (result: any, importedEntries: JournalEntry[]) => {',
    '    const balancedEntriesCount = importedEntries.filter((entry) => checkIsEntryBalanced(entry)).length;',
    '    const totalBaseUSD = importedEntries.reduce((sum, entry) => sum + (entry.lines || []).reduce((s, l) => s + getLineBaseValue(l.debit, l.rate || 1, l.currency || entry.currency || "USD"), 0), 0);',
    '    setSaveReportData({ savedEntriesCount: result.insertedEntries, savedEntries: importedEntries, balancedEntriesCount, unbalancedEntriesCount: importedEntries.length - balancedEntriesCount, newAccountsCreated: result.newAccountsCreated, newlyCreatedAccounts: result.newlyCreatedAccounts || [], totalAccountsCount: erpStore.getState().accounts.length, linkedTreasuryTransactions: result.linkedTreasuryTransactions, totalBaseUSD, savedAt: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });',
    '    setIsSaveReportOpen(true);',
    '  };',
    ''
  ].join('\n');
  if (!ledger.includes(helperMarker)) throw new Error('Ledger upload handler marker not found');
  ledger = ledger.replace(helperMarker, helper + helperMarker);
}
const oracleToast = '          toast({\n            title: "✅ تم استيراد القيود بنجاح",\n            description: `تم إدراج ${result.insertedEntries} قيد في دفتر اليومية، وإنشاء ${result.newAccountsCreated} حساب جديد في الدليل العام، وربط ${result.linkedTreasuryTransactions} حركة مالية بالخزائن الصحيحة.`,\n          });';
if (ledger.includes(oracleToast)) ledger = ledger.replace(oracleToast, '          showImportReport(result, newEntries);\n' + oracleToast);
const pasteToast = '    toast({\n      title: "🎉 تم استيراد القيود بنجاح",\n      description: `تم إدراج ${result.insertedEntries} قيد في دفتر اليومية، وإنشاء ${result.newAccountsCreated} حساب جديد في الدليل العام، وربط ${result.linkedTreasuryTransactions} حركة بالخزائن الصحيحة.`,\n    });';
if (ledger.includes(pasteToast)) ledger = ledger.replace(pasteToast, '    showImportReport(result, parsedEntriesPreview);\n' + pasteToast);
ledger = ledger.replace('<Tabs defaultValue="entries" className="w-full">', '<Tabs defaultValue={saveReportData.newAccountsCreated > 0 ? "accounts" : "entries"} className="w-full">');
fs.writeFileSync(ledgerPath, ledger, 'utf8');

// GL source of truth: system-bound accounts use the journal balance map, not vouchers/inventory snapshots.
const storePath = 'src/shared/services/erpStore.ts';
let store = fs.readFileSync(storePath, 'utf8');
const bindingStart = store.indexOf('    this.state.accounts.forEach((acc) => {\n      if (acc.system_binding');
const treasuryStart = store.indexOf('    if (this.state.treasuries && this.state.treasuries.length > 0)', bindingStart);
if (bindingStart < 0 || treasuryStart < 0) throw new Error('Account binding block not found');
const bindingReplacement = [
  '    // General Ledger is the source of truth for all system-bound account balances.',
  '    this.state.accounts.forEach((acc) => {',
  '      if (acc.system_binding && acc.system_binding !== "none" && acc.sync_status !== "pending") {',
  '        acc.balance = balanceMap[acc.code] ?? acc.initial_balance ?? 0;',
  '        acc.sync_status = "synced";',
  '      }',
  '    });',
  ''
].join('\n');
store = store.slice(0, bindingStart) + bindingReplacement + store.slice(treasuryStart);

// Import result must expose the concrete account records created by this import.
const importStart = store.indexOf('  importJournalEntriesAndSyncTreasuries(entries, options = {}) {');
const importEnd = store.indexOf('  mergeAndSyncAllData()', importStart);
if (importStart < 0 || importEnd < 0) throw new Error('Journal import method not found');
let importBlock = store.slice(importStart, importEnd);
if (!importBlock.includes('const newlyCreatedAccounts = [];')) importBlock = importBlock.replace('    let newAccountsCreated = 0;\n', '    let newAccountsCreated = 0;\n    const newlyCreatedAccounts = [];\n');
importBlock = importBlock.replace('          this.state.accounts.push(newAcc);\n          existingAccountCodes.add(code);', '          this.state.accounts.push(newAcc);\n          newlyCreatedAccounts.push(newAcc);\n          existingAccountCodes.add(code);');
importBlock = importBlock.replace('      newAccountsCreated,\n      linkedTreasuryTransactions,', '      newAccountsCreated,\n      newlyCreatedAccounts,\n      linkedTreasuryTransactions,');
store = store.slice(0, importStart) + importBlock + store.slice(importEnd);
fs.writeFileSync(storePath, store, 'utf8');

console.log('Final financial synchronization patch applied.');
