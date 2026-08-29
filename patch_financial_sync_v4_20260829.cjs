const fs = require('fs');

// Oracle import uses the explicit year/month/journal ordering module.
const ledgerPath = 'src/routes/admin/ledger.tsx';
let ledger = fs.readFileSync(ledgerPath, 'utf8');
if (!ledger.includes('oracleJournalGrouping')) {
  const importNeedle = 'import { type ParsedOracleRow } from "@/shared/utils/oracleParser";';
  if (ledger.includes(importNeedle)) {
    ledger = ledger.replace(importNeedle, importNeedle + '\nimport { groupOracleRowsIntoJournalEntriesOrdered } from "@/shared/utils/oracleJournalGrouping";');
  } else {
    const parserImportNeedle = '} from "@/shared/utils/oracleParser";';
    const parserPos = ledger.indexOf(parserImportNeedle);
    if (parserPos < 0) throw new Error('Oracle parser import not found');
    ledger = ledger.slice(0, parserPos + parserImportNeedle.length) + '\nimport { groupOracleRowsIntoJournalEntriesOrdered } from "@/shared/utils/oracleJournalGrouping";' + ledger.slice(parserPos + parserImportNeedle.length);
  }
}
ledger = ledger.replace(/groupOracleRowsIntoJournalEntries\(parsedRows\)/g, 'groupOracleRowsIntoJournalEntriesOrdered(parsedRows)');
ledger = ledger.replace(/groupOracleRowsIntoJournalEntries\(rows\)/g, 'groupOracleRowsIntoJournalEntriesOrdered(rows)');
ledger = ledger.replace('disabled={isSavingToDb || journalEntries.length === 0}', 'disabled={isSavingToDb || !hasUnsavedChanges}');
ledger = ledger.replace('{journalEntries.length} قيد', '{unsavedEntries.length} قيد بحاجة للحفظ');

// Import report: calculate the concrete accounts created by this import before/after the operation.
if (!ledger.includes('const showImportReport =')) {
  const marker = '  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {';
  const helper = [
    '  const showImportReport = (result: any, importedEntries: JournalEntry[], newlyCreatedAccounts: Account[]) => {',
    '    const balancedEntriesCount = importedEntries.filter((entry) => checkIsEntryBalanced(entry)).length;',
    '    const totalBaseUSD = importedEntries.reduce((sum, entry) => sum + (entry.lines || []).reduce((s, l) => s + getLineBaseValue(l.debit, l.rate || 1, l.currency || entry.currency || "USD"), 0), 0);',
    '    setSaveReportData({ savedEntriesCount: result.insertedEntries, savedEntries: importedEntries, balancedEntriesCount, unbalancedEntriesCount: importedEntries.length - balancedEntriesCount, newAccountsCreated: newlyCreatedAccounts.length, newlyCreatedAccounts, totalAccountsCount: erpStore.getState().accounts.length, linkedTreasuryTransactions: result.linkedTreasuryTransactions, totalBaseUSD, savedAt: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });',
    '    setIsSaveReportOpen(true);',
    '  };',
    ''
  ].join('\n');
  if (!ledger.includes(marker)) throw new Error('Ledger upload marker not found');
  ledger = ledger.replace(marker, helper + marker);
}

