export type OracleImportDiagnostic = {
  row: number;
  field?: string;
  message: string;
};

export function parseOracleDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string') return null;

  const s = value.trim();
  if (!s) return null;

  // Accept the common Oracle export variants without changing currency logic.
  const patterns: RegExp[] = [
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/,
    /^(\d{2})[/-](\d{2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    /^(\d{4})(\d{2})(\d{2})$/,
  ];

  for (const p of patterns) {
    const m = s.match(p);
    if (!m) continue;
    let year: number;
    let month: number;
    let day: number;
    let hour = Number(m[4] ?? 0);
    let minute = Number(m[5] ?? 0);
    let second = Number(m[6] ?? 0);

    if (p === patterns[1]) {
      month = Number(m[1]); day = Number(m[2]); year = Number(m[3]);
    } else {
      year = Number(m[1]); month = Number(m[2]); day = Number(m[3]);
    }

    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
    const d = new Date(year, month - 1, day, hour, minute, second);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
    return d;
  }
  return null;
}

export function parseOracleNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const s = value.trim().replace(/\s/g, '');
  if (!s) return null;

  // Oracle exports can contain either decimal comma or decimal point, and
  // thousands separators. Preserve the numeric value instead of guessing
  // from the currency/exchange-rate semantics.
  let normalized = s;
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
      ? normalized.replace(/\./g, '').replace(',', '.')
      : normalized.replace(/,/g, '');
  } else if (normalized.includes(',')) {
    const parts = normalized.split(',');
    normalized = parts.length === 2 && parts[1].length <= 6
      ? `${parts[0]}.${parts[1]}`
      : normalized.replace(/,/g, '');
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function validateOracleRow(row: Record<string, unknown>, rowNumber: number): OracleImportDiagnostic[] {
  const diagnostics: OracleImportDiagnostic[] = [];
  const dateKey = Object.keys(row).find(k => /date|datum|تاريخ/i.test(k));
  if (dateKey && row[dateKey] != null && row[dateKey] !== '' && !parseOracleDate(row[dateKey])) {
    diagnostics.push({ row: rowNumber, field: dateKey, message: `Invalid Oracle date: ${String(row[dateKey])}` });
  }

  for (const [key, value] of Object.entries(row)) {
    if (!/amount|debit|credit|value|balance|rate|quantity|qty|مبلغ|مدين|دائن|قيمة|رصيد|سعر|كمية/i.test(key)) continue;
    if (value == null || value === '') continue;
    if (parseOracleNumber(value) == null) {
      diagnostics.push({ row: rowNumber, field: key, message: `Invalid Oracle numeric value: ${String(value)}` });
    }
  }
  return diagnostics;
}
