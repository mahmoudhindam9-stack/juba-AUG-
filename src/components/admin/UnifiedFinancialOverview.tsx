import { useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Building2,
  CircleCheck,
  FileSpreadsheet,
  FileText,
  History,
  Printer,
  RefreshCw,
  Scale,
  WalletCards,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { printAccountingDocument } from "@/shared/utils/printAccountingDocument";

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLocaleLowerCase("ar-EG")
    .normalize("NFKC")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim();

const isCibTreasury = (treasury: any, account?: any) => {
  const text = normalize(
    [treasury?.name_ar, treasury?.account_code, account?.name_ar, account?.code].filter(Boolean).join(" "),
  );
  return treasury?.system_binding === "treasury_cib" || text.includes("cib") || text.includes("سيب") || text.includes("البنك الرئيسي");
};

const money = (value: number) => Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export function UnifiedFinancialOverview({
  erpState,
  currentBranch,
  onOpenOperations,
}: {
  erpState: any;
  currentBranch: any;
  onOpenOperations: () => void;
}) {
  const accounts = erpState?.accounts || [];
  const journalEntries = erpState?.journalEntries || [];

  const visibleTreasuries = useMemo(() => {
    return (erpState?.treasuries || [])
      .filter((t: any) => t.branch_id === currentBranch?.id && !t.deleted)
      .map((treasury: any) => {
        const linkedAccount = accounts.find((a: any) =>
          (treasury.account_code && a.code === treasury.account_code) ||
          a.system_binding === `treasury_${treasury.id}`,
        );
        return { treasury, linkedAccount };
      })
      .filter(({ treasury, linkedAccount }: any) => !isCibTreasury(treasury, linkedAccount));
  }, [erpState?.treasuries, currentBranch?.id, accounts]);

  const summary = useMemo(() => {
    const total = (type: string) =>
      accounts.filter((a: any) => a.type === type).reduce((sum: number, a: any) => sum + Number(a.balance || 0), 0);
    const eligibleLinked = visibleTreasuries.filter(({ linkedAccount }: any) => linkedAccount);
    const treasuryByCurrency = eligibleLinked.reduce((acc: Record<string, number>, { treasury, linkedAccount }: any) => {
      const currency = linkedAccount?.currency || treasury?.currency || "EGP";
      const value = Number(linkedAccount?.balance ?? treasury?.balance ?? 0);
      acc[currency] = (acc[currency] || 0) + value;
      return acc;
    }, {});
    const balancedEntries = journalEntries.filter((entry: any) => {
      const debit = (entry.lines || []).reduce((sum: number, line: any) => sum + Number(line.debit || 0), 0);
      const credit = (entry.lines || []).reduce((sum: number, line: any) => sum + Number(line.credit || 0), 0);
      return Math.abs(debit - credit) < 0.01;
    }).length;
    return {
      assets: total("asset"),
      liabilities: total("liability"),
      equity: total("equity"),
      revenue: total("revenue"),
      expenses: total("expense"),
      activeAccounts: accounts.filter((a: any) => a.status === "active").length,
      totalAccounts: accounts.length,
      journals: journalEntries.length,
      balancedEntries,
      linkedTreasuries: eligibleLinked.length,
      treasuryByCurrency,
    };
  }, [accounts, journalEntries, visibleTreasuries]);

  const syncRate = summary.journals ? Math.round((summary.balancedEntries / summary.journals) * 100) : 100;

  const printSummary = () =>
    printAccountingDocument({
      title: "الملخص المالي الموحد",
      subtitle: `${currentBranch?.name_ar || currentBranch?.name || "الفرع الحالي"} — مصدر الأرقام: دليل الحسابات ودفتر الأستاذ العام",
      documentNo: `FIN-SUM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`,
      columns: [
        { key: "metric", label: "المؤشر" },
        { key: "value", label: "القيمة", align: "left" },
        { key: "source", label: "المصدر" },
      ],
      rows: [
        { metric: "الأصول", value: money(summary.assets), source: "دليل الحسابات" },
        { metric: "الالتزامات", value: money(summary.liabilities), source: "دليل الحسابات" },
        { metric: "حقوق الملكية", value: money(summary.equity), source: "دليل الحسابات" },
        { metric: "الإيرادات", value: money(summary.revenue), source: "دليل الحسابات" },
        { metric: "المصروفات", value: money(summary.expenses), source: "دليل الحسابات" },
        { metric: "عدد الحسابات النشطة", value: String(summary.activeAccounts), source: "دليل الحسابات" },
        { metric: "عدد قيود الأستاذ", value: String(summary.journals), source: "دفتر الأستاذ" },
        { metric: "القيود المتزنة", value: `${summary.balancedEntries} (${syncRate}%)`, source: "دفتر الأستاذ" },
        { metric: "الخزن المرتبطة", value: String(summary.linkedTreasuries), source: "الحسابات + الخزائن" },
      ],
    });

  const printTreasuries = () =>
    printAccountingDocument({
      title: "تقرير الخزن والحسابات المرتبطة",
      subtitle: `${currentBranch?.name_ar || currentBranch?.name || "الفرع الحالي"} — الأرصدة المعروضة من الحساب المرتبط عند توفره`,
      documentNo: `TREASURY-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`,
      columns: [
        { key: "treasury", label: "الخزينة" },
        { key: "accountCode", label: "رقم الحساب" },
        { key: "accountName", label: "اسم الحساب" },
        { key: "balance", label: "الرصيد", align: "left" },
        { key: "currency", label: "العملة", align: "center" },
        { key: "status", label: "الحالة", align: "center" },
      ],
      rows: visibleTreasuries.map(({ treasury, linkedAccount }: any) => ({
        treasury: treasury.name_ar,
        accountCode: linkedAccount?.code || treasury.account_code || "غير مربوط",
        accountName: linkedAccount?.name_ar || "غير مربوط بحساب",
        balance: money(Number(linkedAccount?.balance ?? treasury.balance ?? 0)),
        currency: linkedAccount?.currency || treasury.currency || "EGP",
        status: linkedAccount ? "متزامن" : "يحتاج ربط",
      })),
    });

  const printLedger = () =>
    printAccountingDocument({
      title: "تقرير دفتر الأستاذ — القيود المحاسبية",
      subtitle: `${currentBranch?.name_ar || currentBranch?.name || "الفرع الحالي"} — ${journalEntries.length} قيد`,
      documentNo: `GL-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`,
      columns: [
        { key: "date", label: "التاريخ" },
        { key: "reference", label: "المرجع" },
        { key: "description", label: "البيان" },
        { key: "debit", label: "مدين", align: "left" },
        { key: "credit", label: "دائن", align: "left" },
        { key: "accounts", label: "الحسابات" },
      ],
      rows: journalEntries.map((entry: any) => ({
        date: entry.date || "-",
        reference: entry.reference || entry.id || "-",
        description: entry.description || "-",
        debit: money((entry.lines || []).reduce((sum: number, line: any) => sum + Number(line.debit || 0), 0)),
        credit: money((entry.lines || []).reduce((sum: number, line: any) => sum + Number(line.credit || 0), 0)),
        accounts: (entry.lines || []).map((line: any) => {
          const account = accounts.find((a: any) => a.code === line.account_code);
          return `${line.account_code || ""} — ${account?.name_ar || "حساب غير معرف"}`;
        }).join(" | "),
      })),
      totals: [
        { label: "عدد القيود", value: String(journalEntries.length) },
        { label: "قيود متزنة", value: `${summary.balancedEntries}` },
      ],
    });

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const metricsSheet = XLSX.utils.json_to_sheet([
      ["المؤشر", "القيمة"],
      ["الأصول", summary.assets],
      ["الالتزامات", summary.liabilities],
      ["حقوق الملكية", summary.equity],
      ["الإيرادات", summary.revenue],
      ["المصروفات", summary.expenses],
      ["عدد الحسابات النشطة", summary.activeAccounts],
      ["عدد قيود الأستاذ", summary.journals],
      ["القيود المتزنة", summary.balancedEntries],
    ]);
    const treasurySheet = XLSX.utils.json_to_sheet(
      visibleTreasuries.map(({ treasury, linkedAccount }: any) => ({
        "الخزينة": treasury.name_ar,
        "رقم الحساب": linkedAccount?.code || treasury.account_code || "غير مربوط",
        "اسم الحساب": linkedAccount?.name_ar || "غير مربوط",
        "الرصيد": Number(linkedAccount?.balance ?? treasury.balance ?? 0),
        "العملة": linkedAccount?.currency || treasury.currency || "EGP",
        "الحالة": linkedAccount ? "متزامن" : "يحتاج ربط",
      })),
    );
    const ledgerSheet = XLSX.utils.json_to_sheet(
      journalEntries.map((entry: any) => ({
        "التاريخ": entry.date || "-",
        "المرجع": entry.reference || entry.id || "-",
        "البيان": entry.description || "-",
        "مدين": (entry.lines || []).reduce((sum: number, line: any) => sum + Number(line.debit || 0), 0),
        "دائن": (entry.lines || []).reduce((sum: number, line: any) => sum + Number(line.credit || 0), 0),
      })),
    );
    XLSX.utils.book_append_sheet(workbook, metricsSheet, "المؤشرات");
    XLSX.utils.book_append_sheet(workbook, treasurySheet, "الخزن");
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, "الأستاذ");
    XLSX.writeFile(workbook, `التقرير_المالي_الموحد_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const metricCards = [
    { label: "الأصول", value: money(summary.assets), tone: "emerald", icon: ArrowUpRight },
    { label: "الالتزامات", value: money(summary.liabilities), tone: "rose", icon: ArrowDownLeft },
    { label: "الإيرادات", value: money(summary.revenue), tone: "blue", icon: Activity },
    { label: "المصروفات", value: money(summary.expenses), tone: "amber", icon: FileText },
    { label: "حقوق الملكية", value: money(summary.equity), tone: "violet", icon: Scale },
  ];

  return (
    <section className="space-y-5 mb-7" dir="rtl">
      <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-emerald-950 px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="border-white/15 bg-white/10 text-emerald-200">مصدر مالي موحد</Badge>
                  <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">مزامنة الحسابات + الأستاذ + الخزن</Badge>
                </div>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">لوحة الرقابة المالية والخزن</h2>
                <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300 sm:text-sm">
                  جميع المؤشرات الظاهرة هنا تُحسب من نفس دليل الحسابات ودفتر الأستاذ العام المستخدمين في النظام، والخزن تُعرض من الحساب المرتبط بها عند توفره.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={onOpenOperations} variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold">
                  <History size={15} className="ml-2" /> سجل العمليات
                </Button>
                <Button onClick={printSummary} variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold">
                  <Printer size={15} className="ml-2" /> طباعة المؤشرات
                </Button>
                <Button onClick={printTreasuries} variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold">
                  <WalletCards size={15} className="ml-2" /> طباعة الخزن
                </Button>
                <Button onClick={printLedger} variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold">
                  <BookOpen size={15} className="ml-2" /> طباعة الأستاذ
                </Button>
                <Button onClick={exportExcel} className="bg-emerald-600 text-white hover:bg-emerald-500 font-black">
                  <FileSpreadsheet size={15} className="ml-2" /> Excel موحد
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 bg-slate-50/80 p-4 sm:grid-cols-2 xl:grid-cols-5">
            {metricCards.map((card) => {
              const Icon = card.icon;
              const tone = {
                emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
                rose: "border-rose-200 bg-rose-50/60 text-rose-800",
                blue: "border-blue-200 bg-blue-50/60 text-blue-800",
                amber: "border-amber-200 bg-amber-50/60 text-amber-800",
                violet: "border-violet-200 bg-violet-50/60 text-violet-800",
              }[card.tone];
              return (
                <div key={card.label} className={`rounded-2xl border p-4 ${tone}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-black opacity-75">{card.label}</span>
                    <Icon size={17} />
                  </div>
                  <div className="mt-2 font-mono text-xl font-black">{card.value}</div>
                  <div className="mt-1 text-[10px] font-semibold opacity-70">من نفس دليل الحسابات</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-black">
              <Building2 className="text-emerald-600" size={18} /> الخزن الفعلية المرتبطة بالحسابات
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleTreasuries.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm font-bold text-slate-500">لا توجد خزن مرتبطة بهذا الفرع.</div>
            ) : (
              visibleTreasuries.map(({ treasury, linkedAccount }: any) => {
                const balance = Number(linkedAccount?.balance ?? treasury.balance ?? 0);
                return (
                  <div key={treasury.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">{treasury.name_ar}</div>
                        <div className="mt-1 text-[10px] font-mono text-slate-500">
                          {linkedAccount?.code || treasury.account_code || "بدون رقم حساب"}
                        </div>
                      </div>
                      {linkedAccount ? (
                        <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700"><CircleCheck size={12} /> متزامن</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-300 text-amber-700">غير مربوط</Badge>
                      )}
                    </div>
                    <div className="mt-4 font-mono text-2xl font-black text-slate-900">{money(balance)}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{linkedAccount?.name_ar || "لا يوجد حساب مرتبط"}</span>
                      <span className="font-bold">{linkedAccount?.currency || treasury.currency || "EGP"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-black">
              <RefreshCw className="text-blue-600" size={18} /> صحة المزامنة المحاسبية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border bg-slate-50 p-4"><div className="text-[11px] font-bold text-slate-500">الحسابات النشطة</div><div className="mt-1 text-2xl font-black">{summary.activeAccounts}<span className="text-sm text-slate-400"> / {summary.totalAccounts}</span></div></div>
            <div className="rounded-2xl border bg-emerald-50/60 p-4"><div className="text-[11px] font-bold text-emerald-700">القيود المتزنة</div><div className="mt-1 text-2xl font-black text-emerald-800">{summary.balancedEntries}<span className="text-sm text-emerald-600"> / {summary.journals}</span></div></div>
            <div className="rounded-2xl border bg-blue-50/60 p-4"><div className="text-[11px] font-bold text-blue-700">نسبة اتزان الأستاذ</div><div className="mt-1 text-2xl font-black text-blue-800">{syncRate}%</div></div>
            <div className="text-[10px] leading-5 text-slate-500">الحسابات والخزن المعروضة أعلاه تعتمد على نفس الحالة الحية لـ <span className="font-mono">erpStore</span>.</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
