export type PrintColumn = { key: string; label: string; align?: "left" | "center" | "right" };

const escapeHtml = (value: unknown) => {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  };
  return String(value ?? "").replace(/[&<>"]/g, (char) => entities[char] || char);
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

  const head = options.columns
    .map(
      (column) =>
        `<th style="text-align:${column.align || "right"}">${escapeHtml(column.label)}</th>`,
    )
    .join("");

  const body = options.rows
    .map(
      (row) =>
        `<tr>${options.columns
          .map(
            (column) =>
              `<td style="text-align:${column.align || "right"}">${escapeHtml(row[column.key])}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const totals = (options.totals || [])
    .map(
      (item) =>
        `<div class="total"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`,
    )
    .join("");

  const htmlContent = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>${escapeHtml(options.title)}</title><style>
  @page{size:A4 portrait;margin:12mm}
  body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;margin:0;padding:16px;background:#fff;direction:rtl;text-align:right}
  h1{font-size:20px;margin:0 0 4px;color:#1e293b;text-align:center}
  .sub{color:#475569;font-size:12px;margin-bottom:18px;text-align:center}
  .meta{display:flex;justify-content:space-between;font-size:12px;margin-bottom:12px;border-bottom:2px solid #0284c7;padding-bottom:8px;font-weight:bold}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:10px}
  th{background:#f1f5f9;color:#0f172a;font-weight:bold;padding:8px;border:1px solid #cbd5e1}
  td{border:1px solid #cbd5e1;padding:8px;vertical-align:top}
  .totals{margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .total{border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#f8fafc;display:flex;justify-content:space-between;font-size:12px}
  .signatures{margin-top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;text-align:center;font-size:12px;color:#475569}
  .sig-line{border-top:1px dashed #94a3b8;margin-top:35px;padding-top:6px;font-weight:bold}
  .footer{margin-top:30px;font-size:10px;color:#64748b;display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:10px}
  @media print{
    body{print-color-adjust:exact;-webkit-print-color-adjust:exact}
  }
  </style></head><body>
  <div class="meta">
    <span>مستند رقم: ${escapeHtml(options.documentNo || "")}</span>
    <span>تاريخ الطباعة: ${escapeHtml(new Date().toLocaleDateString("ar-EG") + " " + new Date().toLocaleTimeString("ar-EG"))}</span>
  </div>
  <h1>${escapeHtml(options.title)}</h1>
  <div class="sub">${escapeHtml(options.subtitle || "سند قيد يومية عامة - Restocash ERP")}</div>
  <table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${options.columns.length}" style="text-align:center">لا توجد بيانات</td></tr>`}</tbody></table>
  ${totals ? `<div class="totals">${totals}</div>` : ""}
  <div class="signatures">
    <div><div class="sig-line">إعداد المحاسب</div></div>
    <div><div class="sig-line">المراجعة والتدقيق</div></div>
    <div><div class="sig-line">اعتماد المدير المالي</div></div>
  </div>
  <div class="footer"><span>مستند محاسبي صادر من نظام Restocash ERP</span><span>صفحة 1 من 1</span></div>
  </body></html>`;

  // First try opening popup window
  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    }, 250);
    return true;
  }

  // Fallback for popups blocked in iframe: hidden print iframe
  try {
    let iframe = document.getElementById("print-document-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-document-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
      return true;
    }
  } catch (err) {
    console.error("[Print Fallback]", err);
  }

  // Ultimate fallback
  window.print();
  return true;
}

export function printRawHtml(htmlContent: string) {
  if (typeof window === "undefined") return false;

  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    }, 250);
    return true;
  }

  try {
    let iframe = document.getElementById("print-document-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-document-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
      return true;
    }
  } catch (err) {
    console.error("[Print Fallback]", err);
  }

  window.print();
  return true;
}

export function printImportReportDocument(reportData: any) {
  if (!reportData || typeof window === "undefined") return false;

  const savedEntries = reportData.savedEntries || [];
  const newlyCreatedAccounts = reportData.newlyCreatedAccounts || [];

  const entriesRowsHtml = savedEntries
    .map((je: any, i: number) => {
      const totalDebit = (je.lines || []).reduce(
        (s: number, l: any) => s + (Number(l.debit) || 0),
        0,
      );
      const totalCredit = (je.lines || []).reduce(
        (s: number, l: any) => s + (Number(l.credit) || 0),
        0,
      );
      const isB = Math.abs(totalDebit - totalCredit) < 0.05;
      const currList = Array.from(
        new Set((je.lines || []).map((l: any) => l.currency || je.currency || "USD")),
      ).join(", ");

      const baseTotal = (je.lines || []).reduce((s: number, l: any) => {
        const debit = Number(l.debit || 0);
        const rate = Number(l.rate || 1);
        return s + (rate > 0 ? debit / rate : debit);
      }, 0);

      return `<tr>
      <td style="text-align:center">${i + 1}</td>
      <td style="font-weight:bold;color:#1e40af">${escapeHtml(je.reference || je.id || "-")}</td>
      <td>${escapeHtml(je.date || "-")}</td>
      <td>${escapeHtml(je.description || "-")}</td>
      <td style="text-align:center">${escapeHtml(currList)}</td>
      <td style="text-align:left;font-weight:bold">$${baseTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="text-align:center;font-weight:bold;color:${isB ? "#15803d" : "#b91c1c"}">${isB ? "متزن ✓" : "غير متزن ⚠️"}</td>
    </tr>`;
    })
    .join("");

  const accountsRowsHtml = newlyCreatedAccounts
    .map((acc: any) => {
      return `<tr>
      <td style="font-weight:bold;color:#1e40af">${escapeHtml(acc.code)}</td>
      <td>${escapeHtml(acc.name_ar || acc.name)}</td>
      <td>${escapeHtml(acc.type || "-")}</td>
      <td style="text-align:center">${escapeHtml(acc.currency || "USD")}</td>
    </tr>`;
    })
    .join("");

  const htmlContent = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>تقرير استيراد القيود المحاسبية</title><style>
  @page{size:A4 portrait;margin:12mm}
  body{font-family:Tahoma,Arial,sans-serif;color:#0f172a;margin:0;padding:16px;background:#fff;direction:rtl;text-align:right}
  h1{font-size:20px;margin:0 0 4px;color:#1e293b;text-align:center}
  .sub{color:#475569;font-size:12px;margin-bottom:18px;text-align:center}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
  .summary-card{border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#f8fafc;text-align:center}
  .summary-card .val{font-size:16px;font-weight:bold;color:#0284c7;margin-top:4px}
  .summary-card .lbl{font-size:11px;color:#64748b}
  .section-title{font-size:13px;font-weight:bold;margin-top:16px;margin-bottom:8px;color:#0f172a;border-bottom:2px solid #0284c7;padding-bottom:4px}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  th{background:#f1f5f9;color:#0f172a;font-weight:bold;padding:8px;border:1px solid #cbd5e1;text-align:right}
  td{border:1px solid #cbd5e1;padding:8px;vertical-align:top}
  .footer{margin-top:30px;font-size:10px;color:#64748b;display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:10px}
  @media print{
    body{print-color-adjust:exact;-webkit-print-color-adjust:exact}
  }
  </style></head><body>
  <h1>تقرير نتائج استيراد وحفظ القيود المحاسبية</h1>
  <div class="sub">نظام Restocash ERP — تاريخ الطباعة: ${new Date().toLocaleDateString("ar-EG")} ${new Date().toLocaleTimeString("ar-EG")}</div>
  
  <div class="summary-grid">
    <div class="summary-card"><div class="lbl">إجمالي القيود المحفوظة</div><div class="val">${reportData.savedEntriesCount || 0}</div></div>
    <div class="summary-card"><div class="lbl">القيود المتزنة</div><div class="val" style="color:#16a34a">${reportData.balancedEntriesCount || 0}</div></div>
    <div class="summary-card"><div class="lbl">الحسابات المضافة حديثاً</div><div class="val">${reportData.newAccountsCreated || 0}</div></div>
    <div class="summary-card"><div class="lbl">إجمالي القيمة المقومة (USD)</div><div class="val">$${(reportData.totalBaseUSD || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
  </div>

  <div class="section-title">قائمة القيود المستوردة والمستقرة في اليومية (${savedEntries.length})</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:center">#</th>
        <th>رقم القيد / المرجع</th>
        <th>التاريخ</th>
        <th>شرح القيد المحاسبي</th>
        <th style="text-align:center">العملات</th>
        <th style="text-align:left">الإجمالي (USD)</th>
        <th style="text-align:center">حالة الاتزان</th>
      </tr>
    </thead>
    <tbody>
      ${entriesRowsHtml || '<tr><td colspan="7" style="text-align:center">لا توجد قيود</td></tr>'}
    </tbody>
  </table>

  ${
    newlyCreatedAccounts.length > 0
      ? `
  <div class="section-title" style="margin-top:24px">الحسابات الجديدة المضافة تلقائياً لدليل الحسابات (${newlyCreatedAccounts.length})</div>
  <table>
    <thead>
      <tr>
        <th>كود الحساب</th>
        <th>اسم الحساب</th>
        <th>نوع وتصنيف الحساب</th>
        <th style="text-align:center">العملة</th>
      </tr>
    </thead>
    <tbody>
      ${accountsRowsHtml}
    </tbody>
  </table>
  `
      : ""
  }

  <div class="footer">
    <span>مستند ملخص استيراد صادر من نظام Restocash ERP</span>
    <span>صفحة 1 من 1</span>
  </div>
  </body></html>`;

  return printRawHtml(htmlContent);
}

export function printJournalEntryDocument(
  entry: any,
  accounts: any[] = [],
  formatCurrencyFn?: (val: number, curr?: string) => string,
) {
  if (!entry) return;
  const accountsMap = new Map((accounts || []).map((a: any) => [a.code, a.name_ar || a.name]));

  const rows = (entry.lines || []).map((line: any, idx: number) => {
    const accName = accountsMap.get(line.account_code) || line.account_name || "حساب محاسبي";
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);
    const curr = line.currency || entry.currency || "USD";
    const fmt = formatCurrencyFn
      ? (v: number) => formatCurrencyFn(v, curr)
      : (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2 });

    return {
      index: idx + 1,
      account: `${line.account_code} - ${accName}`,
      description: line.description || entry.description || "-",
      currency: curr,
      debit: debit > 0 ? `${fmt(debit)} ${curr}` : "-",
      credit: credit > 0 ? `${fmt(credit)} ${curr}` : "-",
    };
  });

  const totalDebit = (entry.lines || []).reduce(
    (s: number, l: any) => s + (Number(l.debit) || 0),
    0,
  );
  const totalCredit = (entry.lines || []).reduce(
    (s: number, l: any) => s + (Number(l.credit) || 0),
    0,
  );
  const mainCurr = entry.currency || "USD";
  const fmt = formatCurrencyFn
    ? (v: number) => formatCurrencyFn(v, mainCurr)
    : (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return printAccountingDocument({
    title: `سند قيد يومية عامة - رقم ${entry.reference || entry.id}`,
    subtitle: `التاريخ: ${entry.date || "-"} | البيان العام: ${entry.description || "بدون بيان"} | عملة القيد: ${mainCurr}`,
    documentNo: entry.reference || entry.id,
    columns: [
      { key: "index", label: "#", align: "center" },
      { key: "account", label: "الحساب / الدليل المحاسبي", align: "right" },
      { key: "description", label: "شرح الحركة / البيان الفرعي", align: "right" },
      { key: "currency", label: "العملة", align: "center" },
      { key: "debit", label: "جانب مدين", align: "left" },
      { key: "credit", label: "جانب دائن", align: "left" },
    ],
    rows,
    totals: [
      { label: "إجمالي الجانب المدين:", value: `${fmt(totalDebit)}` },
      { label: "إجمالي الجانب الدائن:", value: `${fmt(totalCredit)}` },
      {
        label: "حالة اتزان القيد:",
        value: Math.abs(totalDebit - totalCredit) < 0.05 ? "متزن ✓" : "غير متزن ⚠️",
      },
    ],
  });
}
