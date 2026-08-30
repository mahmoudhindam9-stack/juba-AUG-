export type OracleImportDiagnostic = {
  row: number;
  field?: string;
  message: string;
};

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

function normalizeDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d] || d);
}

function validDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date | null {
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
  const d = new Date(year, month - 1, day, hour, minute, second);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
}

export function parseOracleDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && Number.isFinite(value) && value > 20000 && value < 80000) {
    const d = new Date(Math.round((value - 25569) * 86400) * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value !== "string") return null;
  const s = normalizeDigits(value.trim()).replace(/^\uFEFF/, "");
  if (!s) return null;

  const patterns = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
    /^(\d{4})(\d{2})(\d{2})$/,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const m = s.match(patterns[i]);
    if (!m) continue;
    const y = i === 1 ? Number(m[3]) : Number(m[1]);
    const mo = Number(m[2]);
    const d = i === 1 ? Number(m[1]) : Number(m[3]);
    const parsed = validDate(y, mo, d, Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0));
    if (parsed) return parsed;
  }

  const native = new Date(s);
  return Number.isNaN(native.getTime()) ? null : native;
}

export function parseOracleNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value == null) return null;

  let s = normalizeDigits(String(value)).trim();
  if (!s) return null;
  const negative = /^\(.*\)$/.test(s);
  s = s.replace(/^\(|\)$/g, "");
  s = s.replace(/[\s\u00A0$€£¥₤]/g, "").replace(/^[A-Z]{3}\s*/i, "");
  s = s.replace(/٬/g, ",").replace(/٫/g, ".");

  if (s.includes(",") && s.includes(".")) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".")
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    const isThousandsGrouped = /^[-+]?\d{1,3}(,\d{3})+$/.test(s);
    if (isThousandsGrouped) {
      s = s.replace(/,/g, "");
    } else {
      const parts = s.split(",");
      s = parts.length === 2 && parts[0] !== "" && parts[1].length >= 1 && parts[1].length <= 6
        ? `${parts[0]}.${parts[1]}`
        : s.replace(/,/g, "");
    }
  }

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : n;
}

export function validateOracleRow(row: Record<string, unknown>, rowNumber: number): OracleImportDiagnostic[] {
  const diagnostics: OracleImportDiagnostic[] = [];
  const keys = Object.keys(row);
  const dateKey = keys.find((k) => /date|datum|تاريخ/i.test(k));
  if (dateKey && row[dateKey] != null && row[dateKey] !== "" && !parseOracleDate(row[dateKey])) {
    diagnostics.push({ row: rowNumber, field: dateKey, message: `Invalid Oracle date: ${String(row[dateKey])}` });
  }
  for (const [key, value] of Object.entries(row)) {
    if (!/amount|debit|credit|value|balance|rate|quantity|qty|مبلغ|مدين|دائن|قيمة|رصيد|سعر|كمية/i.test(key)) continue;
    if (value == null || value === "") continue;
    if (parseOracleNumber(value) == null) diagnostics.push({ row: rowNumber, field: key, message: `Invalid Oracle numeric value: ${String(value)}` });
  }
  return diagnostics;
}

export function formatOracleDiagnostics(diagnostics: OracleImportDiagnostic[], limit = 20): string {
  if (!diagnostics.length) return "";
  const shown = diagnostics.slice(0, limit).map((d) => `الصف ${d.row}${d.field ? ` [${d.field}]` : ""}: ${d.message}`);
  const more = diagnostics.length > limit ? `\n... و${diagnostics.length - limit} أخطاء أخرى.` : "";
  return shown.join("\n") + more;
}
