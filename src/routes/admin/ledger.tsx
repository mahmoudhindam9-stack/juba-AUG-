import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  erpStore,
  type Account,
  type JournalEntry,
  type JournalLine,
} from "@/shared/services/erpStore";

const getLineBaseValue = (amount: number | string, rate: number | string): number => {
  return erpStore.getLineBaseValue(amount, rate);
};
import { AccountSearchSelect } from "@/components/AccountSearchSelect";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import {
  BookOpen,
  Plus,
  Search,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Briefcase,
  Layers,
  Scale,
  Printer,
  Calendar,
  AlertCircle,
  HelpCircle,
  Trash2,
  PlusCircle,
  ArrowUpDown,
  Filter,
  Check,
  TrendingUp,
  Percent,
  Eye,
  Edit,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/ledger")({
  head: () => ({ meta: [{ title: "حساب الأستاذ العام والدفاتر المالية" }] }),
  component: LedgerPage,
});

const ACCOUNT_TYPE_LABELS: Record<Account["type"], string> = {
  asset: "أصول",
  liability: "التزامات",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

function LedgerPage() {
  const { toast } = useToast();
  const settings = useSettings();
  const formatCurrency =
    settings.formatCurrency || ((val: number, cur = "EGP") => `${val.toLocaleString()} ${cur}`);

  // ERP Store subscription
  const [erpState, setErpState] = useState(() => erpStore.getState());
  useEffect(() => {
    return erpStore.subscribe((state) => {
      if (state) setErpState({ ...state });
    });
  }, []);

  // UI state
  const [selectedTab, setSelectedTab] = useState("ledger");

  const [isImportingOracle, setIsImportingOracle] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const handleMergeAndSync = () => {
    try {
      setIsMerging(true);
      const res = erpStore.mergeAndSyncAllData();
      setErpState({ ...erpStore.getState() });
      toast({
        title: "⚡ تم دمج وتحديث البيانات بنجاح",
        description: `تمت مراجعة ومطابقة ${res.entriesCount} قيد محاسبي، والتحقق من ${res.accountsCount} حساب، ومزامنة أرصدة ${res.treasuriesUpdated} خزينة وحساب بنكي بنجاح.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ أثناء الدمج والتحديث",
        description: err?.message || "حدث خطأ أثناء دمج وتحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };
  
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImportingOracle(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          const objectRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

          // skip header
          const dataRows = rawRows.slice(1).filter(r => r.length > 0 && r[1]);

          function excelDateToJSDate(serial) {
            try {
              if (!serial) return new Date().toISOString();
              let date_info;
              if (typeof serial === 'string') {
                date_info = new Date(serial);
                if (isNaN(date_info.getTime())) {
                   const parts = serial.split(/[-/]/);
                   if (parts.length === 3) {
                     // assume DD/MM/YYYY or similar if invalid
                     // We will just try YYYY-MM-DD from the parts just in case
                     if (parts[2].length === 4) {
                       date_info = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                     } else {
                       date_info = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
                     }
                   }
                }
              } else if (typeof serial === 'number') {
                const utc_days  = Math.floor(serial - 25569);
                const utc_value = Math.floor(utc_days * 86400);
                date_info = new Date(utc_value * 1000);
              }
              if (!date_info || isNaN(date_info.getTime())) {
                return new Date().toISOString();
              }
              return date_info.toISOString();
            } catch (e) {
              return new Date().toISOString();
            }
          }

          const validData = dataRows.map(row => {
            // Mapping based on the exact image column layout:
            // row[0]: م
            // row[1]: كود الحساب (account_code)
            // row[2]: اسم الحساب (account_name)
            // row[3]: قيمة مدين (debit) -> Base Currency
            // row[4]: قيمة دائن (credit) -> Base Currency
            // row[5]: بيان الحساب (description)
            // row[6]: تاريخ القيد (date)
            // ...
            // row[12]: رقم القيد (journal_number)
            // ...
            // row[18]: بيان رئيسي للقيد (main_description)
            // ...
            // row[20]: العملة (currency_name)
            // row[21]: المعامل (exchange_rate)
            // row[22]: مدين عملة (debit_currency)
            // row[23]: دائن عملة (credit_currency)

            let debit = Number(row[3]) || 0;
            let credit = Number(row[4]) || 0;
            
            // In case the structure shifts slightly and amounts are empty, fallback to local currency cols if possible
            if (debit === 0 && credit === 0) {
               debit = Number(row[22]) || 0;
               credit = Number(row[23]) || 0;
            }

            const rawCurrency = String(row[20] || "EGP").toLowerCase();
            let currency = 'EGP';
            if (rawCurrency.includes('دولار') || rawCurrency.includes('usd')) currency = 'USD';
            else if (rawCurrency.includes('سودان') || rawCurrency.includes('ssp')) currency = 'SSP';

            return {
              account_code: String(row[1] || ""),
              account_name: row[2] || "",
              currency: currency,
              date: excelDateToJSDate(row[6] || row[5]), // Check col 6 first, fallback col 5
              description: row[5] || "",
              debit: debit,
              credit: credit,
              journal_number: row[12] || row[11] || "0",
              main_description: row[18] || row[17] || row[5] || "",
              bal_trx: "TRX" // By default mark all as TRX based on this sheet format
            };
          }).filter(r => r.debit > 0 || r.credit > 0);

          if (validData.length === 0) {
            toast({
              title: "تنبيه",
              description: "لم يتم العثور على أسطر قيود أو مبالغ صالحة في ملف الإكسيل المرفوع.",
              variant: "destructive",
            });
            return;
          }

          // Group into Journal Entries by journal_number / date
          const groups: Record<string, typeof validData> = {};
          validData.forEach((line) => {
            const groupKey = line.journal_number || (line.bal_trx === 'BAL' ? 'OPENING' : 'UNKNOWN');
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(line);
          });

          const newEntries: JournalEntry[] = [];
          Object.keys(groups).forEach((jNum) => {
            const lines = groups[jNum];
            const firstLine = lines[0];
            const entryId = jNum.startsWith('OPENING') 
              ? `ORACLE-OPENING-${Date.now().toString(36)}`
              : `ORACLE-TRX-${jNum}-${Date.now().toString(36)}`;

            newEntries.push({
              id: entryId,
              date: firstLine.date || new Date().toISOString(),
              description: firstLine.main_description || (jNum.startsWith('OPENING') ? `القيد الافتتاحي (${file.name})` : `قيد رقم ${jNum} من ملف إكسيل (${file.name})`),
              reference: `IMP-${jNum}`,
              currency: (firstLine.currency === 'عملة محلية' ? 'EGP' : firstLine.currency === 'جنيه سودانى' ? 'SSP' : firstLine.currency === 'دولار' ? 'USD' : (firstLine.currency || 'EGP')) as any,
              lines: lines.map((l) => ({
                account_code: l.account_code,
                debit: l.debit,
                credit: l.credit,
                description: l.description || l.account_name || "",
                currency: (l.currency === 'عملة محلية' ? 'EGP' : l.currency === 'جنيه سودانى' ? 'SSP' : l.currency === 'دولار' ? 'USD' : (l.currency || 'EGP')) as any,
                rate: 1,
              })),
            });
          });

          // Insert journal entries and link with treasuries & chart of accounts
          const result = erpStore.importJournalEntriesAndSyncTreasuries(newEntries, {
            sourceName: file.name,
          });

          // Re-sync and update state
          setErpState({ ...erpStore.getState() });

          toast({
            title: "✅ تم استيراد القيود وربط الخزائن بنجاح",
            description: `تم إدراج ${result.insertedEntries} قيد في دفتر اليومية، وإنشاء ${result.newAccountsCreated} حساب جديد في الدليل العام، وربط ${result.linkedTreasuryTransactions} حركة مالية بالخزائن الصحيحة.`,
          });
        } catch(err) {
          console.error(err);
          alert("حدث خطأ أثناء معالجة الملف. تأكد من أن الملف بنفس صيغة أوراكل.");
        } finally {
          setIsImportingOracle(false);
          if (e.target) e.target.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاستيراد');
      setIsImportingOracle(false);
      if (e.target) e.target.value = '';
    }
  };
const [selectedAccountCode, setSelectedAccountCode] = useState<string>("15010100"); // default to Admin USD treasury
  const [journalSearch, setJournalSearch] = useState("");
  const [journalCurrencyFilter, setJournalCurrencyFilter] = useState("ALL");
  const [journalStartDate, setJournalStartDate] = useState("");
  // Find imports and state section to add new states for viewing journal entries
  const [journalEndDate, setJournalEndDate] = useState("");

  // Journal Entry View/Print Dialog State
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [isViewJournalOpen, setIsViewJournalOpen] = useState(false);

  // Manual Journal Entry Dialog state
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isConfirmPostOpen, setIsConfirmPostOpen] = useState(false);
  const [newEntryDesc, setNewEntryDesc] = useState("");
  const [newEntryRef, setNewEntryRef] = useState("");
  const [newEntryId, setNewEntryId] = useState("");
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEntryLines, setNewEntryLines] = useState<
    (JournalLine & { currency?: string; rate?: number })[]
  >([
    { account_code: "", debit: 0, credit: 0, currency: "USD", rate: 1 },
    { account_code: "", debit: 0, credit: 0, currency: "SSP", rate: 1 },
  ]);

  const accounts = erpState?.accounts || [];
  const journalEntries = erpState?.journalEntries || [];

  // Selected account details
  const currentAccount = useMemo(() => {
    return accounts.find((a) => a.code === selectedAccountCode);
  }, [accounts, selectedAccountCode]);

  // Compute ledger lines for the selected account
  const ledgerLines = useMemo(() => {
    if (!selectedAccountCode) return [];

    // Filter journal entries containing this account
    const matchingEntries: { entry: JournalEntry; line: JournalLine }[] = [];

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.account_code === selectedAccountCode) {
          matchingEntries.push({ entry, line });
        }
      });
    });

    // Sort matching entries oldest first for cumulative balance calculation
    matchingEntries.sort(
      (a, b) => new Date(a.entry.date).getTime() - new Date(b.entry.date).getTime(),
    );

    let balance = currentAccount?.initial_balance || 0;
    const isAssetOrExpense = currentAccount?.type === "asset" || currentAccount?.type === "expense";

    return matchingEntries
      .map(({ entry, line }) => {
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;

        if (isAssetOrExpense) {
          balance += debit - credit;
        } else {
          balance += credit - debit;
        }

        return {
          id: `${entry.id}-${line.account_code}`,
          date: entry.date,
          description: entry.description,
          reference: entry.reference,
          currency: entry.currency || "USD",
          debit,
          credit,
          runningBalance: balance,
        };
      })
      .reverse(); // Display newest first in the UI
  }, [journalEntries, selectedAccountCode, currentAccount]);

  // Compute summaries
  const ledgerSummary = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    ledgerLines.forEach((l) => {
      totalDebit += l.debit;
      totalCredit += l.credit;
    });

    const isAssetOrExpense = currentAccount?.type === "asset" || currentAccount?.type === "expense";
    const netBalance = isAssetOrExpense
      ? (currentAccount?.initial_balance || 0) + totalDebit - totalCredit
      : (currentAccount?.initial_balance || 0) + totalCredit - totalDebit;

    return {
      totalDebit,
      totalCredit,
      netBalance,
      currency:
        currentAccount?.name_ar.includes("دولار") || currentAccount?.name_ar.includes("USD")
          ? "USD"
          : "EGP",
    };
  }, [ledgerLines, currentAccount]);

  // General Journal filtered entries
  const filteredJournal = useMemo(() => {
    return journalEntries.filter((je) => {
      // Search text
      const searchMatch =
        journalSearch === "" ||
        je.description.toLowerCase().includes(journalSearch.toLowerCase()) ||
        je.reference.toLowerCase().includes(journalSearch.toLowerCase()) ||
        je.id.toLowerCase().includes(journalSearch.toLowerCase()) ||
        je.lines.some((l) => {
          const accName = accounts.find((a) => a.code === l.account_code)?.name_ar || "";
          return (
            l.account_code.includes(journalSearch) ||
            accName.toLowerCase().includes(journalSearch.toLowerCase())
          );
        });

      // Currency filter
      const currencyMatch =
        journalCurrencyFilter === "ALL" || je.currency === journalCurrencyFilter;

      // Date match
      const dateMatch =
        (!journalStartDate || je.date >= journalStartDate) &&
        (!journalEndDate || je.date <= journalEndDate);

      return searchMatch && currencyMatch && dateMatch;
    });
  }, [
    journalEntries,
    journalSearch,
    journalCurrencyFilter,
    journalStartDate,
    journalEndDate,
    accounts,
  ]);

  // Trial Balance calculation
  const trialBalance = useMemo(() => {
    const rows = accounts.map((acc) => {
      let totalDebit = 0;
      let totalCredit = 0;

      // Scan journal entries
      journalEntries.forEach((je) => {
        je.lines.forEach((l) => {
          if (l.account_code === acc.code) {
            totalDebit += Number(l.debit) || 0;
            totalCredit += Number(l.credit) || 0;
          }
        });
      });

      const isAssetOrExpense = acc.type === "asset" || acc.type === "expense";
      const initial = Number(acc.initial_balance) || 0;

      let endingBalance = 0;
      let balanceType: "Dr" | "Cr" = "Dr";

      if (isAssetOrExpense) {
        endingBalance = initial + totalDebit - totalCredit;
        balanceType = endingBalance >= 0 ? "Dr" : "Cr";
        if (endingBalance < 0) endingBalance = Math.abs(endingBalance);
      } else {
        endingBalance = initial + totalCredit - totalDebit;
        balanceType = endingBalance >= 0 ? "Cr" : "Dr";
        if (endingBalance < 0) endingBalance = Math.abs(endingBalance);
      }

      return {
        code: acc.code,
        name: acc.name_ar,
        type: acc.type,
        initial,
        debitSum: totalDebit,
        creditSum: totalCredit,
        endingBalance,
        balanceType,
        currency: acc.name_ar.includes("دولار") ? "USD" : "EGP",
      };
    });

    const totalDebits = rows.reduce(
      (sum, r) => sum + (r.balanceType === "Dr" ? r.endingBalance : 0),
      0,
    );
    const totalCredits = rows.reduce(
      (sum, r) => sum + (r.balanceType === "Cr" ? r.endingBalance : 0),
      0,
    );

    return {
      rows,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.1,
    };
  }, [accounts, journalEntries]);

  // Income Statement
  const financialStatements = useMemo(() => {
    // Revenues
    const revenueAccounts = trialBalance.rows.filter((r) => r.type === "revenue");
    const totalRevenue = revenueAccounts.reduce(
      (sum, r) => sum + (r.balanceType === "Cr" ? r.endingBalance : -r.endingBalance),
      0,
    );

    // Expenses
    const expenseAccounts = trialBalance.rows.filter((r) => r.type === "expense");
    const totalExpense = expenseAccounts.reduce(
      (sum, r) => sum + (r.balanceType === "Dr" ? r.endingBalance : -r.endingBalance),
      0,
    );

    const netIncome = totalRevenue - totalExpense;

    // Assets
    const assetAccounts = trialBalance.rows.filter((r) => r.type === "asset");
    const totalAssets = assetAccounts.reduce(
      (sum, r) => sum + (r.balanceType === "Dr" ? r.endingBalance : -r.endingBalance),
      0,
    );

    // Liabilities
    const liabilityAccounts = trialBalance.rows.filter((r) => r.type === "liability");
    const totalLiabilities = liabilityAccounts.reduce(
      (sum, r) => sum + (r.balanceType === "Cr" ? r.endingBalance : -r.endingBalance),
      0,
    );

    // Equity
    const equityAccounts = trialBalance.rows.filter((r) => r.type === "equity");
    const totalEquity = equityAccounts.reduce(
      (sum, r) => sum + (r.balanceType === "Cr" ? r.endingBalance : -r.endingBalance),
      0,
    );

    return {
      revenueAccounts,
      totalRevenue,
      expenseAccounts,
      totalExpense,
      netIncome,
      assetAccounts,
      totalAssets,
      liabilityAccounts,
      totalLiabilities,
      equityAccounts,
      totalEquity,
      isBalanceSheetBalanced:
        Math.abs(totalAssets - (totalLiabilities + totalEquity + netIncome)) < 1.0,
    };
  }, [trialBalance]);

  // Add line to manual journal entry
  const addEntryLine = () => {
    const lastCurrency = newEntryLines[newEntryLines.length - 1]?.currency || "USD";
    setNewEntryLines([
      ...newEntryLines,
      { account_code: "", debit: 0, credit: 0, currency: lastCurrency, rate: 1 },
    ]);
  };

  // Remove line from manual journal entry
  const removeEntryLine = (index: number) => {
    if (newEntryLines.length <= 2) {
      toast({
        title: "خطأ في التعديل",
        description: "يجب أن يحتوي القيد المحاسبي على سطرين على الأقل",
        variant: "destructive",
      });
      return;
    }
    const lines = [...newEntryLines];
    lines.splice(index, 1);
    setNewEntryLines(lines);
  };

  // Smart handle account selection for line
  const handleAccountSelectForLine = (index: number, accountCode: string, account?: Account) => {
    const lines = [...newEntryLines];
    lines[index].account_code = accountCode;
    if (account) {
      let detectedCurrency = account.currency || "EGP";
      if (account.name_ar.includes("دولار") || account.name_ar.includes("USD")) {
        detectedCurrency = "USD";
      } else if (account.name_ar.includes("سوداني") || account.name_ar.includes("SSP")) {
        detectedCurrency = "SSP";
      } else if (account.name_ar.includes("مصري") || account.name_ar.includes("EGP")) {
        detectedCurrency = "EGP";
      }
      lines[index].currency = detectedCurrency;
      if (!lines[index].rate) {
        lines[index].rate = 1.0;
      }
    }
    setNewEntryLines(lines);
  };

  // Update line field
  const updateLine = (index: number, field: string, value: any) => {
    const lines = [...newEntryLines];
    if (field === "debit") {
      lines[index].debit = Number(value) || 0;
      if (lines[index].debit > 0) lines[index].credit = 0; // standard accounting
    } else if (field === "credit") {
      lines[index].credit = Number(value) || 0;
      if (lines[index].credit > 0) lines[index].debit = 0; // standard accounting
    } else if (field === "rate") {
      lines[index].rate = Number(value) || 1;
    } else if (field === "currency") {
      lines[index].currency = value;
    } else {
      (lines[index] as any)[field] = value;
    }
    setNewEntryLines(lines);
  };

  // Compute manual entry balance details with multi-currency exchange rates
  const newEntryTotals = useMemo(() => {
    const debitsBase = newEntryLines.reduce(
      (sum, l) => sum + getLineBaseValue(l.debit, l.rate || 1),
      0,
    );
    const creditsBase = newEntryLines.reduce(
      (sum, l) => sum + getLineBaseValue(l.credit, l.rate || 1),
      0,
    );
    const difference = Math.abs(debitsBase - creditsBase);
    return {
      debits: debitsBase,
      credits: creditsBase,
      difference,
      isBalanced: difference < 0.05,
    };
  }, [newEntryLines]);

  // Handle opening confirmation dialog for manual journal entry
  const handlePostEntry = () => {
    if (!newEntryDesc.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى كتابة شرح توضيحي للقيد اليومي",
        variant: "destructive",
      });
      return;
    }

    if (newEntryLines.some((l) => !l.account_code)) {
      toast({
        title: "خطأ في الحسابات",
        description: "يرجى تحديد حساب محاسبي صالح لجميع الأسطر",
        variant: "destructive",
      });
      return;
    }

    if (newEntryTotals.debits <= 0) {
      toast({
        title: "خطأ في المبالغ",
        description: "يجب أن تكون قيمة القيد المحاسبي أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    if (!newEntryTotals.isBalanced) {
      toast({
        title: "القيد غير متزن",
        description: "مجموع الجانب المدين المعادل يجب أن يساوي تماماً مجموع الجانب الدائن المعادل",
        variant: "destructive",
      });
      return;
    }

    // Everything is valid -> open confirmation dialog
    setIsConfirmPostOpen(true);
  };

  // Execute actual entry posting and update account balances
  const handleExecutePost = () => {
    const preparedLines: JournalLine[] = newEntryLines.map((l) => ({
      account_code: l.account_code,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      currency: l.currency || "USD",
      rate: Number(l.rate) || 1,
    }));

    // Call state store to register entry & update accounts
    erpStore.addJournalEntry(
      newEntryDesc,
      preparedLines,
      newEntryRef || undefined,
      preparedLines[0]?.currency || "USD",
      newEntryDate,
      newEntryId || undefined,
    );

    toast({
      title: "تم حفظ القيد وترحيله بنجاح",
      description: "تم إدراج القيد المزدوج في دفتر القيود وتحديث أرصدة الحسابات المعنية فوراً",
    });

    // Reset Form & Close Modal
    setNewEntryId("");
    setNewEntryDesc("");
    setNewEntryRef("");
    setNewEntryLines([
      { account_code: "", debit: 0, credit: 0, currency: "USD", rate: 1 },
      { account_code: "", debit: 0, credit: 0, currency: "SSP", rate: 1 },
    ]);
    setIsConfirmPostOpen(false);
    setIsNewEntryOpen(false);
  };

  // Exports
  const handleExportLedger = () => {
    const formatted = ledgerLines.map((l) => ({
      التاريخ: l.date,
      المرجع: l.reference,
      "شرح الحركة / البيان": l.description,
      العملة: l.currency,
      "مدين (Debit)": l.debit || "",
      "دائن (Credit)": l.credit || "",
      "الرصيد التراكمي": l.runningBalance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, currentAccount?.name_ar || "حساب الأستاذ");
    XLSX.writeFile(workbook, `كشف_حساب_${currentAccount?.name_ar}_${selectedAccountCode}.xlsx`);
    toast({ title: "تم التصدير بنجاح", description: "تم تحميل كشف الحساب بصيغة Excel" });
  };

  const handleExportJournal = () => {
    const rows: any[] = [];
    filteredJournal.forEach((je) => {
      je.lines.forEach((l, idx) => {
        const acc = accounts.find((a) => a.code === l.account_code);
        rows.push({
          "رقم القيد": je.id,
          التاريخ: je.date,
          المرجع: je.reference,
          "بيان القيد العام": idx === 0 ? je.description : "",
          "كود الحساب": l.account_code,
          "اسم الحساب": acc?.name_ar || "",
          العملة: je.currency,
          مدين: l.debit || "",
          دائن: l.credit || "",
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "دفتر اليومية العامة");
    XLSX.writeFile(workbook, `اليومية_العامة_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({ title: "تم التصدير بنجاح", description: "تم تحميل دفتر اليومية العامة بصيغة Excel" });
  };

  const handleExportTrialBalance = () => {
    const formatted = trialBalance.rows.map((r) => ({
      "كود الحساب": r.code,
      "اسم الحساب": r.name,
      النوع: ACCOUNT_TYPE_LABELS[r.type],
      الافتتاحي: r.initial || 0,
      "مجموع المدين": r.debitSum,
      "مجموع الدائن": r.creditSum,
      "الرصيد النهائي": r.endingBalance,
      "طبيعة الرصيد": r.balanceType === "Dr" ? "مدين" : "دائن",
      "العملة الأساسية": r.currency,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ميزان المراجعة");
    XLSX.writeFile(workbook, `ميزان_المراجعة_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({ title: "تم التصدير بنجاح", description: "تم تحميل ميزان المراجعة بصيغة Excel" });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              حساب الأستاذ العام والدفاتر المحاسبية
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            نظام مالي ومحاسبي متكامل يدير القيود المزدوجة، ميزان المراجعة، كشوف الأستاذ للشركات
            والمخازن.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Merge and Refresh All Data */}
          <Button
            variant="outline"
            onClick={handleMergeAndSync}
            disabled={isMerging}
            className="gap-2 rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold"
          >
            <RefreshCw className={`h-4 w-4 ${isMerging ? "animate-spin" : ""}`} />
            {isMerging ? "جاري الدمج والتحديث..." : "دمج وتحديث"}
          </Button>

          {/* Add Manual Entry Dialog */}
          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                إضافة قيد يومي مزدوج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  تسجيل قيد يومي يدوي مزدوج
                </DialogTitle>
                <DialogDescription>
                  أدخل أسطر الجانبين المدين والدائن مع الحسابات الصحيحة لإنشاء قيد مزدوج متزن ومرحّل
                  تلقائياً.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>رقم القيد</Label>
                    <Input
                      placeholder="تلقائي أو يدوي (مثال: JV-1001)"
                      value={newEntryId}
                      onChange={(e) => setNewEntryId(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-3">
                    <Label>شرح توضيحي للقيد المحاسبي *</Label>
                    <Input
                      placeholder="مثال: سداد مصروف الضيافة أو سلفة موظف..."
                      value={newEntryDesc}
                      onChange={(e) => setNewEntryDesc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المرجع / السند</Label>
                    <Input
                      placeholder="مثال: REF-10254"
                      value={newEntryRef}
                      onChange={(e) => setNewEntryRef(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <Input
                      type="date"
                      value={newEntryDate}
                      onChange={(e) => setNewEntryDate(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      أسطر الحركة المالية (Double-Entry lines)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewEntryLines([
                          ...newEntryLines,
                          {
                            account_code: "",
                            debit: 0,
                            credit: 0,
                            description: "",
                            currency: "EGP",
                            rate: 1,
                          },
                        ])
                      }
                      className="gap-1.5 rounded-xl border-dashed"
                    >
                      <PlusCircle className="h-4 w-4" />
                      إضافة سطر
                    </Button>
                  </div>


                  <div className="space-y-3">
                    {newEntryLines.map((line, index) => (
                      <div
                        key={index}
                        className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border shadow-2xs transition hover:border-primary/40"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
                          {/* Account Search Selector */}
                          <div className="md:col-span-4 space-y-1">
                            <Label className="text-xs font-semibold">
                              اختر الحساب (بحث بالاسم أو الرقم) *
                            </Label>
                            <AccountSearchSelect
                              value={line.account_code}
                              onChange={(code, acc) => handleAccountSelectForLine(index, code, acc)}
                              accounts={accounts}
                            />
                          </div>

                          {/* Line Currency */}
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs font-semibold">العملة</Label>
                            <Select
                              value={line.currency || "USD"}
                              onValueChange={(val) => updateLine(index, "currency", val)}
                            >
                              <SelectTrigger className="bg-card h-9 text-xs">
                                <SelectValue placeholder="العملة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EGP">EGP (ج.م)</SelectItem>
                                <SelectItem value="SSP">SSP (ج.س)</SelectItem>
                                <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Exchange Rate / Factor */}
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs font-semibold">المعامل / الصرف</Label>
                            <Input
                              type="number"
                              min="0.0001"
                              step="any"
                              placeholder="1.00"
                              className="bg-card h-9 text-xs font-mono"
                              value={line.rate !== undefined ? line.rate : 1}
                              onChange={(e) => updateLine(index, "rate", e.target.value)}
                            />
                          </div>

                          {/* Debit */}
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              مدين (Debit)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0.00"
                              className="bg-card h-9 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                              value={line.debit || ""}
                              onChange={(e) => updateLine(index, "debit", e.target.value)}
                              disabled={line.credit > 0}
                            />
                          </div>

                          {/* Credit */}
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                              دائن (Credit)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0.00"
                              className="bg-card h-9 text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
                              value={line.credit || ""}
                              onChange={(e) => updateLine(index, "credit", e.target.value)}
                              disabled={line.debit > 0}
                            />
                          </div>
                        </div>

                        {/* Equivalents and line summary row */}
                        <div className="flex items-center justify-between text-[11px] pt-1.5 text-muted-foreground border-t border-border/50">
                          <div className="flex items-center gap-2">
                            {(line.debit > 0 || line.credit > 0) && (
                              <Badge
                                variant="secondary"
                                className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20"
                              >
                                المعادل بالعملة الأساسية (USD):{" "}
                                {getLineBaseValue(
                                  line.debit || line.credit || 0,
                                  line.rate || 1,
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Badge>
                            )}
                            <span className="text-[11px]">
                              عملة السطر:{" "}
                              <strong className="font-mono text-foreground font-semibold">
                                {line.currency || "USD"}
                              </strong>
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntryLine(index)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-[11px] gap-1 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف السطر
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Balancer indicator */}
                <div className="p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/60 dark:bg-muted/30">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        إجمالي المدين (المعادل):
                      </span>
                      <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                        {newEntryTotals.debits.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-xs text-muted-foreground font-sans">USD</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        إجمالي الدائن (المعادل):
                      </span>
                      <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                        {newEntryTotals.credits.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-xs text-muted-foreground font-sans">USD</span>
                      </p>
                    </div>
                    <div className="border-r pr-6 border-border">
                      <span className="text-xs text-muted-foreground block">الصافي / الفرق:</span>
                      <p
                        className={`text-sm font-bold font-mono ${
                          newEntryTotals.isBalanced
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {newEntryTotals.difference.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-xs font-sans">USD</span>
                      </p>
                    </div>
                    <div className="border-r pr-6 border-border">
                      <span className="text-xs text-muted-foreground block">حالة القيد:</span>
                      <Badge
                        className={`mt-0.5 text-xs font-semibold ${
                          newEntryTotals.isBalanced
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                        }`}
                      >
                        {newEntryTotals.isBalanced ? "متزن ✓" : "غير متزن ✗"}
                      </Badge>
                    </div>
                  </div>

                  {!newEntryTotals.isBalanced && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>تنبيه: يجب توازن أطراف الحركة بالعملة الأساسية لترحيل القيد.</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handlePostEntry}
                  disabled={
                    !newEntryTotals.isBalanced || newEntryTotals.debits <= 0 || !newEntryDesc.trim()
                  }
                >
                  ترحيل القيد المزدوج
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirmation Alert Dialog */}
          <AlertDialog open={isConfirmPostOpen} onOpenChange={setIsConfirmPostOpen}>
            <AlertDialogContent className="max-w-2xl text-right dir-rtl">
              <AlertDialogHeader className="text-right space-y-2">
                <AlertDialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  تأكيد حفظ وترحيل القيد المحاسبي
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  هل أنت تأكد من ترحيل القيد المزدوج وحفظه نهائياً؟ سيتم إدراج الحركة في دفتر
                  اليومية وتعديل أرصدة الحسابات المعنية تلقائياً.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 my-2 text-sm">
                {/* Entry Metadata Box */}
                <div className="p-3.5 rounded-xl bg-muted/60 border space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                    <div>
                      <span className="text-xs text-muted-foreground">رقم القيد / المرجع: </span>
                      <strong className="font-mono text-foreground">
                        {newEntryId || "تلقائي"} {newEntryRef ? `(${newEntryRef})` : ""}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">التاريخ: </span>
                      <strong className="font-mono text-foreground">{newEntryDate}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">إجمالي القيد المعادل: </span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                        {newEntryTotals.debits.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        USD
                      </strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">الشرح التوضيحي: </span>
                    <span className="font-medium text-foreground">{newEntryDesc}</span>
                  </div>
                </div>

                {/* Affected Accounts Breakdown */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    الحسابات والأرصدة المتأثرة بالقيد:
                  </Label>
                  <div className="border rounded-xl divide-y max-h-56 overflow-y-auto bg-card">
                    {newEntryLines.map((line, idx) => {
                      const acc = (accounts || []).find((a) => a.code === line.account_code);
                      const isDebit = (line.debit || 0) > 0;
                      const origAmt = isDebit ? line.debit : line.credit;
                      const baseVal = getLineBaseValue(origAmt || 0, line.rate || 1);
                      return (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`font-mono text-[11px] ${isDebit ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300" : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300"}`}
                            >
                              {isDebit ? "مدين" : "دائن"}
                            </Badge>
                            <div>
                              <span className="font-semibold text-foreground">
                                {acc ? acc.name : line.account_code}
                              </span>
                              <span className="text-muted-foreground font-mono mr-1">
                                ({line.account_code})
                              </span>
                            </div>
                          </div>
                          <div className="text-left font-mono">
                            <span className="font-bold text-foreground">
                              {Number(origAmt).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}{" "}
                              {line.currency || "USD"}
                            </span>
                            {line.currency && line.currency !== "USD" && (
                              <div className="text-[10px] text-muted-foreground">
                                المعادل:{" "}
                                {baseVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                                USD (معامل {line.rate})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                <AlertDialogCancel onClick={() => setIsConfirmPostOpen(false)}>
                  رجوع للتعديل
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleExecutePost}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  تأكيد وحفظ القيد
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs list */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl flex w-full md:w-max grid grid-cols-4 md:flex">
          <TabsTrigger value="ledger" className="rounded-lg py-2 text-xs md:text-sm">
            كشف حساب الأستاذ
          </TabsTrigger>
          <TabsTrigger value="journal" className="rounded-lg py-2 text-xs md:text-sm">
            دفتر اليومية العامة
          </TabsTrigger>
          <TabsTrigger value="trial" className="rounded-lg py-2 text-xs md:text-sm">
            ميزان المراجعة
          </TabsTrigger>
          <TabsTrigger value="statements" className="rounded-lg py-2 text-xs md:text-sm">
            القوائم المالية
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Ledger Account Details */}
        <TabsContent value="ledger" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Account selector and metadata */}
            <Card className="lg:col-span-1 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  اختيار الحساب المحاسبي
                </CardTitle>
                <CardDescription>
                  عرض كشف التحليلي ودفتر الأستاذ الخاص بالحساب المختار
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>الحساب المالي (البحث الذكي)</Label>
                  <AccountSearchSelect
                    value={selectedAccountCode}
                    onChange={(code) => setSelectedAccountCode(code)}
                    accounts={accounts}
                    placeholder="ابحث برقم أو اسم الحساب..."
                  />
                </div>

                <div className="h-px bg-border my-2" />

                {currentAccount && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        كود الحساب المحاسبي:
                      </span>
                      <span className="text-sm font-mono font-bold text-foreground">
                        {currentAccount.code}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">نوع الحساب:</span>
                      <Badge variant="outline" className="mt-1">
                        {ACCOUNT_TYPE_LABELS[currentAccount.type]}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">الرصيد الافتتاحي:</span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {formatCurrency(
                          currentAccount.initial_balance || 0,
                          ledgerSummary.currency,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">الحالة الحالية:</span>
                      <Badge className="mt-1 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        نشط ومرحل
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards and Movements Ledger Table */}
            <div className="lg:col-span-3 space-y-6">
              {/* Ledger Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">
                        إجمالي الجانب المدين (Dr)
                      </span>
                      <h3 className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(ledgerSummary.totalDebit, ledgerSummary.currency)}
                      </h3>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">
                        إجمالي الجانب الدائن (Cr)
                      </span>
                      <h3 className="text-xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
                        {formatCurrency(ledgerSummary.totalCredit, ledgerSummary.currency)}
                      </h3>
                    </div>
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                      <ArrowDownLeft className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-primary/20 bg-primary/5">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">
                        صافي الرصيد النهائي للأستاذ
                      </span>
                      <h3 className="text-xl font-extrabold font-mono mt-1 text-primary">
                        {formatCurrency(ledgerSummary.netBalance, ledgerSummary.currency)}
                      </h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions Table */}
              <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">
                      الحركات القييدية المفصلة (دفتر حساب الأستاذ)
                    </CardTitle>
                    <CardDescription>
                      الحركات والقيود التي تمت على هذا الحساب بالتسلسل الزمني
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportLedger}
                      className="gap-1.5 rounded-xl"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      تصدير Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase border-y">
                        <tr>
                          <th className="p-4">التاريخ</th>
                          <th className="p-4">المرجع</th>
                          <th className="p-4">شرح وتفاصيل الحركة</th>
                          <th className="p-4 text-emerald-600 dark:text-emerald-400">
                            مدين (Debit)
                          </th>
                          <th className="p-4 text-rose-600 dark:text-rose-400">دائن (Credit)</th>
                          <th className="p-4 text-primary">الرصيد التراكمي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-b">
                        {ledgerLines.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              لا توجد حركات مسجلة لهذا الحساب. يمكنك إضافة قيد يدوي بالأعلى.
                            </td>
                          </tr>
                        ) : (
                          ledgerLines.map((line) => (
                            <tr key={line.id} className="hover:bg-muted/20 transition">
                              <td className="p-4 font-mono">{line.date}</td>
                              <td className="p-4 font-mono">
                                <Badge variant="secondary" className="font-mono">
                                  {line.reference}
                                </Badge>
                              </td>
                              <td className="p-4 max-w-sm font-medium">{line.description}</td>
                              <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">
                                {line.debit > 0 ? formatCurrency(line.debit, line.currency) : "-"}
                              </td>
                              <td className="p-4 font-mono text-rose-600 dark:text-rose-400">
                                {line.credit > 0 ? formatCurrency(line.credit, line.currency) : "-"}
                              </td>
                              <td className="p-4 font-bold font-mono text-foreground">
                                {formatCurrency(line.runningBalance, line.currency)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: General Journal Ledger */}
        <TabsContent value="journal" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-base font-bold">
                  دفتر اليومية العامة (General Journal)
                </CardTitle>
                <CardDescription>
                  سجل كامل لجميع القيود المحاسبية المزدوجة التي تمت في النظام
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJournal}
                  className="gap-1.5 rounded-xl"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  تصدير دفتر اليومية بصيغة Excel
                </Button>

                
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    onChange={handleFileUpload}
                    disabled={isImportingOracle}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    title="اختر ملف إكسيل لرفعه"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    disabled={isImportingOracle}
                    className="gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white w-full pointer-events-none"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {isImportingOracle ? "جاري الاستيراد..." : "رفع ملف قيود أوراكل Excel"}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMergeAndSync}
                  disabled={isMerging}
                  className="gap-1.5 rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold"
                >
                  <RefreshCw className={`h-4 w-4 ${isMerging ? "animate-spin" : ""}`} />
                  {isMerging ? "جاري الدمج والتحديث..." : "دمج وتحديث"}
                </Button>


              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div className="space-y-1.5">
                  <Label className="text-xs">بحث بالبيان أو المرجع أو رقم القيد</Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث..."
                      className="pr-9"
                      value={journalSearch}
                      onChange={(e) => setJournalSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">الفلترة بالعملة</Label>
                  <Select value={journalCurrencyFilter} onValueChange={setJournalCurrencyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">جميع العملات</SelectItem>
                      <SelectItem value="USD">USD - دولار أمريكي</SelectItem>
                      <SelectItem value="EGP">EGP - جنيه مصري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">تاريخ البدء</Label>
                  <Input
                    type="date"
                    value={journalStartDate}
                    onChange={(e) => setJournalStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">تاريخ الانتهاء</Label>
                  <Input
                    type="date"
                    value={journalEndDate}
                    onChange={(e) => setJournalEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Journal entries explorer list */}
              <div className="space-y-4">
                {filteredJournal.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl">
                    لا توجد قيود يومية تطابق معايير البحث والفلترة المحددة.
                  </div>
                ) : (
                  filteredJournal.map((entry) => {
                    const totalDebit = entry.lines.reduce(
                      (sum, l) => sum + (Number(l.debit) || 0),
                      0,
                    );
                    return (
                      <div
                        key={entry.id}
                        className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition"
                      >
                        {/* Entry Header */}
                        <div className="bg-muted/40 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {entry.description}
                            </span>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {entry.reference}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              قيد: {entry.id.substring(3, 10).toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                            <span>التاريخ: {entry.date}</span>
                            <span>بواسطة: {entry.created_by || "النظام الآلي"}</span>
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100">
                              مرحل ومرحلة
                            </Badge>
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-md"
                                onClick={() => {
                                  setSelectedJournal(entry);
                                  setIsViewJournalOpen(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-7 w-7 rounded-md">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-md"
                                onClick={() => {
                                  setSelectedJournal(entry);
                                  setTimeout(() => window.print(), 300);
                                }}
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Entry Lines */}
                        <div className="p-0">
                          <table className="w-full text-sm text-right">
                            <thead className="bg-muted/20 text-muted-foreground text-xs font-semibold">
                              <tr>
                                <th className="p-3 pr-6">الحساب المالي</th>
                                <th className="p-3">رقم الحساب</th>
                                <th className="p-3">نوع الحساب</th>
                                <th className="p-3 text-emerald-600 dark:text-emerald-400">
                                  مدين (Debit)
                                </th>
                                <th className="p-3 text-rose-600 dark:text-rose-400">
                                  دائن (Credit)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {entry.lines.map((line, idx) => {
                                const acc = accounts.find((a) => a.code === line.account_code);
                                const lineCurr = line.currency || entry.currency || "USD";
                                const lineRate = line.rate || 1;
                                const isMultiCurr = lineCurr !== entry.currency || lineRate !== 1;

                                return (
                                  <tr key={idx} className="hover:bg-muted/10 transition">
                                    <td className="p-3 pr-6 font-medium">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={
                                            line.credit > 0
                                              ? "mr-4 text-rose-700 dark:text-rose-300 block font-semibold"
                                              : "text-emerald-700 dark:text-emerald-300 block font-semibold"
                                          }
                                        >
                                          {acc?.name_ar || "حساب غير محدد"}
                                        </span>
                                        {isMultiCurr && (
                                          <Badge
                                            variant="outline"
                                            className="font-mono text-[10px] px-1.5 py-0 bg-muted"
                                          >
                                            {lineCurr} {lineRate !== 1 ? `@ ${lineRate}` : ""}
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-3 font-mono text-xs text-muted-foreground">
                                      {line.account_code}
                                    </td>
                                    <td className="p-3 text-xs text-muted-foreground">
                                      {acc ? ACCOUNT_TYPE_LABELS[acc.type] : "-"}
                                    </td>
                                    <td className="p-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                      {line.debit > 0 ? (
                                        <div>
                                          <span>{formatCurrency(line.debit, lineCurr)}</span>
                                          {lineRate !== 1 && (
                                            <span className="block text-[10px] text-muted-foreground">
                                              (= {(line.debit * lineRate).toLocaleString()}{" "}
                                              {entry.currency})
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <td className="p-3 font-mono font-medium text-rose-600 dark:text-rose-400">
                                      {line.credit > 0 ? (
                                        <div>
                                          <span>{formatCurrency(line.credit, lineCurr)}</span>
                                          {lineRate !== 1 && (
                                            <span className="block text-[10px] text-muted-foreground">
                                              (= {(line.credit * lineRate).toLocaleString()}{" "}
                                              {entry.currency})
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-muted/10">
                              <tr>
                                <td
                                  colSpan={3}
                                  className="p-3 pr-6 font-bold text-xs text-muted-foreground"
                                >
                                  إجمالي القيد المزدوج المتزن
                                </td>
                                <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 border-t border-double">
                                  {formatCurrency(totalDebit, entry.currency || "USD")}
                                </td>
                                <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 border-t border-double">
                                  {formatCurrency(totalDebit, entry.currency || "USD")}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Trial Balance */}
        <TabsContent value="trial" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">
                  ميزان المراجعة بالأرصدة (Trial Balance Sheet)
                </CardTitle>
                <CardDescription>
                  عرض لجميع أرصدة الحسابات للتأكد من صحة وتوازن الجانبين الدائن والمدين للدفاتر
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTrialBalance}
                  className="gap-1.5 rounded-xl"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  تصدير ميزان المراجعة
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Trial Balance Table */}
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/50 text-muted-foreground text-xs font-semibold border-b">
                    <tr>
                      <th className="p-4">كود الحساب</th>
                      <th className="p-4">اسم الحساب</th>
                      <th className="p-4">نوع الحساب</th>
                      <th className="p-4 text-emerald-600 dark:text-emerald-400">
                        الحركات المدينة (Dr)
                      </th>
                      <th className="p-4 text-rose-600 dark:text-rose-400">الحركات الدائنة (Cr)</th>
                      <th className="p-4 text-primary">الرصيد النهائي (مدين)</th>
                      <th className="p-4 text-primary">الرصيد النهائي (دائن)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {trialBalance.rows.map((row) => (
                      <tr key={row.code} className="hover:bg-muted/20 transition">
                        <td className="p-4 font-mono text-xs">{row.code}</td>
                        <td className="p-4 font-bold">{row.name}</td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {ACCOUNT_TYPE_LABELS[row.type]}
                        </td>
                        <td className="p-4 font-mono text-muted-foreground">
                          {row.debitSum > 0 ? formatCurrency(row.debitSum, row.currency) : "-"}
                        </td>
                        <td className="p-4 font-mono text-muted-foreground">
                          {row.creditSum > 0 ? formatCurrency(row.creditSum, row.currency) : "-"}
                        </td>
                        <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {row.balanceType === "Dr" && row.endingBalance > 0
                            ? formatCurrency(row.endingBalance, row.currency)
                            : "-"}
                        </td>
                        <td className="p-4 font-mono text-rose-600 dark:text-rose-400 font-semibold">
                          {row.balanceType === "Cr" && row.endingBalance > 0
                            ? formatCurrency(row.endingBalance, row.currency)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/60 font-bold border-t">
                    <tr>
                      <td colSpan={3} className="p-4 text-left">
                        إجمالي ميزان المراجعة بالأرصدة النهائية
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground"></td>
                      <td className="p-4 font-mono text-xs text-muted-foreground"></td>
                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 text-base">
                        {formatCurrency(trialBalance.totalDebits, "USD")}
                      </td>
                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 text-base">
                        {formatCurrency(trialBalance.totalCredits, "USD")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Balancing Alert block */}
              {trialBalance.isBalanced ? (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800/60 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                      ميزان المراجعة متوازن تماماً
                    </span>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      مجموع أرصدة الحسابات المدينة مساوي تماماً لأرصدة الحسابات الدائنة (
                      {formatCurrency(trialBalance.totalDebits, "USD")}). الدفاتر المالية صحيحة
                      دفترياً.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/60 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-rose-800 dark:text-rose-300">
                      انتبه! ميزان المراجعة غير متوازن
                    </span>
                    <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                      هناك فرق بين إجمالي الأرصدة المدينة والدائنة بقيمة{" "}
                      {formatCurrency(
                        Math.abs(trialBalance.totalDebits - trialBalance.totalCredits),
                        "USD",
                      )}
                      . يرجى مراجعة توازن القيود السابقة.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Financial Statements */}
        <TabsContent value="statements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Statement (قائمة الدخل) */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">
                      قائمة الدخل التقديرية (Income Statement)
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    سنة 2026
                  </Badge>
                </div>
                <CardDescription>
                  الملخص المالي للإيرادات والتكاليف وصافي الأرباح أو الخسائر
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span>1. الإيرادات والمبيعات (Revenues)</span>
                  </h4>
                  <div className="bg-muted/40 p-3 rounded-lg divide-y text-sm">
                    {financialStatements.revenueAccounts.map((r) => (
                      <div key={r.code} className="flex justify-between py-2">
                        <span className="text-muted-foreground">{r.name}</span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(r.endingBalance, r.currency)}
                        </span>
                      </div>
                    ))}
                    {financialStatements.revenueAccounts.length === 0 && (
                      <p className="py-2 text-xs text-center text-muted-foreground">
                        لا توجد حسابات مبيعات نشطة حالياً
                      </p>
                    )}
                    <div className="flex justify-between py-2 font-bold text-foreground pt-3">
                      <span>إجمالي الإيرادات والتشغيل</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(financialStatements.totalRevenue, "USD")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span>2. المصروفات التشغيلية والعمومية (Expenses)</span>
                  </h4>
                  <div className="bg-muted/40 p-3 rounded-lg divide-y text-sm max-h-[300px] overflow-y-auto">
                    {financialStatements.expenseAccounts.map((e) => (
                      <div key={e.code} className="flex justify-between py-2">
                        <span className="text-muted-foreground">{e.name}</span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(e.endingBalance, e.currency)}
                        </span>
                      </div>
                    ))}
                    {financialStatements.expenseAccounts.length === 0 && (
                      <p className="py-2 text-xs text-center text-muted-foreground">
                        لا توجد حسابات مصروفات مسجلة حالياً
                      </p>
                    )}
                    <div className="flex justify-between py-2 font-bold text-foreground pt-3">
                      <span>إجمالي المصروفات التشغيلية</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400">
                        {formatCurrency(financialStatements.totalExpense, "USD")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="font-extrabold text-base">
                    صافي الأرباح / الخسائر (Net Income)
                  </span>
                  <span
                    className={`text-xl font-black font-mono ${financialStatements.netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                  >
                    {formatCurrency(financialStatements.netIncome, "USD")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet Summary (الميزانية العمومية) */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">
                      الميزانية العمومية (Balance Sheet)
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    المركز المالي
                  </Badge>
                </div>
                <CardDescription>
                  عرض لموجودات الشركة (الأصول) ومطالباتها (الخصوم وحقوق الملكية)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <span>1. الأصول والموجودات (Assets)</span>
                  </h4>
                  <div className="bg-muted/40 p-3 rounded-lg divide-y text-sm max-h-[160px] overflow-y-auto">
                    {financialStatements.assetAccounts.map((a) => (
                      <div key={a.code} className="flex justify-between py-2">
                        <span className="text-muted-foreground">{a.name}</span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(a.endingBalance, a.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold text-foreground pt-3">
                      <span>إجمالي الأصول</span>
                      <span className="font-mono text-primary">
                        {formatCurrency(financialStatements.totalAssets, "USD")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-1">
                    <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span>2. الالتزامات (Liabilities)</span>
                    </h4>
                    <div className="bg-muted/40 p-3 rounded-lg divide-y text-sm h-[130px] overflow-y-auto">
                      {financialStatements.liabilityAccounts.map((l) => (
                        <div key={l.code} className="flex justify-between py-1 text-xs">
                          <span className="text-muted-foreground truncate">{l.name}</span>
                          <span className="font-mono font-semibold">
                            {formatCurrency(l.endingBalance, l.currency)}
                          </span>
                        </div>
                      ))}
                      {financialStatements.liabilityAccounts.length === 0 && (
                        <p className="py-1 text-xs text-center text-muted-foreground">
                          لا توجد التزامات
                        </p>
                      )}
                      <div className="flex justify-between py-1 font-bold text-foreground text-xs pt-2">
                        <span>إجمالي الالتزامات</span>
                        <span className="font-mono">
                          {formatCurrency(financialStatements.totalLiabilities, "USD")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-1">
                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <span>3. حقوق الملكية (Equity)</span>
                    </h4>
                    <div className="bg-muted/40 p-3 rounded-lg divide-y text-sm h-[130px] overflow-y-auto">
                      {financialStatements.equityAccounts.map((eq) => (
                        <div key={eq.code} className="flex justify-between py-1 text-xs">
                          <span className="text-muted-foreground truncate">{eq.name}</span>
                          <span className="font-mono font-semibold">
                            {formatCurrency(eq.endingBalance, eq.currency)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between py-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span>صافي أرباح الفترة الحالية</span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(financialStatements.netIncome, "USD")}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 font-bold text-foreground text-xs pt-2">
                        <span>إجمالي حقوق الملكية</span>
                        <span className="font-mono">
                          {formatCurrency(
                            financialStatements.totalEquity + financialStatements.netIncome,
                            "USD",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm">مجموع الالتزامات وحقوق الملكية</span>
                    <span className="text-xs text-muted-foreground">
                      الخصوم + رأس المال + الأرباح
                    </span>
                  </div>
                  <span className="text-lg font-bold font-mono text-foreground">
                    {formatCurrency(
                      financialStatements.totalLiabilities +
                        financialStatements.totalEquity +
                        financialStatements.netIncome,
                      "USD",
                    )}
                  </span>
                </div>

                {/* Equation Verification Check */}
                <div className="p-3.5 rounded-xl border flex items-center gap-2 text-xs bg-muted/60">
                  <Percent className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-muted-foreground">
                    معادلة الميزانية (المركز المالي): الأصول (
                    {formatCurrency(financialStatements.totalAssets, "USD")}) = الخصوم والملكية (
                    {formatCurrency(
                      financialStatements.totalLiabilities +
                        financialStatements.totalEquity +
                        financialStatements.netIncome,
                      "USD",
                    )}
                    )
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Document Dialog */}
      <Dialog open={isViewJournalOpen} onOpenChange={setIsViewJournalOpen}>
        <DialogContent className="sm:max-w-[700px] text-right dir-rtl print:max-w-none print:w-full print:h-full print:m-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle>مستند قيد محاسبي</DialogTitle>
          </DialogHeader>

          {selectedJournal && (
            <div className="p-6 bg-white space-y-6 rounded-lg print:p-0">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-black">قيد يومية عامة</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    رقم القيد: {selectedJournal.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    المرجع: {selectedJournal.reference}
                  </p>
                </div>
                <div className="text-left font-mono text-sm">
                  <span className="block mb-1">التاريخ: {selectedJournal.date}</span>
                  <span className="block">
                    بواسطة: {selectedJournal.created_by || "النظام الآلي"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border">
                <span className="block text-xs text-muted-foreground mb-1">بيان القيد</span>
                <p className="font-bold text-lg">{selectedJournal.description}</p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 font-bold">الحساب</th>
                      <th className="px-4 py-2 font-bold text-emerald-700">مدين</th>
                      <th className="px-4 py-2 font-bold text-rose-700">دائن</th>
                      <th className="px-4 py-2 font-bold">العملة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJournal.lines.map((l, i) => {
                      const acc = accounts.find((a) => a.code === l.account_code);
                      return (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-3">
                            <div className="font-semibold">{acc?.name_ar || l.account_code}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {l.account_code}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                            {Number(l.debit) > 0 ? Number(l.debit).toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-rose-600">
                            {Number(l.credit) > 0 ? Number(l.credit).toLocaleString() : "-"}
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {l.currency || selectedJournal.currency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-12 mt-8 border-t text-center print:pt-24">
                <div>
                  <div className="border-b border-dashed border-gray-400 w-3/4 mx-auto mb-2"></div>
                  <span className="text-sm font-semibold">توقيع المحاسب</span>
                </div>
                <div>
                  <div className="border-b border-dashed border-gray-400 w-3/4 mx-auto mb-2"></div>
                  <span className="text-sm font-semibold">توقيع المدير المالي</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setIsViewJournalOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer size={16} />
              طباعة المستند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