// Add before/after account snapshots around both import paths.
const fileImportNeedle = '          const result = erpStore.importJournalEntriesAndSyncTreasuries(newEntries, {\n            sourceName: file.name,\n          });';
if (ledger.includes(fileImportNeedle) && !ledger.includes('const accountsBeforeImport = new Set')) {
  ledger = ledger.replace(fileImportNeedle, '          const accountsBeforeImport = new Set((erpStore.getState().accounts || []).map((a) => a.code));\n' + fileImportNeedle + '\n          const newlyCreatedAccounts = (erpStore.getState().accounts || []).filter((a) => !accountsBeforeImport.has(a.code));');
  const stateMarker = '          setErpState({ ...erpStore.getState() });';
  const firstPos = ledger.indexOf(stateMarker);
  if (firstPos >= 0) {
    const reportCall = '          showImportReport(result, newEntries, newlyCreatedAccounts);\n';
    ledger = ledger.slice(0, firstPos) + reportCall + ledger.slice(firstPos);
  }
}
const pasteImportNeedle = '    const result = erpStore.importJournalEntriesAndSyncTreasuries(parsedEntriesPreview, {\n      sourceName: "معالجة واستيراد جدول القيود",\n    });';
if (ledger.includes(pasteImportNeedle) && !ledger.includes('const pasteAccountsBeforeImport')) {
  ledger = ledger.replace(pasteImportNeedle, '    const pasteAccountsBeforeImport = new Set((erpStore.getState().accounts || []).map((a) => a.code));\n' + pasteImportNeedle + '\n    const pasteNewlyCreatedAccounts = (erpStore.getState().accounts || []).filter((a) => !pasteAccountsBeforeImport.has(a.code));');
  const pasteStateMarker = '    setErpState({ ...erpStore.getState() });';
  const pastePos = ledger.indexOf(pasteStateMarker, ledger.indexOf(pasteImportNeedle));
  if (pastePos >= 0) ledger = ledger.slice(0, pastePos) + '    showImportReport(result, parsedEntriesPreview, pasteNewlyCreatedAccounts);\n' + ledger.slice(pastePos);
}
ledger = ledger.replace('<Tabs defaultValue="entries" className="w-full">', '<Tabs defaultValue={saveReportData.newAccountsCreated > 0 ? "accounts" : "entries"} className="w-full">');
fs.writeFileSync(ledgerPath, ledger, 'utf8');

// General Ledger is the source of truth for system-bound accounts.
const storePath = 'src/shared/services/erpStore.ts';
let store = fs.readFileSync(storePath, 'utf8');
const bindingStart = store.indexOf('    this.state.accounts.forEach((acc) => {\n      if (acc.system_binding');
const treasuryStart = store.indexOf('    if (this.state.treasuries && this.state.treasuries.length > 0)', bindingStart);
if (bindingStart >= 0 && treasuryStart > bindingStart) {
  const replacement = [
    '    // General Ledger is the accounting source of truth for system-bound accounts.',
    '    this.state.accounts.forEach((acc) => {',
    '      if (acc.system_binding && acc.system_binding !== "none" && acc.sync_status !== "pending") {',
    '        acc.balance = balanceMap[acc.code] ?? acc.initial_balance ?? 0;',
    '        acc.sync_status = "synced";',
    '      }',
    '    });',
    ''
  ].join('\n');
  store = store.slice(0, bindingStart) + replacement + store.slice(treasuryStart);
}
fs.writeFileSync(storePath, store, 'utf8');

// Treasury cards read the linked GL account balance when available.
const dashboardPath = 'src/routes/admin/index.tsx';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');
const cardStart = dashboard.indexOf('function TreasuryAccountCard(');
if (cardStart >= 0) {
  const returnPos = dashboard.indexOf('  return (', cardStart);
  const cardEnd = dashboard.indexOf('\n}\n\n// Reusable stat card', returnPos);
  if (returnPos > cardStart && cardEnd > returnPos) {
    let card = dashboard.slice(cardStart, cardEnd);
    if (!card.includes('const liveAccountBalance')) {
      card = card.replace('  return (', '  const liveAccountBalance = tr.account_code ? (erpStore.getState().accounts || []).find((a) => a.code === tr.account_code)?.balance : undefined;\n  const displayBalance = liveAccountBalance !== undefined ? Number(liveAccountBalance) : Number(tr.balance || 0);\n\n  return (');
    }
    card = card.replaceAll('formatTreasuryCurrency(tr.balance, tr.currency)', 'formatTreasuryCurrency(displayBalance, tr.currency)');
    card = card.replaceAll('tr.currency === "USD"\n                  ? tr.balance\n                  : tr.balance /', 'tr.currency === "USD"\n                  ? displayBalance\n                  : displayBalance /');
    dashboard = dashboard.slice(0, cardStart) + card + dashboard.slice(cardEnd);
  }
}
fs.writeFileSync(dashboardPath, dashboard, 'utf8');

console.log('Stable financial synchronization patch applied.');
