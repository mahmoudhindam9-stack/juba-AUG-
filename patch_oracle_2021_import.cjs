const fs = require('fs');
const path = 'src/shared/utils/oracleParser.ts';
let content = fs.readFileSync(path, 'utf8');

// Journal numbers repeat every month/year. Keep rows from different dates isolated
// while preserving the Oracle source journal grouping inside the same day.
const oldKey = '    const key = journalNum ? `j_${journalNum}` : `bal_${cleanText(row.account_code) || "?"}`;';
const newKey = '    const dateKey = cleanText(row.date) || "NO_DATE";\n    const key = journalNum\n      ? `j_${dateKey}_${period}_${journalNum}`\n      : `bal_${dateKey}_${period}_${cleanText(row.account_code) || "?"}`;';
if (content.includes(oldKey)) content = content.replace(oldKey, newKey);

const start = content.indexOf('export function groupOracleRowsIntoJournalEntries');
if (start < 0) throw new Error('Oracle grouping function not found; refusing unsafe patch.');

const replacement = String.raw`export function groupOracleRowsIntoJournalEntries(rows: ParsedOracleRow[]): JournalEntry[] {
  if (!rows?.length) return [];

  const groups = new Map<string, { period: string; journalNum: string; date: string; rows: ParsedOracleRow[] }>();
  for (const row of rows) {
    const period = cleanText(row.period) || "1";
    const journalNum = cleanText(row.journal_number || row.document_number);
    const dateKey = cleanText(row.date) || "NO_DATE";
    const key = journalNum
      ? `j_${dateKey}_${period}_${journalNum}`
      : `bal_${dateKey}_${period}_${cleanText(row.account_code) || "?"}`;
    if (!groups.has(key)) groups.set(key, { period, journalNum, date: row.date, rows: [] });
    groups.get(key)!.rows.push(row);
  }

  const rawGroups = Array.from(groups.values()).sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    if (da !== db) return da.localeCompare(db);
    return String(a.journalNum || "").localeCompare(String(b.journalNum || ""), undefined, { numeric: true });
  });

  // Assign MM/01, MM/02, ... independently for every calendar month and year.
  // The sequence resets at 01 for each month, while the year remains implicit in the date.
  const monthCounters = new Map<string, number>();
  const entries: JournalEntry[] = [];

  for (const group of rawGroups) {
    const first = group.rows[0];
    const d = new Date(group.date);
    const year = Number.isNaN(d.getTime()) ? "0000" : String(d.getUTCFullYear());
    const month = Number.isNaN(d.getTime()) ? String(group.period).padStart(2, "0") : String(d.getUTCMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}-${month}`;
    const next = (monthCounters.get(yearMonth) || 0) + 1;
    monthCounters.set(yearMonth, next);
    const reference = `${month}/${String(next).padStart(2, "0")}`;
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
      sequence: next,
      id: `ORACLE-${yearMonth}-${String(next).padStart(4, "0")}-${Date.now().toString(36)}-${entries.length + 1}`,
      date: group.date,
      reference,
      description: first.description || `قيد رقم (${reference}) - ${yearMonth}`,
      currency: primaryCurrency,
      lines,
    });
  }

  // Global display ordering is chronological; ties use the normalized MM/NN reference.
  entries.sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.reference || "").localeCompare(b.reference || "", undefined, { numeric: true });
  });
  entries.forEach((entry, index) => { entry.sequence = index + 1; });
  return entries;
}`;

content = content.slice(0, start) + replacement + '\n';
fs.writeFileSync(path, content, 'utf8');
console.log('Oracle journal numbering normalized to MM/NN per month/year and chronological order.');
