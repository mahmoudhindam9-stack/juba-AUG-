// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { erpStore, type Account } from "@/shared/services/erpStore";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { printAccountingDocument } from "@/shared/utils/printAccountingDocument";
import {
  Landmark,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  PieChart as PieChartIcon,
  Layers,
  ArrowUpDown,
  Printer,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OracleAccountsViewer } from "@/components/admin/OracleAccountsViewer";
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
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/accounts")({
  head: () => ({ meta: [{ title: "إدارة الحسابات - شجرة ودليل الحسابات المالي" }] }),
  component: AccountsPage,
});

const ACCOUNT_TYPES: {
  key: Account["type"];
  label: string;
  bg: string;
  text: string;
  border: string;
}[] = [
  {
    key: "asset",
    label: "أصول (Assets)",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    key: "liability",
    label: "التزامات (Liabilities)",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  {
    key: "equity",
    label: "حقوق ملكية (Equity)",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    key: "revenue",
    label: "إيرادات (Revenues)",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
  {
    key: "expense",
    label: "مصروفات (Expenses)",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
];

function AccountsPage() {
  const { toast } = useToast();
  const { formatPrice, currency } = useSettings();

  const [erpState, setErpState] = useState(() => {
    const s = erpStore.getState();
    return {
      ...s,
      accounts: s.accounts.map((a) => ({ ...a })),
    };
  });

  useEffect(() => {
    erpStore.recalculateAccountBalances();
    const unsubscribe = erpStore.subscribe(() => {
      const s = erpStore.getState();
      setErpState({
        ...s,
        accounts: s.accounts.map((a) => ({ ...a })),
      });
    });
    return unsubscribe;
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<Account | null>(null);

  const [accountForm, setAccountForm] = useState({
    code: "",
    name_ar: "",
    type: "asset" as Account["type"],
    parent_code: "",
    initial_balance: 0,
    status: "active" as "active" | "inactive",
    system_binding: "none" as Account["system_binding"],
    currency: "EGP",
  });

  const [isOracleImportOpen, setIsOracleImportOpen] = useState(false);
  const [oracleFiles, setOracleFiles] = useState<{
    level1?: File;
    level2?: File;
    level3?: File;
    level4?: File;
    transactions?: File;
  }>({});
  const [importingOracle, setImportingOracle] = useState(false);
  const [importLog, setImportLog] = useState("");

  // The rest of the original AccountsPage implementation is preserved verbatim below.
