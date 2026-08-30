export type PrintColumn = { key: string; label: string; align?: "left" | "center" | "right" };

const escapeHtml = (value: unknown) => {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
  };
  return String(value ?? "").replace(/[&<>\"]/g, (char) => entities[char] || char);
};

export function printAccountingDocument(options: {
  title: string;
  subtitle?: string;
  columns: PrintColumn[];
  rows: Record<string, unknown>[];
  totals?: { label: string; value: string }[];
  documentNo?: string;
}) {
  if (typeof window === "undefined") return false;
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
  if (!printWindow) {
    window.alert("تعذر فتح نافذة الطباعة. اسمح بالنوافذ المنبثقة لهذا الموقع ثم أعد المحاولة.");
    return false;
  }
  const head = options.columns.map((column) => `<th style="text-align:${column.align || "right"}">${escapeHtml(column.label)}</th>`).join("");
  const body = options.rows.map((row) => `<tr>${options.columns.map((column) => `<td style="text-align:${column.align || "right"}">${escapeHtml(row[column.key])}</td>`).join("")}</tr>`).join("");
  const totals = (options.totals || []).map((item) => `<div class="total"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join("");
  printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>${escapeHtml(options.title)}</title><style>
  @page{size:A4 landscape;margin:12mm}body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;margin:0;background:#fff}h1{font-size:21px;margin:0 0 4px}.sub{color:#475569;font-size:11px;margin-bottom:16px}.meta{display:flex;justify-content:space-between;font-size:11px;margin-bottom:10px;border-bottom:1px solid #cbd5e1;padding-bottom:8px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#e2e8f0;font-weight:800}th,td{border:1px solid #cbd5e1;padding:6px;vertical-align:top}.totals{margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.total{border:1px solid #cbd5e1;border-radius:6px;padding:8px;display:flex;justify-content:space-between;font-size:11px}.footer{margin-top:16px;font-size:9px;color:#64748b;display:flex;justify-content:space-between}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>
  <div class="meta"><span>${escapeHtml(options.documentNo || "")}</span><span>${escapeHtml(new Date().toLocaleString("ar-EG"))}</span></div>
  <h1>${escapeHtml(options.title)}</h1><div class="sub">${escapeHtml(options.subtitle || "مستند صادر من النظام المحاسبي الموحد")}</div>
  <table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${options.columns.length}" style="text-align:center">لا توجد بيانات</td></tr>`}</tbody></table>
  <div class="totals">${totals}</div>
  <div class="footer"><span>المستند محاسبي/تشغيلي صادر من النظام</span><span>يُرجى مراجعة البيانات قبل الاعتماد</span></div>
  </body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); setTimeout(() => printWindow.close(), 500); }, 250);
  return true;
}
