import { Order, MenuItem, InventoryItem } from "../types";
import { localWarehouseStore } from "../../features/inventory/services/warehouseStore";
import { inventoryService } from "../../features/inventory/services/inventoryService";
import { ORACLE_MIGRATION_ACCOUNTS } from "../data/oracleAccounts";

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  code: string;
}

export interface TreasuryContainer {
  id: string;
  name: string;
  currency: string;
  balance?: number;
}

export interface TreasuryAccount {
  id: string;
  account_code?: string;
  containers?: TreasuryContainer[];
  linked_to_restaurant?: boolean;
  branch_id: string;
  name_ar: string;
  type: "cash" | "bank";
  currency: string;
  balance: number;
  is_open: boolean;
  opening_balance: number;
  available_balance?: number;
  responsible_employee?: string;
  status?: "active" | "inactive" | "closed";
  deleted?: boolean;
}

export interface Supplier {
  id: string;
  name_ar: string;
  phone?: string;
  balance: number; // supplier ledger balance
  deleted?: boolean;
}

export interface InventorySettings {
  allowNegativeStock: boolean;
  defaultUnit: string;
}

export interface ExtendedInventoryItem {
  id: string;
  item_code: string;
  barcode: string;
  name_en: string;
  category: string;
  preferred_supplier_id?: string;
  average_cost: number;
  last_purchase_price: number;
  status: "active" | "inactive";
  max_level?: number;
  storage_location?: string;
  notes?: string;
}

export interface MenuItemQualitySpecs {
  menu_item_id: string;
  shelf_life_hours: number;
  storage_condition: "chilled_4c" | "frozen_18c" | "hot_hold_60c" | "room_temp";
  storage_condition_label?: string;
  prep_instructions?: string;
  allergens?: string[];
  quality_checklist?: string[];
  max_display_hours?: number;
}

export interface InventoryDocumentItem {
  inventory_id: string;
  quantity: number;
  unit_cost: number;
  counted_quantity?: number;
  difference?: number;
}

export interface InventoryDocument {
  id: string;
  doc_number: string;
  type:
    | "goods_receipt"
    | "goods_issue"
    | "stock_transfer"
    | "stock_adjustment"
    | "inventory_count"
    | "opening_balance";
  date: string;
  branch_id: string;
  to_branch_id?: string;
  supplier_id?: string;
  items: InventoryDocumentItem[];
  notes?: string;
  status: "draft" | "approved" | "cancelled";
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  branch_id: string;
  supplier_id: string;
  order_date: string;
  status: "draft" | "sent" | "received" | "returned" | "cancelled";
  items: {
    inventory_id: string;
    quantity: number;
    unit_cost: number;
    received_quantity?: number;
    returned_quantity?: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  received_date?: string;
}

export interface TreasuryTransaction {
  id: string;
  branch_id: string;
  treasury_id: string;
  type:
    | "deposit"
    | "withdrawal"
    | "transfer_in"
    | "transfer_out"
    | "sales"
    | "purchase"
    | "expense"
    | "reconciliation";
  amount: number;
  currency: string;
  related_entity_id?: string; // Order ID, Purchase ID, Voucher ID
  payment_method?: string; // cash | card | wallet
  note: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  branch_id: string;
  type: "receipt" | "payment" | "transfer";
  category: string; // e.g., Rent, Salaries, Electricity, Water
  amount: number;
  currency: string;
  payment_method: string;
  treasury_id: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  cost_center?: string;
  attachment?: string;
  deleted?: boolean;
}

export interface Account {
  code: string;
  name_ar: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  parent_code?: string;
  level: number;
  status: "active" | "inactive";
  initial_balance?: number;
  system_binding?:
    | "none"
    | "treasury_main"
    | "treasury_cib"
    | "treasury_extra"
    | "treasury_usd"
    | "suppliers_payable"
    | "sales_revenue"
    | "operating_expenses"
    | "warehouse_main_value"
    | "warehouse_kitchen_value"
    | "expired_inventory_value"
    | "disposed_waste_value"
    | string;
  currency?: string;
  sync_status?: "pending" | "synced";
}

export interface JournalLine {
  account_code: string;
  debit: number;
  credit: number;
  currency?: string;
  rate?: number;
  cost_center?: string;
  description?: string;
  id?: string;
}

export interface JournalEntry {
  id: string;
  branch_id: string;
  date: string;
  description: string;
  lines: JournalLine[];
  created_at: string;
  reference?: string;
  currency: string;
  created_by: string;
  is_approved: boolean;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  details: string;
  created_at: string;
  before_value?: string;
  after_value?: string;
  ip_address?: string;
  action_type: "CREATE" | "UPDATE" | "DELETE" | "TRANSACTION" | "SYSTEM";
}

export interface TreasuryReconciliation {
  id: string;
  treasury_id: string;
  date: string;
  ledger_balance: number;
  actual_balance: number;
  difference: number;
  reconciled_by: string;
  notes: string;
}

export interface SystemUser {
  id: string;
  full_name: string;
  username: string; // Used for login (email or plain text)
  phone: string;
  role: string;
  password?: string;
  created_at: string;
}

export interface UserPermission {
  orders: boolean;
  pos: boolean;
  captain: boolean;
  kitchen: boolean;
  delivery: boolean;
  inventory: boolean;
  hr: boolean;
  purchasing: boolean;
  production: boolean;
  treasury: boolean;
  accounting: boolean;
  journal_approval: boolean;
  expense_approval: boolean;
  revenue_approval: boolean;
  reports: boolean;
  cost_centers: boolean;
  branch_mgmt: boolean;
  audit_logs: boolean;
  users_roles: boolean;
}

export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  phone: string;
  email?: string;
  hire_date: string;
  salary: number;
  currency: string;
  status: "active" | "inactive" | "suspended";
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: "present" | "absent" | "leave" | "late";
  check_in?: string;
  check_out?: string;
  notes?: string;
}

export interface EmployeeLoan {
  id: string;
  employee_id: string;
  amount: number;
  date: string;
  currency: string;
  repayment_months: number;
  paid_amount: number;
  status: "active" | "paid";
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  basic_salary: number;
  currency: string;
  bonuses: number;
  deductions: number;
  loan_deduction: number;
  net_salary: number;
  payment_date?: string;
  payment_treasury_id?: string;
  status: "draft" | "paid";
  notes?: string;
}

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "وليد أحمد محمد دويك",
    job_title: "رئيس الطهاة (Chef)",
    department: "المطبخ",
    phone: "01023456789",
    hire_date: "2024-01-15",
    salary: 8000,
    currency: "EGP",
    status: "active",
  },
  {
    id: "emp-2",
    name: "هشام نور",
    job_title: "مدير التشغيل العام",
    department: "الإدارة",
    phone: "01124578963",
    hire_date: "2023-05-10",
    salary: 15000,
    currency: "EGP",
    status: "active",
  },
  {
    id: "emp-3",
    name: "جمال عطا الله",
    job_title: "المحاسب المالي",
    department: "الإدارة",
    phone: "01235689741",
    hire_date: "2024-03-01",
    salary: 12000,
    currency: "EGP",
    status: "active",
  },
  {
    id: "emp-4",
    name: "محمد شريف",
    job_title: "كاشير الصالة",
    department: "الصالة والتوصيل",
    phone: "01547896321",
    hire_date: "2024-06-15",
    salary: 7000,
    currency: "EGP",
    status: "active",
  },
  {
    id: "emp-5",
    name: "أحمد حسام",
    job_title: "مشرف الفروع",
    department: "الإدارة",
    phone: "01098765432",
    hire_date: "2023-11-01",
    salary: 10000,
    currency: "EGP",
    status: "active",
  },
];

export interface MallShop {
  id: string;
  shop_number: string;
  name_ar: string;
  account_number: string;
  tenant_name: string;
  phone: string;
  monthly_rent: number;
  status: "rented" | "vacant" | "maintenance";
  space_sqm?: number;
  notes?: string;
  contract?: {
    start_date: string;
    end_date: string;
    deposit_amount: number;
    advance_payment?: number;
    nationality?: string;
    id_number?: string;
    terms?: string;
    contract_image?: string;
    id_image?: string;
    language: "ar" | "en";
    created_at: string;
  };
}

export interface TerminatedContractRecord {
  id: string;
  shop_id: string;
  shop_number: string;
  shop_name: string;
  tenant_name: string;
  phone: string;
  monthly_rent: number;
  deposit_amount: number;
  refund_amount: number;
  start_date: string;
  end_date: string;
  termination_date: string;
  contract_image?: string;
  termination_image: string;
  notes?: string;
}

export interface MallRentalPayment {
  id: string;
  shop_id: string;
  year: number;
  month: number;
  amount_due: number;
  amount_paid: number;
  status: "paid" | "partial" | "unpaid";
  payment_date?: string;
  payment_method?: string;
  receipt_number?: string;
  notes?: string;
}

export interface MallGardenRevenue {
  id: string;
  year: number;
  month: number;
  category: "garden_ticket" | "garden_event" | "parking" | "other";
  description: string;
  amount: number;
  date: string;
  receipt_number?: string;
  notes?: string;
}

export interface MallGardenExpense {
  id: string;
  year: number;
  month: number;
  category: "maintenance" | "electricity" | "water" | "security" | "cleaning" | "salary" | "other";
  title: string;
  amount: number;
  date: string;
  paid_to?: string;
  notes?: string;
}

const DEFAULT_GARDEN_REVENUES: MallGardenRevenue[] = [
  {
    id: "rev-1",
    year: 2026,
    month: 1,
    category: "garden_ticket",
    description: "تذاكر دخول الحديقة - يناير",
    amount: 4500,
    date: "2026-01-31",
    receipt_number: "REC-G-101",
  },
  {
    id: "rev-2",
    year: 2026,
    month: 2,
    category: "garden_ticket",
    description: "تذاكر دخول الحديقة - فبراير",
    amount: 5200,
    date: "2026-02-28",
    receipt_number: "REC-G-102",
  },
  {
    id: "rev-3",
    year: 2026,
    month: 3,
    category: "garden_event",
    description: "حفل عائلي وتأجير مساحة بالحديقة",
    amount: 8000,
    date: "2026-03-15",
    receipt_number: "REC-G-103",
  },
];

const DEFAULT_GARDEN_EXPENSES: MallGardenExpense[] = [
  {
    id: "exp-1",
    year: 2026,
    month: 1,
    category: "maintenance",
    title: "صيانة إنارة الحديقة والممرات",
    amount: 1200,
    date: "2026-01-10",
    paid_to: "شركة الصيانة الحديثة",
  },
  {
    id: "exp-2",
    year: 2026,
    month: 1,
    category: "electricity",
    title: "فاتورة كهرباء المول والحديقة",
    amount: 2500,
    date: "2026-01-15",
    paid_to: "شركة الكهرباء",
  },
  {
    id: "exp-3",
    year: 2026,
    month: 2,
    category: "cleaning",
    title: "أدوات ومواد تنظيف المول",
    amount: 800,
    date: "2026-02-05",
    paid_to: "توريدات النظافة",
  },
  {
    id: "exp-4",
    year: 2026,
    month: 2,
    category: "security",
    title: "رواتب أمن وحراسة المول",
    amount: 3500,
    date: "2026-02-28",
    paid_to: "فريق الأمن",
  },
];

const DEFAULT_MALL_SHOPS: MallShop[] = [
  {
    id: "shop-d1",
    shop_number: "D1",
    name_ar: "ملابس أطفال M/Akok atak akol",
    account_number: "14030102",
    tenant_name: "M/Akok atak akol",
    phone: "-",
    monthly_rent: 800,
    status: "rented",
    space_sqm: 40,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d2",
    shop_number: "D2",
    name_ar: "صيدلية Abdalla Majok",
    account_number: "14030111",
    tenant_name: "Abdalla Majok",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 45,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d3",
    shop_number: "D3",
    name_ar: "Mr / Thabo patrick Macagala",
    account_number: "14030124",
    tenant_name: "Thabo patrick",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 35,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d4",
    shop_number: "D4",
    name_ar: "عطور Achail mabok lang",
    account_number: "14030122",
    tenant_name: "Achail mabok lang",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 30,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d5",
    shop_number: "D5",
    name_ar: "عطور Achail mabok lang (نفس العميل)",
    account_number: "14030122",
    tenant_name: "Achail mabok lang",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 30,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d6",
    shop_number: "D6",
    name_ar: "عطور Achail mabok lang",
    account_number: "14030142",
    tenant_name: "Achail mabok lang",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 35,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d7",
    shop_number: "D7",
    name_ar: "ملابس أطفال Niting marin abwak",
    account_number: "14030152",
    tenant_name: "Niting marin",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 40,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d8",
    shop_number: "D8",
    name_ar: "عطور Mrs / Sara enoch machiex",
    account_number: "14030162",
    tenant_name: "Sara enoch",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 30,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d9",
    shop_number: "D9",
    name_ar: "عطور Mrs / Sara enoch machiex",
    account_number: "14030171",
    tenant_name: "Sara enoch",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 30,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d10",
    shop_number: "D10",
    name_ar: "وكالة طبية M/Erik danial dot",
    account_number: "14030192",
    tenant_name: "Erik danial",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d11",
    shop_number: "D11",
    name_ar: "konoro enterprises co",
    account_number: "14030411",
    tenant_name: "konoro enterprises",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 60,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d12",
    shop_number: "D12",
    name_ar: "مخزن الشركة",
    account_number: "14030201",
    tenant_name: "مخزن الشركة",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 80,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d13",
    shop_number: "D13",
    name_ar: "استيراد وتصدير Wanloi Ktl Invesment",
    account_number: "14030198",
    tenant_name: "Wanloi Ktl Invesment",
    phone: "-",
    monthly_rent: 700,
    status: "rented",
    space_sqm: 55,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d14",
    shop_number: "D14",
    name_ar: "مغسلة Mrs / Aluel Deng Awoul",
    account_number: "14030230",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d15",
    shop_number: "D15",
    name_ar: "مغسلة Mrs / Aluel Deng Awoul (نفس العميل)",
    account_number: "14030230",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d16",
    shop_number: "D16",
    name_ar: "مغسلة Mrs / Aluel Deng Awoul (نفس العميل)",
    account_number: "14030230",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d17",
    shop_number: "D17",
    name_ar: "شركة سياحه M/S Awar athuai akok (سيميا)",
    account_number: "14030240",
    tenant_name: "M/S Awar athuai",
    phone: "-",
    monthly_rent: 600,
    status: "rented",
    space_sqm: 65,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d18",
    shop_number: "D18",
    name_ar: "Hafza Cur Deng",
    account_number: "14030250",
    tenant_name: "Hafza Cur Deng",
    phone: "-",
    monthly_rent: 900,
    status: "rented",
    space_sqm: 70,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d19",
    shop_number: "D19",
    name_ar: "نظارات Mr / Harish Koudula",
    account_number: "14030300",
    tenant_name: "Harish Koudula",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 40,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d20",
    shop_number: "D20",
    name_ar: "نظارات Mr / Harish Koudula (نفس العميل)",
    account_number: "14030300",
    tenant_name: "Harish Koudula",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 40,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d21",
    shop_number: "D21",
    name_ar: "مكتبة internet International Trade",
    account_number: "14030320",
    tenant_name: "internet International Trade",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 45,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d30",
    shop_number: "D30",
    name_ar: "شركة سياحه easy travel and tours ltd",
    account_number: "14030432",
    tenant_name: "easy travel",
    phone: "-",
    monthly_rent: 550,
    status: "rented",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d31",
    shop_number: "D31",
    name_ar: "شركة سياحه easy travel and tours ltd",
    account_number: "14030442",
    tenant_name: "easy travel",
    phone: "-",
    monthly_rent: 550,
    status: "rented",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-d32",
    shop_number: "D32",
    name_ar: "John Juma Peter Alphonse",
    account_number: "14030451",
    tenant_name: "John Juma Peter",
    phone: "-",
    monthly_rent: 550,
    status: "rented",
    space_sqm: 50,
    notes: "سنتر بوب",
  },
  {
    id: "shop-b1",
    shop_number: "B1",
    name_ar: "مطعم Maged Gorg Ado",
    account_number: "14010651",
    tenant_name: "Maged Gorg Ado",
    phone: "-",
    monthly_rent: 0,
    status: "rented",
    space_sqm: 120,
    notes: "المول",
  },
  {
    id: "shop-b2",
    shop_number: "B2",
    name_ar: "lilico engineering service",
    account_number: "25030200",
    tenant_name: "lilico engineering",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 60,
    notes: "المول",
  },
  {
    id: "shop-b3",
    shop_number: "B3",
    name_ar: "lilico engineering service",
    account_number: "14010470",
    tenant_name: "lilico engineering",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 60,
    notes: "المول",
  },
  {
    id: "shop-b4",
    shop_number: "B4",
    name_ar: "بنك ايدين",
    account_number: "25030110",
    tenant_name: "بنك ايدين",
    phone: "-",
    monthly_rent: 1200,
    status: "rented",
    space_sqm: 150,
    notes: "المول",
  },
  {
    id: "shop-b5",
    shop_number: "B5",
    name_ar: "بنك ايدين",
    account_number: "25030110",
    tenant_name: "بنك ايدين",
    phone: "-",
    monthly_rent: 1200,
    status: "rented",
    space_sqm: 150,
    notes: "المول",
  },
  {
    id: "shop-b6",
    shop_number: "B6",
    name_ar: "وحدة تجارية B6",
    account_number: "14010450-B6",
    tenant_name: "-",
    phone: "-",
    monthly_rent: 750,
    status: "vacant",
    space_sqm: 65,
    notes: "المول",
  },
  {
    id: "shop-b7",
    shop_number: "B7",
    name_ar: "مطعم Aluel Deng Awoul",
    account_number: "14010450",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 750,
    status: "rented",
    space_sqm: 90,
    notes: "المول",
  },
  {
    id: "shop-b8",
    shop_number: "B8",
    name_ar: "مطعم Aluel Deng Awoul (نفس العميل)",
    account_number: "14010450",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 750,
    status: "rented",
    space_sqm: 90,
    notes: "المول",
  },
  {
    id: "shop-b9",
    shop_number: "B9",
    name_ar: "مطعم Aluel Deng Awoul (نفس العميل)",
    account_number: "14010450",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 750,
    status: "rented",
    space_sqm: 90,
    notes: "المول",
  },
  {
    id: "shop-b10",
    shop_number: "B10",
    name_ar: "مطعم Aluel Deng Awoul (نفس العميل)",
    account_number: "14010450",
    tenant_name: "Aluel Deng Awoul",
    phone: "-",
    monthly_rent: 750,
    status: "rented",
    space_sqm: 90,
    notes: "المول",
  },
  {
    id: "shop-g2",
    shop_number: "G2",
    name_ar: "تصوير وطباعة image world",
    account_number: "14010280",
    tenant_name: "image world",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 40,
    notes: "المول",
  },
  {
    id: "shop-g3",
    shop_number: "G3",
    name_ar: "شركة سياحه Steven + sara Nile travel",
    account_number: "14010140",
    tenant_name: "Steven + sara",
    phone: "-",
    monthly_rent: 550,
    status: "rented",
    space_sqm: 50,
    notes: "المول",
  },
  {
    id: "shop-g4",
    shop_number: "G4",
    name_ar: "شركة سياحه Steven + sara Nile travel",
    account_number: "14010140",
    tenant_name: "Steven + sara",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 50,
    notes: "المول",
  },
  {
    id: "shop-g5",
    shop_number: "G5",
    name_ar: "اتليه teraza daniel lado",
    account_number: "14010313",
    tenant_name: "teraza daniel lado",
    phone: "-",
    monthly_rent: 500,
    status: "rented",
    space_sqm: 45,
    notes: "المول",
  },
  {
    id: "shop-g6",
    shop_number: "G6",
    name_ar: "كوافير حريمي Wiaamramadan",
    account_number: "14010316",
    tenant_name: "Wiaamramadan",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 50,
    notes: "المول",
  },
  {
    id: "shop-g7",
    shop_number: "G7",
    name_ar: "كوافير رجالي Wiaamramadan",
    account_number: "14010316",
    tenant_name: "Wiaamramadan",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 50,
    notes: "المول",
  },
  {
    id: "shop-g8",
    shop_number: "G8",
    name_ar: "eagle enterprise",
    account_number: "14010330",
    tenant_name: "eagle enterprise",
    phone: "-",
    monthly_rent: 0,
    status: "vacant",
    space_sqm: 55,
    notes: "المول",
  },
  {
    id: "shop-g9",
    shop_number: "G9",
    name_ar: "سوبر ماركت Market china",
    account_number: "14010340",
    tenant_name: "Market china",
    phone: "-",
    monthly_rent: 625,
    status: "rented",
    space_sqm: 140,
    notes: "المول",
  },
];

const DEFAULT_MALL_PAYMENTS: MallRentalPayment[] = [
  {
    id: "pay-d1-2",
    shop_id: "shop-d1",
    year: 2026,
    month: 2,
    amount_due: 800,
    amount_paid: 800,
    status: "paid",
    payment_date: "2026-02-10",
    payment_method: "cash",
    receipt_number: "REC-2001",
  },
  {
    id: "pay-d13-2",
    shop_id: "shop-d13",
    year: 2026,
    month: 2,
    amount_due: 700,
    amount_paid: 800,
    status: "paid",
    payment_date: "2026-02-12",
    payment_method: "bank_transfer",
    receipt_number: "REC-2002",
  },
  {
    id: "pay-d14-4",
    shop_id: "shop-d14",
    year: 2026,
    month: 4,
    amount_due: 500,
    amount_paid: 1500,
    status: "paid",
    payment_date: "2026-04-10",
    payment_method: "cash",
    receipt_number: "REC-2003",
  },
  {
    id: "pay-d17-1",
    shop_id: "shop-d17",
    year: 2026,
    month: 1,
    amount_due: 600,
    amount_paid: 600,
    status: "paid",
    payment_date: "2026-01-05",
    payment_method: "cash",
    receipt_number: "REC-2004",
  },
  {
    id: "pay-d17-2",
    shop_id: "shop-d17",
    year: 2026,
    month: 2,
    amount_due: 600,
    amount_paid: 600,
    status: "paid",
    payment_date: "2026-02-05",
    payment_method: "cash",
    receipt_number: "REC-2005",
  },
  {
    id: "pay-d17-6",
    shop_id: "shop-d17",
    year: 2026,
    month: 6,
    amount_due: 600,
    amount_paid: 600,
    status: "paid",
    payment_date: "2026-06-05",
    payment_method: "cash",
    receipt_number: "REC-2006",
  },
  {
    id: "pay-d17-7",
    shop_id: "shop-d17",
    year: 2026,
    month: 7,
    amount_due: 600,
    amount_paid: 600,
    status: "paid",
    payment_date: "2026-07-05",
    payment_method: "cash",
    receipt_number: "REC-2007",
  },
  {
    id: "pay-d18-5",
    shop_id: "shop-d18",
    year: 2026,
    month: 5,
    amount_due: 900,
    amount_paid: 9600,
    status: "paid",
    payment_date: "2026-05-10",
    payment_method: "bank_transfer",
    receipt_number: "REC-2008",
  },
  {
    id: "pay-d19-3",
    shop_id: "shop-d19",
    year: 2026,
    month: 3,
    amount_due: 500,
    amount_paid: 2000,
    status: "paid",
    payment_date: "2026-03-10",
    payment_method: "cash",
    receipt_number: "REC-2009",
  },
  {
    id: "pay-d19-5",
    shop_id: "shop-d19",
    year: 2026,
    month: 5,
    amount_due: 500,
    amount_paid: 1000,
    status: "paid",
    payment_date: "2026-05-10",
    payment_method: "cash",
    receipt_number: "REC-2010",
  },
  {
    id: "pay-d21-3",
    shop_id: "shop-d21",
    year: 2026,
    month: 3,
    amount_due: 0,
    amount_paid: 3000,
    status: "paid",
    payment_date: "2026-03-15",
    payment_method: "cash",
    receipt_number: "REC-2011",
  },
  {
    id: "pay-d30-7",
    shop_id: "shop-d30",
    year: 2026,
    month: 7,
    amount_due: 550,
    amount_paid: 3300,
    status: "paid",
    payment_date: "2026-07-10",
    payment_method: "bank_transfer",
    receipt_number: "REC-2012",
  },
  {
    id: "pay-d32-2",
    shop_id: "shop-d32",
    year: 2026,
    month: 2,
    amount_due: 550,
    amount_paid: 3300,
    status: "paid",
    payment_date: "2026-02-15",
    payment_method: "bank_transfer",
    receipt_number: "REC-2013",
  },
  {
    id: "pay-b1-6",
    shop_id: "shop-b1",
    year: 2026,
    month: 6,
    amount_due: 0,
    amount_paid: 5000,
    status: "paid",
    payment_date: "2026-06-10",
    payment_method: "cash",
    receipt_number: "REC-2014",
  },
  {
    id: "pay-b7-1",
    shop_id: "shop-b7",
    year: 2026,
    month: 1,
    amount_due: 750,
    amount_paid: 4500,
    status: "paid",
    payment_date: "2026-01-10",
    payment_method: "cash",
    receipt_number: "REC-2015",
  },
  {
    id: "pay-b7-3",
    shop_id: "shop-b7",
    year: 2026,
    month: 3,
    amount_due: 750,
    amount_paid: 3000,
    status: "paid",
    payment_date: "2026-03-10",
    payment_method: "cash",
    receipt_number: "REC-2016",
  },
  {
    id: "pay-b7-4",
    shop_id: "shop-b7",
    year: 2026,
    month: 4,
    amount_due: 750,
    amount_paid: 6500,
    status: "paid",
    payment_date: "2026-04-10",
    payment_method: "cash",
    receipt_number: "REC-2017",
  },
  {
    id: "pay-b7-5",
    shop_id: "shop-b7",
    year: 2026,
    month: 5,
    amount_due: 750,
    amount_paid: -1500,
    status: "partial",
    payment_date: "2026-05-10",
    payment_method: "cash",
    receipt_number: "REC-2018",
    notes: "تسوية",
  },
  {
    id: "pay-g9-1",
    shop_id: "shop-g9",
    year: 2026,
    month: 1,
    amount_due: 625,
    amount_paid: 5000,
    status: "paid",
    payment_date: "2026-01-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2019",
  },
  {
    id: "pay-g9-2",
    shop_id: "shop-g9",
    year: 2026,
    month: 2,
    amount_due: 625,
    amount_paid: 5000,
    status: "paid",
    payment_date: "2026-02-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2020",
  },
  {
    id: "pay-g9-3",
    shop_id: "shop-g9",
    year: 2026,
    month: 3,
    amount_due: 625,
    amount_paid: 5000,
    status: "paid",
    payment_date: "2026-03-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2021",
  },
  {
    id: "pay-g9-4",
    shop_id: "shop-g9",
    year: 2026,
    month: 4,
    amount_due: 625,
    amount_paid: 5000,
    status: "paid",
    payment_date: "2026-04-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2022",
  },
  {
    id: "pay-g9-5",
    shop_id: "shop-g9",
    year: 2026,
    month: 5,
    amount_due: 625,
    amount_paid: 3000,
    status: "paid",
    payment_date: "2026-05-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2023",
  },
  {
    id: "pay-g9-6",
    shop_id: "shop-g9",
    year: 2026,
    month: 6,
    amount_due: 625,
    amount_paid: 6000,
    status: "paid",
    payment_date: "2026-06-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2024",
  },
  {
    id: "pay-g9-7",
    shop_id: "shop-g9",
    year: 2026,
    month: 7,
    amount_due: 625,
    amount_paid: 5000,
    status: "paid",
    payment_date: "2026-07-05",
    payment_method: "bank_transfer",
    receipt_number: "REC-2025",
  },
];

export interface ERPStoreState {
  branches: Branch[];
  currentBranchId: string;
  treasuries: TreasuryAccount[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  treasuryTransactions: TreasuryTransaction[];
  vouchers: Voucher[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  auditLogs: AuditLog[];
  inventoryExpiry: {
    id: string;
    inventory_id: string;
    branch_id: string;
    warehouse_id?: string;
    storage_condition?: string;
    batch_no: string;
    quantity: number;
    expiry_date: string;
    created_at?: string;
  }[];
  menuQualitySpecs?: Record<string, MenuItemQualitySpecs>;
  costCenters: string[];
  isAccountingPeriodLocked: boolean;
  extendedInventoryItems: Record<string, ExtendedInventoryItem>;
  inventoryDocuments: InventoryDocument[];
  reconciliations: TreasuryReconciliation[];
  userPermissions: Record<string, UserPermission>;
  currentUser: string;
  users: SystemUser[];
  fiscalYearStatus: "open" | "closed";
  inventorySettings?: InventorySettings;
  totalDisposedExpiryValue?: number;
  mock_data_cleared_v6?: boolean;
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  loans?: EmployeeLoan[];
  payrolls?: PayrollRecord[];
  mallShops: MallShop[];
  mallPayments: MallRentalPayment[];
  mallGardenRevenues: MallGardenRevenue[];
  mallGardenExpenses: MallGardenExpense[];
  mallTerminatedContractsArchive: TerminatedContractRecord[];
}

const DEFAULT_BRANCHES: Branch[] = [
  { id: "branch-1", name: "Main Branch", name_ar: "الفرع الرئيسي", code: "MAIN" },
];

const DEFAULT_COST_CENTERS = [
  "المطبخ (Kitchen)",
  "البار (Bar)",
  "التوصيل (Delivery)",
  "الإدارة (Administration)",
  "التسويق (Marketing)",
  "المستودع (Warehouse)",
];

const getOffsetISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const USD_SEED_TRANSACTIONS: TreasuryTransaction[] = [
  {
    id: "tx-usd-1",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 17438.37,
    currency: "USD",
    payment_method: "cash",
    note: "رصيد اول المدة - تمويل خزينة المصرى",
    created_at: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "tx-usd-2",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 420.61,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-01-04T12:00:00.000Z",
  },
  {
    id: "tx-usd-3",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 420.61,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 420.61$ سعر التحويل 47.55",
    created_at: "2026-01-04T13:00:00.000Z",
  },
  {
    id: "tx-usd-4",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 316.72,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-01-11T12:00:00.000Z",
  },
  {
    id: "tx-usd-5",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 316.72,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 316.7$ سعر التحويل 47.36",
    created_at: "2026-01-11T13:00:00.000Z",
  },
  {
    id: "tx-usd-6",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 1055.74,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-01-19T10:00:00.000Z",
  },
  {
    id: "tx-usd-7",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 422.3,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-01-19T11:00:00.000Z",
  },
  {
    id: "tx-usd-8",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1055.74,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 1056$ سعر التحويل 47.36",
    created_at: "2026-01-19T12:00:00.000Z",
  },
  {
    id: "tx-usd-9",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 422.3,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 422.3$ سعر التحويل 47.36",
    created_at: "2026-01-19T13:00:00.000Z",
  },
  {
    id: "tx-usd-10",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 105.6,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 105.6$ سعر التحويل 47.36",
    created_at: "2026-01-19T14:00:00.000Z",
  },
  {
    id: "tx-usd-11",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 105.57,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "tx-usd-12",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 188,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من خزينه كيندي",
    created_at: "2026-01-30T12:00:00.000Z",
  },
  {
    id: "tx-usd-13",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 188,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 188$ سعر التحويل 46.9",
    created_at: "2026-01-30T13:00:00.000Z",
  },
  {
    id: "tx-usd-14",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1100,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 1100$ سعر التحويل 47.10",
    created_at: "2026-01-31T12:00:00.000Z",
  },
  {
    id: "tx-usd-15",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 510.71,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "tx-usd-16",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 510.71,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 510.71$ سعر التحويل 46.93",
    created_at: "2026-02-01T13:00:00.000Z",
  },
  {
    id: "tx-usd-17",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 500,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-02-08T12:00:00.000Z",
  },
  {
    id: "tx-usd-18",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 500,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 500$ سعر التحويل 46.91",
    created_at: "2026-02-08T13:00:00.000Z",
  },
  {
    id: "tx-usd-19",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 213.68,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-02-10T12:00:00.000Z",
  },
  {
    id: "tx-usd-20",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 213.68,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 213$ سعر التحويل 46.8",
    created_at: "2026-02-10T13:00:00.000Z",
  },
  {
    id: "tx-usd-21",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 213.68,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-02-16T12:00:00.000Z",
  },
  {
    id: "tx-usd-22",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 213.68,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 213$ سعر التحويل 46.8",
    created_at: "2026-02-16T13:00:00.000Z",
  },
  {
    id: "tx-usd-23",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 1616.85,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-03-03T12:00:00.000Z",
  },
  {
    id: "tx-usd-24",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1616.85,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 1616.85$ سعر التحويل 46.80",
    created_at: "2026-03-03T13:00:00.000Z",
  },
  {
    id: "tx-usd-25",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 961.54,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-03-10T12:00:00.000Z",
  },
  {
    id: "tx-usd-26",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 961.54,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 961.54 سعر التحويل 52",
    created_at: "2026-03-10T13:00:00.000Z",
  },
  {
    id: "tx-usd-27",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 1777.94,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-03-31T12:00:00.000Z",
  },
  {
    id: "tx-usd-28",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1777.94,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل الخزينه 1777.94 سعر التحويل 54.4",
    created_at: "2026-03-31T13:00:00.000Z",
  },
  {
    id: "tx-usd-29",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 1153.26,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-04-15T10:00:00.000Z",
  },
  {
    id: "tx-usd-30",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1153.26,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 1153.26 $ معامل 51.75 جم",
    created_at: "2026-04-15T11:00:00.000Z",
  },
  {
    id: "tx-usd-31",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 96.53,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-04-15T12:00:00.000Z",
  },
  {
    id: "tx-usd-32",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 96.53,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 96.53 $ معامل 51.80 جم",
    created_at: "2026-04-15T13:00:00.000Z",
  },
  {
    id: "tx-usd-33",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 17.31,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-04-15T14:00:00.000Z",
  },
  {
    id: "tx-usd-34",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 17.31,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 17.31 $ معامل 52 جم",
    created_at: "2026-04-15T15:00:00.000Z",
  },
  {
    id: "tx-usd-35",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 17.87,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-04-15T16:00:00.000Z",
  },
  {
    id: "tx-usd-36",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 17.87,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 17.87 $ معامل 52.6 جم",
    created_at: "2026-04-15T17:00:00.000Z",
  },
  {
    id: "tx-usd-37",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 1842.29,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-04-15T18:00:00.000Z",
  },
  {
    id: "tx-usd-38",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1842.29,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 1842.29 $ معامل 52.5 جم",
    created_at: "2026-04-15T19:00:00.000Z",
  },
  {
    id: "tx-usd-39",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 185,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من خزينه كيندي",
    created_at: "2026-04-15T20:00:00.000Z",
  },
  {
    id: "tx-usd-40",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "deposit",
    amount: 2312,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل من م/ احمد حسام",
    created_at: "2026-05-17T12:00:00.000Z",
  },
  {
    id: "tx-usd-41",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 500,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 500 $ معامل 53.37 جم - خزينة محمد شريف",
    created_at: "2026-05-17T13:00:00.000Z",
  },
  {
    id: "tx-usd-42",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 175,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 175 $ معامل 53.37 جم - خزينة محمد شريف",
    created_at: "2026-05-17T14:00:00.000Z",
  },
  {
    id: "tx-usd-43",
    branch_id: "branch-1",
    treasury_id: "tr-4",
    type: "withdrawal",
    amount: 1637,
    currency: "USD",
    payment_method: "cash",
    note: "تمويل خزينه 1637 $ معامل 53.37 جم - خزينة محمد شريف",
    created_at: "2026-05-17T15:00:00.000Z",
  },
];

const EGP_SEED_TRANSACTIONS: TreasuryTransaction[] = [
  {
    id: "tx-egp-1",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 607.11,
    currency: "EGP",
    payment_method: "cash",
    note: "رصيد اول المدة - تحويل من خزينة الدولار",
    created_at: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "tx-egp-2",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 20000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تمويل الخزينه (420.6$ @ 47.55)",
    created_at: "2026-01-04T12:00:00.000Z",
  },
  {
    id: "tx-egp-3",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - توريد الى دريم لاند قيمه اشتراك فى السيارة لشهر نوفمبر (منال اسماعيل )عامله البوفيه",
    created_at: "2026-01-04T13:00:00.000Z",
  },
  {
    id: "tx-egp-4",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 40000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتب ا/ هشام نور شهر ديسمبر 2025",
    created_at: "2026-01-04T14:00:00.000Z",
  },
  {
    id: "tx-egp-5",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 2500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتب وليد احمد محمد دويك عن فترة 3 أيام من شهر نوفمبر 2025",
    created_at: "2026-01-04T15:00:00.000Z",
  },
  {
    id: "tx-egp-6",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 25000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتب وليد احمد محمد دويك شهر ديسمبر 2025",
    created_at: "2026-01-04T16:00:00.000Z",
  },
  {
    id: "tx-egp-7",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 16665.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتب ا/ جمال عطا اللة عن فترة 10 أيام من شهر ديسمبر 2025",
    created_at: "2026-01-04T17:00:00.000Z",
  },
  {
    id: "tx-egp-8",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 15000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-01-11T12:00:00.000Z",
  },
  {
    id: "tx-egp-9",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 1110.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بنزين سيارة - فاتورة بنزين",
    created_at: "2026-01-11T13:00:00.000Z",
  },
  {
    id: "tx-egp-10",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 825.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - قيمة تاكسى اوبر ذهاب وعودة م/ احمد حسام الى المطار",
    created_at: "2026-01-11T14:00:00.000Z",
  },
  {
    id: "tx-egp-11",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 540.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات بوفيه - مستلزمات بوفية الإدارة شراء ن ك بن",
    created_at: "2026-01-13T12:00:00.000Z",
  },
  {
    id: "tx-egp-12",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 778.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات بوفيه - مستلزمات بوفية الإدارة وأدوات نظافة",
    created_at: "2026-01-13T13:00:00.000Z",
  },
  {
    id: "tx-egp-13",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 50000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-01-19T10:00:00.000Z",
  },
  {
    id: "tx-egp-14",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 20000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-01-19T11:00:00.000Z",
  },
  {
    id: "tx-egp-15",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 5000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "tx-egp-16",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 358.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات نت - تجديد باقة الانترنت لشهر يناير 2026",
    created_at: "2026-01-25T12:00:00.000Z",
  },
  {
    id: "tx-egp-17",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 8817.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-01-30T12:00:00.000Z",
  },
  {
    id: "tx-egp-18",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 80600.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتبات شهر ديسمبر 2025",
    created_at: "2026-01-30T13:00:00.000Z",
  },
  {
    id: "tx-egp-19",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 1500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات موبيل - بدل موبيل م/ احمد حسام",
    created_at: "2026-01-30T14:00:00.000Z",
  },
  {
    id: "tx-egp-20",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 51810.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-01-31T12:00:00.000Z",
  },
  {
    id: "tx-egp-21",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 5000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "رد سلف - قسط سلفة وليد احمد القسط الأول",
    created_at: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "tx-egp-22",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 23967.62,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-02-01T13:00:00.000Z",
  },
  {
    id: "tx-egp-23",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 23968.0,
    currency: "EGP",
    payment_method: "cash",
    note: "صيانة سيارة - قيمة مصاريف سيارة مدير إدارة المشروعات الخارجية",
    created_at: "2026-02-01T14:00:00.000Z",
  },
  {
    id: "tx-egp-24",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 2730.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بنزين سيارة - فواتير البنزين",
    created_at: "2026-02-01T15:00:00.000Z",
  },
  {
    id: "tx-egp-25",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 23455.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-02-08T12:00:00.000Z",
  },
  {
    id: "tx-egp-26",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 23455.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اقساط سيارة - من تحت حساب قسط سيارة",
    created_at: "2026-02-08T13:00:00.000Z",
  },
  {
    id: "tx-egp-27",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - توريد الى دريم لاند قيمه اشتراك فى السيارة لشهر ديسمبر (منال اسماعيل )عامله البوفيه",
    created_at: "2026-02-08T14:00:00.000Z",
  },
  {
    id: "tx-egp-28",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 10000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-02-10T12:00:00.000Z",
  },
  {
    id: "tx-egp-29",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 10000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-02-16T12:00:00.000Z",
  },
  {
    id: "tx-egp-30",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 400.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات نت - تجديد باقة الانترنت لشهر فبراير 2026",
    created_at: "2026-02-22T12:00:00.000Z",
  },
  {
    id: "tx-egp-31",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 80600.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتبات شهر يناير 2026",
    created_at: "2026-02-28T12:00:00.000Z",
  },
  {
    id: "tx-egp-32",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 1500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات موبيل - بدل موبيل م/ احمد حسام",
    created_at: "2026-02-28T13:00:00.000Z",
  },
  {
    id: "tx-egp-33",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 80599.97,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-03-03T12:00:00.000Z",
  },
  {
    id: "tx-egp-34",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - توريد الى دريم لاند قيمة تكلفة انتقالات منال عن شهر يناير 2026",
    created_at: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "tx-egp-35",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 50000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينه",
    created_at: "2026-03-10T12:00:00.000Z",
  },
  {
    id: "tx-egp-36",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 50000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "سلف - سلفة محمد شريف ترد على قسطين",
    created_at: "2026-03-10T13:00:00.000Z",
  },
  {
    id: "tx-egp-37",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - مصاريف انتقال لاحضار مكينةالرى من ا/ هشام اثناء العودة من المطار",
    created_at: "2026-03-19T12:00:00.000Z",
  },
  {
    id: "tx-egp-38",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 290.0,
    currency: "EGP",
    payment_method: "cash",
    note: "أدوات نظافة - مستلزمات نظافة لادارة المشروعات",
    created_at: "2026-03-19T13:00:00.000Z",
  },
  {
    id: "tx-egp-39",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 525.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بوفية وطيافة - مستلزمات بوفية لادار ة المشروعات",
    created_at: "2026-03-19T14:00:00.000Z",
  },
  {
    id: "tx-egp-40",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 400.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات نت - تجديد باقة الانترنت شهر مارس 2026",
    created_at: "2026-03-19T15:00:00.000Z",
  },
  {
    id: "tx-egp-41",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 96720.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتبات شهر فبراير 2026",
    created_at: "2026-03-19T16:00:00.000Z",
  },
  {
    id: "tx-egp-42",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 96719.94,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل الخزينة 1777.94 سعر التحويل 54.4",
    created_at: "2026-03-31T12:00:00.000Z",
  },
  {
    id: "tx-egp-43",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 1500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات موبيل - بدل موبيل م/ احمد حسام",
    created_at: "2026-03-31T13:00:00.000Z",
  },
  {
    id: "tx-egp-44",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - بدل انتقال محمد شريف عن شهر مارس 2026",
    created_at: "2026-03-31T14:00:00.000Z",
  },
  {
    id: "tx-egp-45",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - توريد الى دريم لاند قيمة تكلفة انتقالات منال عن شهرفبراير2026",
    created_at: "2026-03-31T15:00:00.000Z",
  },
  {
    id: "tx-egp-46",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 59681.2,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل خزينه 1153.26 $ معامل 51.75 جم",
    created_at: "2026-04-15T10:00:00.000Z",
  },
  {
    id: "tx-egp-47",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 5000.25,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل خزينه 96.53 $ معامل 51.80 جم",
    created_at: "2026-04-15T11:00:00.000Z",
  },
  {
    id: "tx-egp-48",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 900.12,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل خزينه 17.31 $ معامل 52 جم",
    created_at: "2026-04-15T12:00:00.000Z",
  },
  {
    id: "tx-egp-49",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 939.96,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل خزينه 17.87 $ معامل 52.6 جم",
    created_at: "2026-04-15T13:00:00.000Z",
  },
  {
    id: "tx-egp-50",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 96720.22,
    currency: "EGP",
    payment_method: "cash",
    note: "تحويل من خزينة الدولار - تمويل خزينه 1842.29 $ معامل 52.5 جم",
    created_at: "2026-04-15T14:00:00.000Z",
  },
  {
    id: "tx-egp-51",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 25000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "سلف - محمد شريف (اول قسط السلفة)",
    created_at: "2026-04-15T15:00:00.000Z",
  },
  {
    id: "tx-egp-52",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 5000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "سلف - قسط سلفه وليد",
    created_at: "2026-04-15T16:00:00.000Z",
  },
  {
    id: "tx-egp-53",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 59681.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - قيمة تذكره سفر م/احمد حسام الى جوبا ذهاب وعودة 24/4/2026",
    created_at: "2026-04-15T17:00:00.000Z",
  },
  {
    id: "tx-egp-54",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 900.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بوفية وطيافة - قيمة مستلزمات بوفيه الادارة (بن)",
    created_at: "2026-04-15T18:00:00.000Z",
  },
  {
    id: "tx-egp-55",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 900.0,
    currency: "EGP",
    payment_method: "cash",
    note: "صيانه - اصلاح لاب توب مدير ادارة المشروعات",
    created_at: "2026-04-15T19:00:00.000Z",
  },
  {
    id: "tx-egp-56",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 400.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات نت - تجديد باقه الانترانت شهر ابريل 2026",
    created_at: "2026-04-15T20:00:00.000Z",
  },
  {
    id: "tx-egp-57",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 96720.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتبات شهر ابريل 2026",
    created_at: "2026-04-15T21:00:00.000Z",
  },
  {
    id: "tx-egp-58",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 1500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات موبيل - بدل موبيل م/ احمد حسام",
    created_at: "2026-04-15T22:00:00.000Z",
  },
  {
    id: "tx-egp-59",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 25000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تمويل خزينه احمد حسام - تمويل حزينه م/ احمد حسام (فسط سلفه محمد شريف)",
    created_at: "2026-04-15T23:00:00.000Z",
  },
  {
    id: "tx-egp-60",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - بدل انتقال محمد شريف عن شهر ابريل 2026",
    created_at: "2026-04-15T23:15:00.000Z",
  },
  {
    id: "tx-egp-61",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - توريد الى دربم لاند قيمه تكلفه انتقالات منال عن شهر ابريل 2026",
    created_at: "2026-04-15T23:30:00.000Z",
  },
  {
    id: "tx-egp-62",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - توريد الى دريم لاند قيمة تكلفة انتقالات منال عن شهر مارس 2026",
    created_at: "2026-04-15T23:45:00.000Z",
  },
  {
    id: "tx-egp-63",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 26685.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تمويل خزينة محمد شريف - تمويل خزينه 500 $ معامل 53.37 جم",
    created_at: "2026-05-17T12:00:00.000Z",
  },
  {
    id: "tx-egp-64",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 9339.75,
    currency: "EGP",
    payment_method: "cash",
    note: "تمويل خزينة محمد شريف - تمويل خزينه 175 $ معامل 53.37 جم",
    created_at: "2026-05-17T13:00:00.000Z",
  },
  {
    id: "tx-egp-65",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 87382.7,
    currency: "EGP",
    payment_method: "cash",
    note: "تمويل خزينة محمد شريف - تمويل خزينه 1637 $ معامل 53.37 جم",
    created_at: "2026-05-17T14:00:00.000Z",
  },
  {
    id: "tx-egp-66",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "deposit",
    amount: 25000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "رد سلف - محمد شريف ( الثانى قسط السلفة)",
    created_at: "2026-05-31T12:00:00.000Z",
  },
  {
    id: "tx-egp-67",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 400.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات نت - تجديد باقه الانترانت شهر ابريل 2026",
    created_at: "2026-05-01T12:00:00.000Z",
  },
  {
    id: "tx-egp-68",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 400.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بدل مواصلات - قيمة ايجار سيارة عدد2 مرات ذهاب وعودة من المطار (مدير الادارة)",
    created_at: "2026-04-17T12:00:00.000Z",
  },
  {
    id: "tx-egp-69",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 939.96,
    currency: "EGP",
    payment_method: "cash",
    note: "اقساط سيارة - قيمة ايجار سيارة عدد2 مرات ذهاب وعودة من المطار (مدير الادارة)",
    created_at: "2026-04-17T13:00:00.000Z",
  },
  {
    id: "tx-egp-70",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 190.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بوفية وطيافة - مستلزمات بوفيه الادارة",
    created_at: "2026-04-17T14:00:00.000Z",
  },
  {
    id: "tx-egp-71",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 410.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات نت - تجديد باقه الانترانت شهر مايو 2026",
    created_at: "2026-05-17T15:00:00.000Z",
  },
  {
    id: "tx-egp-72",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 26685.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - عديات العيد الاضحى 2026",
    created_at: "2026-05-21T12:00:00.000Z",
  },
  {
    id: "tx-egp-73",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 920.0,
    currency: "EGP",
    payment_method: "cash",
    note: "بنزين سيارة - فاتورة بنزين",
    created_at: "2026-05-21T13:00:00.000Z",
  },
  {
    id: "tx-egp-74",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 1500.0,
    currency: "EGP",
    payment_method: "cash",
    note: "مصروفات موبيل - بدل موبيل م/ احمد حسام",
    created_at: "2026-05-31T12:00:00.000Z",
  },
  {
    id: "tx-egp-75",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 96720.0,
    currency: "EGP",
    payment_method: "cash",
    note: "اجور ومرتبات - مرتبات شهر مايو 2026",
    created_at: "2026-05-31T13:00:00.000Z",
  },
  {
    id: "tx-egp-76",
    branch_id: "branch-1",
    treasury_id: "tr-5",
    type: "withdrawal",
    amount: 25000.0,
    currency: "EGP",
    payment_method: "cash",
    note: "تمويل خزينه احمد حسام - تمويل حزينه م/ احمد حسام (فسط سلفه محمد شريف)",
    created_at: "2026-05-31T14:00:00.000Z",
  },
];

const DEFAULT_EXPIRY_SEED = [
  {
    id: "exp-seed-1",
    inventory_id: "inv-seed-2",
    branch_id: "branch-1",
    warehouse_id: "wh-main-default",
    storage_condition: "chilled_4c",
    batch_no: "BAT-2026-MOZZ01",
    quantity: 35,
    expiry_date: getOffsetISO(2),
    created_at: new Date().toISOString(),
  },
  {
    id: "exp-seed-2",
    inventory_id: "inv-seed-3",
    branch_id: "branch-1",
    warehouse_id: "wh-main-default",
    storage_condition: "frozen_18c",
    batch_no: "BAT-2026-MEAT02",
    quantity: 15,
    expiry_date: getOffsetISO(-1),
    created_at: new Date().toISOString(),
  },
  {
    id: "exp-seed-3",
    inventory_id: "inv-seed-1",
    branch_id: "branch-1",
    warehouse_id: "wh-main-default",
    storage_condition: "room_temp",
    batch_no: "BAT-2026-FLR03",
    quantity: 100,
    expiry_date: getOffsetISO(45),
    created_at: new Date().toISOString(),
  },
  {
    id: "exp-seed-4",
    inventory_id: "inv-seed-4",
    branch_id: "branch-1",
    warehouse_id: "wh-juba-branch",
    storage_condition: "room_temp",
    batch_no: "BAT-2026-TOM04",
    quantity: 40,
    expiry_date: getOffsetISO(12),
    created_at: new Date().toISOString(),
  },
  {
    id: "exp-seed-5",
    inventory_id: "inv-seed-5",
    branch_id: "branch-1",
    warehouse_id: "wh-juba-branch",
    storage_condition: "room_temp",
    batch_no: "BAT-2026-OIL05",
    quantity: 12,
    expiry_date: getOffsetISO(4),
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_ACCOUNTS: Account[] = ORACLE_MIGRATION_ACCOUNTS as any;

export const SEED_AH_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "je-ah-1",
    branch_id: "branch-1",
    date: "2026-01-01",
    description: "رصيد اول المدة - خزينة أحمد حسام دولار",
    reference: "00--00",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-01T12:00:00.000Z",
    lines: [
      { account_code: "15010100", debit: 49487.48, credit: 0 },
      { account_code: "301000", debit: 0, credit: 49487.48 },
    ],
  },
  {
    id: "je-ah-2",
    branch_id: "branch-1",
    date: "2026-01-04",
    description: "تمويل خزينة محمد شريف ش1 (اجمالى التمويل)",
    reference: "01--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-04T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 420.61, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 420.61 },
    ],
  },
  {
    id: "je-ah-3",
    branch_id: "branch-1",
    date: "2026-01-11",
    description: "تمويل خزينة محمد شريف ش1 (اجمالى التمويل)",
    reference: "01--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-11T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 316.72, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 316.72 },
    ],
  },
  {
    id: "je-ah-4",
    branch_id: "branch-1",
    date: "2026-01-19",
    description: "تمويل خزينة محمد شريف ش1 (اجمالى التمويل)",
    reference: "01--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-19T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 1055.74, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 1055.74 },
    ],
  },
  {
    id: "je-ah-5",
    branch_id: "branch-1",
    date: "2026-01-19",
    description: "تمويل خزينة محمد شريف ش1 (اجمالى التمويل)",
    reference: "01--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-19T13:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 422.3, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 422.3 },
    ],
  },
  {
    id: "je-ah-6",
    branch_id: "branch-1",
    date: "2026-01-20",
    description: "تمويل خزينة محمد شريف ش1 (اجمالى التمويل)",
    reference: "01--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-20T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 105.57, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 105.57 },
    ],
  },
  {
    id: "je-ah-7",
    branch_id: "branch-1",
    date: "2026-01-31",
    description: "تمويل من خزينة جوبا لاجور ومرتبات (هشام - جمال-وليد ) شهر 12",
    reference: "01--23",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-01-31T12:00:00.000Z",
    lines: [
      { account_code: "15010100", debit: 1872, credit: 0 },
      { account_code: "13010101", debit: 0, credit: 1872 },
    ],
  },
  {
    id: "je-ah-8",
    branch_id: "branch-1",
    date: "2026-02-01",
    description: "تمويل خزينة محمد شريف ش2 (اجمالى التمويل)",
    reference: "02--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-02-01T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 510.71, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 510.71 },
    ],
  },
  {
    id: "je-ah-9",
    branch_id: "branch-1",
    date: "2026-02-02",
    description: "تمويل من خزينة جوبا",
    reference: "02--22",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-02-02T12:00:00.000Z",
    lines: [
      { account_code: "15010100", debit: 185, credit: 0 },
      { account_code: "13010101", debit: 0, credit: 185 },
    ],
  },
  {
    id: "je-ah-10",
    branch_id: "branch-1",
    date: "2026-02-08",
    description: "تمويل خزينة محمد شريف ش2 (اجمالى التمويل)",
    reference: "02--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-02-08T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 500, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 500 },
    ],
  },
  {
    id: "je-ah-11",
    branch_id: "branch-1",
    date: "2026-02-10",
    description: "تمويل خزينة محمد شريف ش2 (اجمالى التمويل)",
    reference: "02--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-02-10T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 213.68, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 213.68 },
    ],
  },
  {
    id: "je-ah-12",
    branch_id: "branch-1",
    date: "2026-02-16",
    description: "تمويل خزينة محمد شريف ش2 (اجمالى التمويل)",
    reference: "02--27",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-02-16T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 213.68, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 213.68 },
    ],
  },
  {
    id: "je-ah-13",
    branch_id: "branch-1",
    date: "2026-03-03",
    description: "تمويل خزينة محمد شريف ش3 (اجمالى التمويل)",
    reference: "03--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-03-03T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 1616.85, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 1616.85 },
    ],
  },
  {
    id: "je-ah-14",
    branch_id: "branch-1",
    date: "2026-03-10",
    description: "تمويل خزينة محمد شريف ش3 (اجمالى التمويل)",
    reference: "03--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-03-10T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 961.54, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 961.54 },
    ],
  },
  {
    id: "je-ah-15",
    branch_id: "branch-1",
    date: "2026-03-31",
    description: "تمويل خزينة محمد شريف ش3 (اجمالى التمويل)",
    reference: "03--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-03-31T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 1777.94, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 1777.94 },
    ],
  },
  {
    id: "je-ah-16",
    branch_id: "branch-1",
    date: "2026-04-30",
    description: "تمويل خزينة مصر لصرف الرواتب الشهرية (شهر ابريل/2026)",
    reference: "04--12",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-30T12:00:00.000Z",
    lines: [
      { account_code: "15010100", debit: 1813.3, credit: 0 },
      { account_code: "13010103", debit: 0, credit: 1813.3 },
    ],
  },
  {
    id: "je-ah-17",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "تمويل خزينه 1153.26 $ معامل 51.75 جم",
    reference: "04--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 1153.26, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 1153.26 },
    ],
  },
  {
    id: "je-ah-18",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "تمويل خزينه 96.53 $ معامل 51.80 جم",
    reference: "04--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T13:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 96.53, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 96.53 },
    ],
  },
  {
    id: "je-ah-19",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "تمويل خزينه 17.31 $ معامل 52 جم",
    reference: "04--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T14:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 17.31, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 17.31 },
    ],
  },
  {
    id: "je-ah-20",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "تمويل خزينه 17.87 $ معامل 52.6 جم",
    reference: "04--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T15:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 17.87, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 17.87 },
    ],
  },
  {
    id: "je-ah-21",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "تمويل خزينه 1842.29 $ معامل 52.5 جم",
    reference: "04--24",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T16:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 1842.29, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 1842.29 },
    ],
  },
  {
    id: "je-ah-22",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "صادرة من القاهرة لوزارة السياحة",
    reference: "04--05",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T17:00:00.000Z",
    lines: [
      { account_code: "601000", debit: 10000, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 10000 },
    ],
  },
  {
    id: "je-ah-23",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "سلفة لتمويل الخزينة كيندي",
    reference: "04--07",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T18:00:00.000Z",
    lines: [
      { account_code: "104000", debit: 4925, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 4925 },
    ],
  },
  {
    id: "je-ah-24",
    branch_id: "branch-1",
    date: "2026-04-15",
    description: "تمويل حزينه م/ احمد حسام (فسط سلفه محمد شريف)",
    reference: "04--26",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-04-15T19:00:00.000Z",
    lines: [
      { account_code: "15010100", debit: 480.77, credit: 0 },
      { account_code: "13010103", debit: 0, credit: 480.77 },
    ],
  },
  {
    id: "je-ah-25",
    branch_id: "branch-1",
    date: "2026-05-17",
    description: "تمويل خزينه 500 $ معامل 53.37 جم",
    reference: "05--21",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-05-17T12:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 500, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 500 },
    ],
  },
  {
    id: "je-ah-26",
    branch_id: "branch-1",
    date: "2026-05-17",
    description: "تمويل خزينه 175 $ معامل 53.37 جم",
    reference: "05--21",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-05-17T13:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 175, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 175 },
    ],
  },
  {
    id: "je-ah-27",
    branch_id: "branch-1",
    date: "2026-05-17",
    description: "تمويل خزينه 1637 $ معامل 53.37 جم",
    reference: "05--21",
    currency: "USD",
    created_by: "أحمد حسام",
    is_approved: true,
    created_at: "2026-05-17T14:00:00.000Z",
    lines: [
      { account_code: "13010103", debit: 1637.3, credit: 0 },
      { account_code: "15010100", debit: 0, credit: 1637.3 },
    ],
  },
];

const DEFAULT_TREASURIES: TreasuryAccount[] = [
  {
    id: "tr-1",
    branch_id: "branch-1",
    name_ar: "خزينة الكاشير",
    type: "cash",
    currency: "MULTI",
    linked_to_restaurant: true,
    balance: 0,
    is_open: true,
    opening_balance: 0,
    available_balance: 0,
    responsible_employee: "كاشير المطعم",
    status: "active",
    deleted: false,
    containers: [
      { id: "cnt-cash-egp", name: "كاش مصري", currency: "EGP", balance: 0 },
      { id: "cnt-card-egp", name: "فيزا مصري", currency: "EGP", balance: 0 },
      { id: "cnt-wallet-egp", name: "محفظة مصري", currency: "EGP", balance: 0 },
      { id: "cnt-cash-usd", name: "كاش دولار", currency: "USD", balance: 0 },
      { id: "cnt-card-usd", name: "فيزا دولار", currency: "USD", balance: 0 },
      { id: "cnt-wallet-usd", name: "محفظة دولار", currency: "USD", balance: 0 },
      { id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-card-ssp", name: "فيزا سوداني", currency: "SSP", balance: 0 },
    ],
  },
  {
    id: "tr-kennedy-usd",
    branch_id: "branch-1",
    name_ar: "خزينة دولار كينيدي",
    type: "cash",
    currency: "USD",
    balance: 0,
    is_open: true,
    opening_balance: 0,
    available_balance: 0,
    responsible_employee: "كينيدي",
    status: "active",
    deleted: false,
  },
  {
    id: "tr-kennedy-ssp",
    branch_id: "branch-1",
    name_ar: "خزينة سوداني كينيدي",
    type: "cash",
    currency: "SSP",
    balance: 0,
    is_open: true,
    opening_balance: 0,
    available_balance: 0,
    responsible_employee: "كينيدي",
    status: "active",
    deleted: false,
  },
  {
    id: "tr-admin-egp",
    branch_id: "branch-1",
    name_ar: "خزينة مصري الإدارة",
    type: "cash",
    currency: "EGP",
    balance: 0,
    is_open: true,
    opening_balance: 0,
    available_balance: 0,
    responsible_employee: "الإدارة",
    status: "active",
    deleted: false,
  },
  {
    id: "tr-ahmed-usd",
    branch_id: "branch-1",
    name_ar: "خزينة دولار أحمد حسام",
    type: "cash",
    currency: "USD",
    balance: 0,
    is_open: true,
    opening_balance: 0,
    available_balance: 0,
    responsible_employee: "أحمد حسام",
    status: "active",
    deleted: false,
  },
  {
    id: "tr-ahmed-egp",
    branch_id: "branch-1",
    name_ar: "خزينة مصري أحمد حسام",
    type: "cash",
    currency: "EGP",
    balance: 0,
    is_open: true,
    opening_balance: 0,
    available_balance: 0,
    responsible_employee: "أحمد حسام",
    status: "active",
    deleted: false,
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name_ar: "شركة الهدى للأغذية والدواجن",
    phone: "01023456789",
    balance: 0,
    deleted: false,
  },
  {
    id: "sup-2",
    name_ar: "المتحدون للخضروات والفاكهة",
    phone: "01123456789",
    balance: 0,
    deleted: false,
  },
  {
    id: "sup-3",
    name_ar: "توب كواليتي لمستلزمات التعبئة",
    phone: "01223456789",
    balance: 0,
    deleted: false,
  },
];

const DEFAULT_USERS: SystemUser[] = [
  {
    id: "u-admin",
    full_name: "مدير النظام",
    username: "admin",
    phone: "01000000000",
    role: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "u-manager",
    full_name: "مشرف الفرع",
    username: "manager",
    phone: "01000000001",
    role: "manager",
    created_at: new Date().toISOString(),
  },
  {
    id: "u-cashier",
    full_name: "كاشير الصالة",
    username: "cashier",
    phone: "01000000002",
    role: "cashier",
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_PERMISSIONS: Record<string, UserPermission> = {
  admin: {
    orders: true,
    pos: true,
    captain: true,
    kitchen: true,
    delivery: true,
    inventory: true,
    hr: true,
    purchasing: true,
    production: true,
    treasury: true,
    accounting: true,
    journal_approval: true,
    expense_approval: true,
    revenue_approval: true,
    reports: true,
    cost_centers: true,
    branch_mgmt: true,
    audit_logs: true,
    users_roles: true,
  },
  manager: {
    orders: true,
    pos: true,
    captain: true,
    kitchen: true,
    delivery: true,
    inventory: true,
    hr: true,
    purchasing: true,
    production: true,
    treasury: false,
    accounting: true,
    journal_approval: false,
    expense_approval: true,
    revenue_approval: true,
    reports: true,
    cost_centers: true,
    branch_mgmt: false,
    audit_logs: false,
    users_roles: false,
  },
  cashier: {
    orders: true,
    pos: true,
    captain: true,
    kitchen: true,
    delivery: true,
    inventory: false,
    hr: false,
    purchasing: false,
    production: false,
    treasury: false,
    accounting: false,
    journal_approval: false,
    expense_approval: false,
    revenue_approval: false,
    reports: false,
    cost_centers: false,
    branch_mgmt: false,
    audit_logs: false,
    users_roles: false,
  },
  "admin@restaurant.com": {
    orders: true,
    pos: true,
    captain: true,
    kitchen: true,
    delivery: true,
    inventory: true,
    hr: true,
    purchasing: true,
    production: true,
    treasury: true,
    accounting: true,
    journal_approval: true,
    expense_approval: true,
    revenue_approval: true,
    reports: true,
    cost_centers: true,
    branch_mgmt: true,
    audit_logs: true,
    users_roles: true,
  },
  "accountant@restaurant.com": {
    orders: false,
    pos: false,
    captain: false,
    kitchen: false,
    delivery: false,
    inventory: true,
    hr: true,
    purchasing: true,
    production: true,
    treasury: false,
    accounting: true,
    journal_approval: false,
    expense_approval: true,
    revenue_approval: true,
    reports: true,
    cost_centers: true,
    branch_mgmt: false,
    audit_logs: false,
    users_roles: false,
  },
};

class ERPStore {
  private state: ERPStoreState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.loadState();
    this.state.treasuryTransactions = [];
    this.state.journalEntries = [];
    this.state.vouchers = [];
    this.state.purchaseOrders = [];
    this.state.inventoryDocuments = [];
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem("pos_local_orders");
    }
    this.recalculateAccountBalances();
    if (typeof window !== "undefined") {
      setTimeout(() => this.saveState(), 1000);
    }
  }

  private loadState(): ERPStoreState {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return this.getDefaultState();
    }
    const raw = localStorage.getItem("erp_store_state");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);

        let treasuries =
          parsed.treasuries?.map((t: any) => {
            let currency = t.currency;
            if (!currency || currency === "EGP") {
              if (t.name_ar?.includes("دولار") || t.id?.includes("usd")) currency = "USD";
              else if (t.name_ar?.includes("سوداني") || t.id?.includes("ssp")) currency = "SSP";
              else if (t.id === "tr-1" || t.linked_to_restaurant) currency = "MULTI";
              else if (t.name_ar?.includes("مصري")) currency = "EGP";
            }
            return {
              ...t,
              currency: currency || "EGP",
              branch_id: "branch-1",
              name_ar: t.id === "tr-3" ? "خزينة الكاش الإضافية" : t.name_ar,
              available_balance: t.available_balance ?? t.balance,
              responsible_employee: t.responsible_employee ?? "غير محدد",
              status: t.status ?? "active",
              deleted: !!t.deleted,
            };
          }) || DEFAULT_TREASURIES;

        // Migration: Delete Treasury 225
        const t225 = treasuries.find((t) => t.name_ar && t.name_ar.includes("225"));
        if (t225) {
          treasuries = treasuries.filter((t) => t.id !== t225.id);
          if (parsed.treasuryTransactions) {
            parsed.treasuryTransactions = parsed.treasuryTransactions.filter(
              (tx) => tx.treasury_id !== t225.id,
            );
          }
        }

        // Migration: Delete Treasury 300 / tr-300 completely
        treasuries = treasuries.filter(
          (t) => t.id !== "tr-300" && t.name_ar !== "300" && !t.name_ar?.includes("300"),
        );

        // Migration: Delete "خزينة الإدارة دولار" / "tr-admin-usd" completely
        treasuries = treasuries.filter(
          (t) =>
            t.id !== "tr-admin-usd" &&
            t.name_ar !== "خزينة الإدارة دولار" &&
            t.name_ar !== "خزينة دولار الإدارة" &&
            !t.name_ar?.includes("الإدارة دولار") &&
            !t.name_ar?.includes("دولار الإدارة"),
        );
        if (parsed.treasuryTransactions) {
          parsed.treasuryTransactions = parsed.treasuryTransactions.filter(
            (tx: any) => tx.treasury_id !== "tr-admin-usd",
          );
        }
        if (parsed.treasuryTransactions) {
          parsed.treasuryTransactions.forEach((tx: any) => {
            if (tx.treasury_id === "tr-300") {
              tx.treasury_id = "tr-1";
            }
          });
        }

        const defaultSalesContainers = [
          { id: "cnt-cash-egp", name: "كاش مصري", currency: "EGP", balance: 0 },
          { id: "cnt-card-egp", name: "فيزا مصري", currency: "EGP", balance: 0 },
          { id: "cnt-wallet-egp", name: "محفظة مصري", currency: "EGP", balance: 0 },
          { id: "cnt-cash-usd", name: "كاش دولار", currency: "USD", balance: 0 },
          { id: "cnt-card-usd", name: "فيزا دولار", currency: "USD", balance: 0 },
          { id: "cnt-wallet-usd", name: "محفظة دولار", currency: "USD", balance: 0 },
          { id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
          { id: "cnt-card-ssp", name: "فيزا سوداني", currency: "SSP", balance: 0 },
          { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },
        ];
        const validSalesContainerIds = new Set(defaultSalesContainers.map((c) => c.id));

        // Ensure Treasury tr-1 exists, is named "خزينة الكاشير", and is linked to restaurant sales
        let mainCashier = treasuries.find(
          (t) =>
            t.id === "tr-1" ||
            t.linked_to_restaurant ||
            (t.name_ar && t.name_ar.includes("الكاشير")),
        );

        if (!mainCashier) {
          mainCashier = {
            id: "tr-1",
            branch_id: "branch-1",
            name_ar: "خزينة الكاشير",
            type: "cash",
            currency: "MULTI",
            linked_to_restaurant: true,
            balance: 15000,
            is_open: true,
      account_code: undefined,
            opening_balance: 15000,
            available_balance: 15000,
            responsible_employee: "أحمد علي",
            status: "active",
            deleted: false,
            containers: defaultSalesContainers,
          };
          treasuries.push(mainCashier);
        } else {
          mainCashier.id = "tr-1";
          mainCashier.name_ar = "خزينة الكاشير";
          mainCashier.linked_to_restaurant = true;
          mainCashier.deleted = false;
          mainCashier.currency = "MULTI";

          const existingContainers = mainCashier.containers || [];
          const cleanedContainers = existingContainers.filter((c) =>
            validSalesContainerIds.has(c.id),
          );

          defaultSalesContainers.forEach((dc) => {
            if (!cleanedContainers.some((c) => c.id === dc.id)) {
              cleanedContainers.push({ ...dc });
            }
          });

          mainCashier.containers = cleanedContainers;
        }

        // Unlink other treasuries from linked_to_restaurant
        treasuries.forEach((t) => {
          if (t.id !== "tr-1") {
            t.linked_to_restaurant = false;
          }
        });

        // Ensure unique treasury IDs (remove any duplicates)
        const seenTreasuryIds = new Set<string>();
        treasuries = treasuries.filter((t) => {
          if (!t.id || seenTreasuryIds.has(t.id)) return false;
          seenTreasuryIds.add(t.id);
          return true;
        });

        let loadedAccounts =
          parsed.accounts !== undefined && Array.isArray(parsed.accounts)
            ? parsed.accounts.map((a: any) => ({
                ...a,
                level: a.level ?? 2,
                status: a.status ?? "active",
              }))
            : [];
            
        // Oracle Migration Merge
        ORACLE_MIGRATION_ACCOUNTS.forEach((oracleAcc) => {
          if (!loadedAccounts.some((a: any) => a.code === oracleAcc.code)) {
            loadedAccounts.push({
              ...oracleAcc,
              balance: 0,
              initial_balance: 0,
              status: "active",
              system_binding: "none"
            });
          }
        });

        let loadedSuppliers =
          parsed.suppliers?.map((s: any) => ({
            ...s,
            deleted: !!s.deleted,
          })) || DEFAULT_SUPPLIERS;

        let loadedTreasuries = treasuries;
        // Ensure all DEFAULT_TREASURIES are present (unless deleted)
        DEFAULT_TREASURIES.forEach((dt) => {
          if (
            dt.id !== "tr-admin-usd" &&
            !loadedTreasuries.some((lt) => lt.id === dt.id || lt.deleted)
          ) {
            loadedTreasuries.push({ ...dt });
          }
        });
        let loadedJournalEntries = parsed.journalEntries || [];

        // Ensure Ahmed Hosam's USD Treasury transactions are merged into the Ledger
        if (!loadedJournalEntries.some((je) => je.id.startsWith("je-ah-"))) {
          loadedJournalEntries = [...loadedJournalEntries, ...SEED_AH_JOURNAL_ENTRIES];
        }

        let loadedTreasuryTransactions = parsed.treasuryTransactions || [];
        let loadedVouchers = parsed.vouchers || [];
        let loadedReconciliations = parsed.reconciliations || [];

        const isMigrated = !!parsed.mock_data_cleared_v6;

        if (!isMigrated) {
          // Reset accounts using DEFAULT_ACCOUNTS with 0 base and no automated system bindings
          loadedAccounts = DEFAULT_ACCOUNTS.map((a) => ({
            ...a,
            balance: 0,
            initial_balance: 0,
            system_binding: "none",
            status: "active",
          }));

          // Reset suppliers to 0
          loadedSuppliers = DEFAULT_SUPPLIERS.map((s) => ({
            ...s,
            balance: 0,
          }));

          // Reset treasuries and set correct starting values for USD and EGP management treasuries
          loadedTreasuries = DEFAULT_TREASURIES.map((t) => {
            if (t.id === "tr-4") {
              return {
                ...t,
                balance: 16523.34,
                opening_balance: 17438.37,
                available_balance: 16523.34,
                containers:
                  t.containers?.map((c: any) => ({
                    ...c,
                    balance: c.currency === "USD" ? 16523.34 : 0,
                  })) || [],
              };
            }
            if (t.id === "tr-5") {
              return {
                ...t,
                balance: 17896.21,
                opening_balance: 607.11,
                available_balance: 17896.21,
                containers:
                  t.containers?.map((c: any) => ({
                    ...c,
                    balance: c.currency === "EGP" ? 17896.21 : 0,
                  })) || [],
              };
            }
            return {
              ...t,
              balance: 0,
              opening_balance: 0,
              available_balance: 0,
              containers: t.containers?.map((c: any) => ({ ...c, balance: 0 })),
            };
          });

          // Reset virtual history
          loadedJournalEntries = [...SEED_AH_JOURNAL_ENTRIES];
          loadedVouchers = [];
          loadedReconciliations = [];

          // Inject real transactions from both USD and EGP Excel files
          loadedTreasuryTransactions = [...USD_SEED_TRANSACTIONS, ...EGP_SEED_TRANSACTIONS];
        }

        return {
          branches: DEFAULT_BRANCHES,
          currentBranchId: "branch-1",
          treasuries: loadedTreasuries,
          suppliers: loadedSuppliers,
          purchaseOrders: (parsed.purchaseOrders || []).map((po: any) => ({
            ...po,
            branch_id: "branch-1",
          })),
          treasuryTransactions: loadedTreasuryTransactions.map((tx: any) => ({
            ...tx,
            branch_id: "branch-1",
          })),
          vouchers: loadedVouchers.map((v: any) => ({
            ...v,
            branch_id: "branch-1",
            deleted: !!v.deleted,
          })),
          accounts: loadedAccounts,
          journalEntries: loadedJournalEntries,
          auditLogs: parsed.auditLogs || [],
          inventoryExpiry:
            parsed.inventoryExpiry && parsed.inventoryExpiry.length > 0
              ? parsed.inventoryExpiry
              : DEFAULT_EXPIRY_SEED,
          menuQualitySpecs: parsed.menuQualitySpecs || {},
          costCenters: parsed.costCenters || DEFAULT_COST_CENTERS,
          isAccountingPeriodLocked: !!parsed.isAccountingPeriodLocked,
          extendedInventoryItems: parsed.extendedInventoryItems || {},
          inventoryDocuments: (parsed.inventoryDocuments || []).map((doc: any) => ({
            ...doc,
            branch_id: "branch-1",
          })),
          reconciliations: loadedReconciliations,
          userPermissions: parsed.userPermissions || DEFAULT_PERMISSIONS,
          currentUser: parsed.currentUser || "admin",
          users: parsed.users || DEFAULT_USERS,
          fiscalYearStatus: parsed.fiscalYearStatus || "open",
          inventorySettings: parsed.inventorySettings || {
            allowNegativeStock: true,
            defaultUnit: "كيلو",
          },
          totalDisposedExpiryValue: Number(parsed.totalDisposedExpiryValue || 0),
          mock_data_cleared_v6: true,
          employees: parsed.employees || DEFAULT_EMPLOYEES,
          attendance: parsed.attendance || [],
          loans: parsed.loans || [],
          payrolls: parsed.payrolls || [],
          mallShops:
            parsed.mallShops && parsed.mallShops.length > 0 ? parsed.mallShops : DEFAULT_MALL_SHOPS,
          mallPayments:
            parsed.mallPayments && parsed.mallPayments.length > 0
              ? parsed.mallPayments
              : DEFAULT_MALL_PAYMENTS,
          mallGardenRevenues:
            parsed.mallGardenRevenues && parsed.mallGardenRevenues.length > 0
              ? parsed.mallGardenRevenues
              : DEFAULT_GARDEN_REVENUES,
          mallGardenExpenses:
            parsed.mallGardenExpenses && parsed.mallGardenExpenses.length > 0
              ? parsed.mallGardenExpenses
              : DEFAULT_GARDEN_EXPENSES,
          mallTerminatedContractsArchive: parsed.mallTerminatedContractsArchive || [],
        };
      } catch (e) {
        console.error("Error parsing ERP state:", e);
      }
    }

    return this.getDefaultState();
  }

  private getDefaultState(): ERPStoreState {
    return {
      branches: DEFAULT_BRANCHES,
      currentBranchId: "branch-1",
      treasuries: DEFAULT_TREASURIES,
      suppliers: DEFAULT_SUPPLIERS,
      purchaseOrders: [],
      treasuryTransactions: USD_SEED_TRANSACTIONS,
      vouchers: [],
      accounts: DEFAULT_ACCOUNTS,
      journalEntries: SEED_AH_JOURNAL_ENTRIES,
      auditLogs: [],
      inventoryExpiry: DEFAULT_EXPIRY_SEED,
      menuQualitySpecs: {},
      costCenters: DEFAULT_COST_CENTERS,
      isAccountingPeriodLocked: false,
      extendedInventoryItems: {},
      inventoryDocuments: [],
      reconciliations: [],
      userPermissions: DEFAULT_PERMISSIONS,
      currentUser: "admin",
      users: DEFAULT_USERS,
      fiscalYearStatus: "open",
      inventorySettings: {
        allowNegativeStock: true,
        defaultUnit: "كيلو",
      },
      totalDisposedExpiryValue: 0,
      employees: DEFAULT_EMPLOYEES,
      attendance: [],
      loans: [],
      payrolls: [],
      mallShops: DEFAULT_MALL_SHOPS,
      mallPayments: DEFAULT_MALL_PAYMENTS,
      mallGardenRevenues: DEFAULT_GARDEN_REVENUES,
      mallGardenExpenses: DEFAULT_GARDEN_EXPENSES,
      mallTerminatedContractsArchive: [],
    };
  }

  private saveState() {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem("erp_store_state", JSON.stringify(this.state));
    }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  resetRestaurantSales() {
    this.state.sales_invoices = [];
    this.state.treasuryTransactions = this.state.treasuryTransactions.filter(
      (t) => t.type !== "sale" && t.type !== "income",
    );
    this.state.journalEntries = this.state.journalEntries.filter(
      (j) => !j.description?.includes("فاتورة مبيعات"),
    );
    const linkedTreasury = this.state.treasuries.find((t) => t.linked_to_restaurant);
    if (linkedTreasury) {
      linkedTreasury.balance = 0;
    }
    this.saveState();
  }

  getState(): ERPStoreState {
    return this.state;
  }

  getCurrentBranch(): Branch {
    return (
      this.state.branches.find((b) => b.id === this.state.currentBranchId) || this.state.branches[0]
    );
  }

  setCurrentBranch(branchId: string) {
    this.state.currentBranchId = branchId;
    this.saveState();
    this.logAction(
      "SYSTEM",
      "تغيير الفرع الحالي",
      `تم الانتقال إلى الفرع ذو المعرف ${branchId}`,
      "SYSTEM",
    );
  }

  // Auditing
  logAction(
    user: string,
    action: string,
    details: string,
    actionType: AuditLog["action_type"] = "SYSTEM",
    beforeValue?: string,
    afterValue?: string,
  ) {
    const log: AuditLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      user_email: user,
      action,
      details,
      created_at: new Date().toISOString(),
      action_type: actionType,
      before_value: beforeValue,
      after_value: afterValue,
      ip_address: "127.0.0.1",
    };
    this.state.auditLogs.unshift(log);
    this.saveState();
  }

  // Permissions & Current User management
  getUsers() {
    return this.state.users || [];
  }
  upsertUser(user: SystemUser) {
    if (!this.state.users) this.state.users = [];
    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = user;
    } else {
      this.state.users.push(user);
    }
    this.saveState();
  }
  deleteUser(id: string) {
    if (!this.state.users) return;
    this.state.users = this.state.users.filter((u) => u.id !== id);
    this.saveState();
  }
  setCurrentUser(email: string) {
    this.state.currentUser = email;
    this.saveState();
    this.logAction("SYSTEM", "تغيير المستخدم النشط", `تم تسجيل دخول المستخدم: ${email}`, "SYSTEM");
  }

  updateUserPermission(email: string, permissions: Partial<UserPermission>) {
    const existing = this.state.userPermissions[email] || {
      treasury: false,
      accounting: false,
      journal_approval: false,
      expense_approval: false,
      revenue_approval: false,
      reports: false,
      cost_centers: false,
      branch_mgmt: false,
      audit_logs: false,
    };
    this.state.userPermissions[email] = {
      ...existing,
      ...permissions,
    };
    this.saveState();
    this.logAction("ADMIN", "تحديث صلاحيات مستخدم", `تم تحديث صلاحيات ${email}`, "UPDATE");
  }

  // Branch Management
  addBranch(name: string, name_ar: string, code: string) {
    const branch: Branch = {
      id: "branch-" + Date.now(),
      name,
      name_ar,
      code,
    };
    this.state.branches.push(branch);
    this.saveState();
    this.logAction("ADMIN", "إضافة فرع جديد", `تم إنشاء فرع جديد: ${name_ar} (${code})`, "CREATE");
    return branch;
  }

  clearAllAccountsAndTransactions() {
    this.state.accounts = [];
    this.state.treasuryTransactions = [];
    this.state.journalEntries = [];
    this.state.vouchers = [];
    this.state.purchaseOrders = [];
    this.state.inventoryDocuments = [];
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem("pos_local_orders");
    }
    this.saveState();
    this.logAction(
      "ADMIN",
      "مسح كامل الحسابات والحركات",
      "تم تفريغ جميع الحسابات والحركات المالية لإعادة البدء بدليل نظيف",
      "DELETE",
    );
  }

  // Suppliers with Soft Delete
  addSupplier(name_ar: string, phone?: string, openingBalance = 0) {
    const supplier: Supplier = {
      id: "sup-" + Date.now(),
      name_ar,
      phone,
      balance: openingBalance,
      deleted: false,
    };
    this.state.suppliers.push(supplier);
    this.saveState();
    this.logAction("ADMIN", "إضافة مورد جديد", `تم تسجيل المورد: ${name_ar}`, "CREATE");
    return supplier;
  }

  deleteSupplier(id: string) {
    const sup = this.state.suppliers.find((s) => s.id === id);
    if (sup) {
      sup.deleted = true;
      this.saveState();
      this.logAction("ADMIN", "حذف مورد (حذف مؤقت)", `تم حذف المورد #${id} مؤقتاً`, "DELETE");
    }
  }

  updateSupplier(id: string, payload: Partial<Supplier>) {
    const sup = this.state.suppliers.find((s) => s.id === id);
    if (sup) {
      Object.assign(sup, payload);
      this.saveState();
      this.logAction("ADMIN", "تعديل بيانات مورد", `تم تعديل المورد: ${sup.name_ar}`, "UPDATE");
    }
  }

  updateSupplierBalance(id: string, amount: number) {
    const sup = this.state.suppliers.find((s) => s.id === id);
    if (sup) {
      sup.balance += amount;
      this.saveState();
    }
  }

  // Multi-Treasury Management
  addTreasury(
    name_ar: string,
    type: "cash" | "bank",
    currency: string,
    openingBalance = 0,
    employee = "غير محدد",
    containers: TreasuryContainer[] = [],
    linked_to_restaurant = false,
    account_code?: string,
  ) {
    const treasury: TreasuryAccount = {
      id: "tr-" + Date.now(),
      branch_id: this.state.currentBranchId,
      name_ar,
      type,
      currency,
      balance: openingBalance,
      is_open: true,
      account_code: undefined,
      opening_balance: openingBalance,
      available_balance: openingBalance,
      responsible_employee: employee,
      status: "active",
      deleted: false,
      containers,
      linked_to_restaurant,
    };
    this.state.treasuries.push(treasury);
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة حساب خزينة/بنك",
      `تم إنشاء حساب ${name_ar} برصيد إفتتاحي ${openingBalance} ${currency}`,
      "CREATE",
    );
    return treasury;
  }

  updateTreasury(id: string, payload: Partial<TreasuryAccount>) {
    const tr = this.state.treasuries.find((t) => t.id === id);
    if (tr) {
      Object.assign(tr, payload);
      this.saveState();
      this.logAction("ADMIN", "تعديل حساب خزينة/بنك", `تم تعديل حساب: ${tr.name_ar}`, "UPDATE");
    }
  }

  setTreasuryOpenStatus(treasuryId: string, isOpen: boolean) {
    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (tr) {
      const oldState = tr.is_open;
      tr.is_open = isOpen;
      tr.status = isOpen ? "active" : "closed";
      this.saveState();
      this.logAction(
        "ADMIN",
        isOpen ? "فتح الخزينة اليومي" : "إغلاق الخزينة اليومي",
        `تم تغيير حالة خزينة ${tr.name_ar} إلى ${isOpen ? "مفتوحة" : "مغلقة"}`,
        "UPDATE",
        `isOpen: ${oldState}`,
        `isOpen: ${isOpen}`,
      );
    }
  }

  deleteTreasury(id: string) {
    const trIndex = this.state.treasuries.findIndex((t) => t.id === id);
    const tr = this.state.treasuries[trIndex];
    if (tr) {
      if (Math.abs(tr.balance) > 0.001) {
        throw new Error(
          `لا يمكن حذف الخزينة وهي تحتوي على رصيد مالي نشط (${tr.balance.toLocaleString()} ${tr.currency}).`,
        );
      }

      tr.deleted = true;
      tr.is_open = false;
      this.state.treasuries.splice(trIndex, 1);

      this.saveState();
      this.logAction("ADMIN", "حذف خزينة", `تم حذف الخزينة ${tr.name_ar}`, "DELETE");
    }
  }

  reconcileTreasury(treasuryId: string, actualCount: number, notes: string) {
    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (!tr) throw new Error("الخزينة غير موجودة");

    const ledgerBalance = tr.balance;
    const difference = actualCount - ledgerBalance;

    const recon: TreasuryReconciliation = {
      id: "rec-" + Date.now(),
      treasury_id: treasuryId,
      date: new Date().toISOString(),
      ledger_balance: ledgerBalance,
      actual_balance: actualCount,
      difference,
      reconciled_by: this.state.currentUser,
      notes,
    };

    if (!this.state.reconciliations) {
      this.state.reconciliations = [];
    }
    this.state.reconciliations.unshift(recon);

    // Update treasury balance to match actual count
    tr.balance = actualCount;
    tr.available_balance = actualCount;

    // Post automatic reconciliation journal entry
    const entryId = "rec-" + Date.now().toString().substring(8);
    this.postReconciliationJournal(recon, tr);

    this.saveState();
    this.logAction(
      "ADMIN",
      "تسوية ومطابقة خزينة",
      `تم تسوية خزينة ${tr.name_ar} بفارق ${difference.toFixed(2)} ج.م (جرد فعلي: ${actualCount})`,
      "TRANSACTION",
    );
  }

  private postReconciliationJournal(recon: TreasuryReconciliation, tr: TreasuryAccount) {
    const treasuryAccountCode =
      tr.type === "bank" ? "102000" : tr.branch_id === "branch-2" ? "101001" : "101000";
    const diff = recon.difference;

    const lines: JournalLine[] = [];
    if (diff > 0) {
      // Surplus: Debit Treasury, Credit Other Income (revenue/reconciliation profit)
      lines.push({ account_code: treasuryAccountCode, debit: diff, credit: 0 });
      lines.push({ account_code: "401000", debit: 0, credit: diff }); // Post as surplus revenue
    } else if (diff < 0) {
      // Deficit: Debit Hadr/Loss expense (506000), Credit Treasury
      lines.push({ account_code: "506000", debit: Math.abs(diff), credit: 0 });
      lines.push({ account_code: treasuryAccountCode, debit: 0, credit: Math.abs(diff) });
    }

    if (lines.length > 0) {
      this.addJournalEntry(
        `تسوية جرد مالي لخزينة ${tr.name_ar}`,
        lines,
        `REC-${recon.id.substring(4, 9).toUpperCase()}`,
      );
    }
  }

  addTreasuryTransaction(
    treasuryId: string,
    type: TreasuryTransaction["type"],
    amount: number,
    currency: string,
    note: string,
    relatedId?: string,
    paymentMethod?: string,
    containerId?: string,
  ) {
    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (!tr) return;

    const beforeBal = tr.balance;

    if (type === "deposit" || type === "sales" || type === "transfer_in") {
      tr.balance += amount;
      tr.available_balance = tr.balance;
      if (containerId && tr.containers) {
        const cnt = tr.containers.find((c) => c.id === containerId);
        if (cnt) cnt.balance += amount;
      }
    } else {
      tr.balance -= amount;
      tr.available_balance = tr.balance;
      if (containerId && tr.containers) {
        const cnt = tr.containers.find((c) => c.id === containerId);
        if (cnt) cnt.balance -= amount;
      }
    }

    const tx: TreasuryTransaction = {
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      branch_id: this.state.currentBranchId,
      treasury_id: treasuryId,
      type,
      amount,
      currency,
      payment_method: paymentMethod || "cash",
      note,
      related_entity_id: relatedId,
      created_at: new Date().toISOString(),
    };

    this.state.treasuryTransactions.unshift(tx);
    this.saveState();

    this.logAction(
      this.state.currentUser,
      "حركة مالية على الخزينة",
      `تم إجراء حركة ${type} بقيمة ${amount} ج.م على خزينة ${tr.name_ar}`,
      "TRANSACTION",
      `balance: ${beforeBal}`,
      `balance: ${tr.balance}`,
    );

    // Auto Journal Entry Posting
    this.postTreasuryJournal(tx, tr);
  }

  private postTreasuryJournal(tx: TreasuryTransaction, tr: TreasuryAccount) {
    let debitAccount = "101000"; // Default Main Cash
    let creditAccount = "301000"; // Default Capital

    if (this.state.currentBranchId === "branch-2") {
      debitAccount = "101001"; // Juba Cash
    } else if (tr.type === "bank") {
      debitAccount = "102000"; // CIB Bank
    }

    if (tx.type === "sales") {
      creditAccount = "401000"; // Sales Revenue
    } else if (tx.type === "expense") {
      creditAccount = "504000"; // Utilities Expense
    } else if (tx.type === "purchase") {
      creditAccount = "103000"; // RAW inventory asset
    }

    const lines: JournalLine[] = [];
    if (tx.type === "deposit" || tx.type === "sales" || tx.type === "transfer_in") {
      lines.push({ account_code: debitAccount, debit: tx.amount, credit: 0 });
      lines.push({ account_code: creditAccount, debit: 0, credit: tx.amount });
    } else if (
      tx.type === "withdrawal" ||
      tx.type === "purchase" ||
      tx.type === "expense" ||
      tx.type === "transfer_out"
    ) {
      lines.push({ account_code: creditAccount, debit: tx.amount, credit: 0 });
      lines.push({ account_code: debitAccount, debit: 0, credit: tx.amount });
    }

    if (lines.length > 0) {
      this.addJournalEntry(tx.note, lines, `TX-${tx.id.substring(3, 8).toUpperCase()}`);
    }
  }

  // --- Chart of Accounts Methods ---
  addAccount(
    code: string,
    name_ar: string,
    type: Account["type"],
    parentCode?: string,
    level = 2,
    initial_balance = 0,
    system_binding: Account["system_binding"] = "none",
    currency = "EGP",
  ) {
    if (this.state.accounts.some((a) => a.code === code)) {
      throw new Error("كود الحساب موجود بالفعل");
    }

    const account: Account = {
      code,
      name_ar,
      type,
      balance: initial_balance,
      parent_code: parentCode,
      level,
      status: "active",
      initial_balance,
      system_binding,
      currency,
      sync_status: system_binding && system_binding !== "none" ? "pending" : "synced",
    };

    this.state.accounts.push(account);
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة حساب محاسبي",
      `تم تسجيل الحساب الجديد في الدليل: ${name_ar} (${code})`,
      "CREATE",
    );
    return account;
  }

  updateAccountStatus(code: string, status: "active" | "inactive") {
    const acc = this.state.accounts.find((a) => a.code === code);
    if (acc) {
      acc.status = status;
      this.saveState();
      this.logAction(
        "ADMIN",
        "تحديث حالة حساب",
        `تم تغيير حالة حساب ${acc.name_ar} إلى ${status}`,
        "UPDATE",
      );
    }
  }

  updateAccount(code: string, payload: Partial<Account>) {
    const acc = this.state.accounts.find((a) => a.code === code);
    if (!acc) throw new Error("الحساب غير موجود");

    // If changing code, check uniqueness
    if (payload.code && payload.code !== code) {
      if (this.state.accounts.some((a) => a.code === payload.code)) {
        throw new Error("كود الحساب الجديد مستخدم بالفعل لحساب آخر");
      }
      // Update parent_code references in child accounts
      this.state.accounts.forEach((a) => {
        if (a.parent_code === code) a.parent_code = payload.code;
      });
      // Update journal entries matching old code
      this.state.journalEntries.forEach((je) => {
        je.lines?.forEach((l) => {
          if (l.account_code === code) l.account_code = payload.code!;
        });
      });
    }

    const oldBinding = acc.system_binding;
    Object.assign(acc, payload);
    if (payload.system_binding !== undefined && payload.system_binding !== oldBinding) {
      acc.sync_status = payload.system_binding !== "none" ? "pending" : "synced";
    }
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "تعديل حساب محاسبي",
      `تم تعديل بيانات الحساب المحاسبي: ${acc.name_ar} (${acc.code})`,
      "UPDATE",
    );
    return acc;
  }

  activateAccountSync(code: string) {
    const acc = this.state.accounts.find((a) => a.code === code);
    if (acc) {
      acc.sync_status = "synced";
      this.recalculateAccountBalances();
      this.saveState();
      this.logAction(
        "ADMIN",
        "تنشيط مزامنة رصيد الحساب",
        `تم تنشيط مزامنة الرصيد وتحديثه للحساب: ${acc.name_ar} (${acc.code})`,
        "UPDATE",
      );
    }
  }

  deleteAccount(code: string) {
    const index = this.state.accounts.findIndex((a) => a.code === code);
    if (index === -1) throw new Error("الحساب غير موجود");

    const acc = this.state.accounts[index];
    // Check if account has child accounts
    const hasChildren = this.state.accounts.some((a) => a.parent_code === code);
    if (hasChildren) {
      throw new Error(
        "لا يمكن حذف حساب رئيسي يمتلك حسابات فرعية. قم بحذف أو نقل الحسابات الفرعية أولاً.",
      );
    }

    // Check if account has journal entries recorded
    const hasEntries = this.state.journalEntries.some((je) =>
      je.lines?.some((l) => l.account_code === code),
    );
    if (hasEntries) {
      // Soft-deactivate for audit safety
      acc.status = "inactive";
      this.saveState();
      this.logAction(
        "ADMIN",
        "تعطيل حساب مرتبط بقيود",
        `الحساب ${acc.name_ar} (${acc.code}) مرتبط بقيود محاسبية، تم تحويل حالته إلى معطل بدلاً من الحذف الفيزيائي لحفظ الشجرة والنزاهة المالية.`,
        "UPDATE",
      );
      return {
        softDeleted: true,
        message: "الحساب مرتبط بقيود محاسبية، تم تعطيله بدلاً من الحذف لحفظ النزاهة المالية.",
      };
    }

    this.state.accounts.splice(index, 1);
    this.saveState();
    this.logAction(
      "ADMIN",
      "حذف حساب محاسبي",
      `تم حذف الحساب المحاسبي من الدليل: ${acc.name_ar} (${code})`,
      "DELETE",
    );
    return { softDeleted: false, message: "تم حذف الحساب بنجاح!" };
  }

  recalculateAccountBalances() {
    const balanceMap: Record<string, number> = {};

    this.state.accounts.forEach((acc) => {
      balanceMap[acc.code] = acc.initial_balance || 0;
    });

    this.state.journalEntries.forEach((entry) => {
      if (!entry.lines) return;
      entry.lines.forEach((line) => {
        const acc = this.state.accounts.find((a) => a.code === line.account_code);
        if (acc) {
          if (balanceMap[acc.code] === undefined) balanceMap[acc.code] = acc.initial_balance || 0;
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);

          if (acc.type === "asset" || acc.type === "expense") {
            balanceMap[acc.code] += debit - credit;
          } else {
            balanceMap[acc.code] += credit - debit;
          }
        }
      });
    });

    // Apply system bindings if present and synced
    this.state.accounts.forEach((acc) => {
      if (acc.system_binding && acc.system_binding !== "none" && acc.sync_status !== "pending") {
        let liveBalance = acc.initial_balance || 0;
        if (acc.system_binding.startsWith("treasury_")) {
          const tId = acc.system_binding.replace("treasury_", "");
          let t = this.state.treasuries.find((x) => x.id === tId);
          if (!t) {
            if (tId === "main") t = this.state.treasuries.find((x) => x.id === "tr-1");
            else if (tId === "cib") t = this.state.treasuries.find((x) => x.id === "tr-2");
            else if (tId === "extra") t = this.state.treasuries.find((x) => x.id === "tr-3");
            else if (tId === "usd") t = this.state.treasuries.find((x) => x.id === "tr-4");
            else if (tId === "management_egp")
              t = this.state.treasuries.find((x) => x.id === "tr-5");
          }
          if (t) {
            liveBalance = t.balance || 0;
          }
        } else {
          switch (acc.system_binding) {
            case "suppliers_payable":
              liveBalance = this.state.suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
              break;
            case "sales_revenue": {
              // Calculate total of all receipts/vouchers or sales
              const totalReceipts =
                this.state.vouchers
                  ?.filter((v) => !v.deleted && v.type === "receipt")
                  ?.reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;
              liveBalance = totalReceipts;
              break;
            }
            case "operating_expenses": {
              const totalPayments =
                this.state.vouchers
                  ?.filter((v) => !v.deleted && v.type === "payment")
                  ?.reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;
              liveBalance = totalPayments;
              break;
            }
            case "warehouse_main_value": {
              const items = localWarehouseStore.getInventory();
              const whInvMain = localWarehouseStore.getWarehouseInventory("wh-main-default");
              liveBalance = whInvMain.reduce((sum, row) => {
                const item = items.find((i) => i.id === row.inventory_id);
                if (item) {
                  return sum + Number(row.quantity || 0) * Number(item.cost || 0);
                }
                return sum;
              }, 0);
              break;
            }
            case "warehouse_kitchen_value": {
              const items = localWarehouseStore.getInventory();
              const whInvKitchen = localWarehouseStore.getWarehouseInventory("wh-sub-kitchen");
              liveBalance = whInvKitchen.reduce((sum, row) => {
                const item = items.find((i) => i.id === row.inventory_id);
                if (item) {
                  return sum + Number(row.quantity || 0) * Number(item.cost || 0);
                }
                return sum;
              }, 0);
              break;
            }
            case "expired_inventory_value": {
              const nowStr = new Date().toISOString().split("T")[0];
              const expiredBatches = this.state.inventoryExpiry.filter(
                (b) => b.expiry_date <= nowStr,
              );
              const items = localWarehouseStore.getInventory();
              liveBalance = expiredBatches.reduce((sum, batch) => {
                const item = items.find((i) => i.id === batch.inventory_id);
                if (item) {
                  return sum + Number(batch.quantity || 0) * Number(item.cost || 0);
                }
                return sum;
              }, 0);
              break;
            }
            case "disposed_waste_value": {
              liveBalance = this.state.totalDisposedExpiryValue || 0;
              break;
            }
            default:
              break;
          }
        }
        balanceMap[acc.code] = liveBalance;
      }
    });

    this.state.accounts.forEach((acc) => {
      if (balanceMap[acc.code] !== undefined) {
        acc.balance = balanceMap[acc.code];
      }
    });

    // Also recalculate and synchronize Treasury and container balances
    if (this.state.treasuries && this.state.treasuries.length > 0) {
      this.state.treasuries.forEach((tr) => {
        // Calculate balance from treasury transactions
        let txBalance = Number(tr.opening_balance || 0);
        const relatedTxs = (this.state.treasuryTransactions || []).filter(
          (tx) => tx.treasury_id === tr.id
        );

        relatedTxs.forEach((tx) => {
          const amt = Number(tx.amount || 0);
          if (tx.type === "deposit" || tx.type === "sales" || tx.type === "transfer_in") {
            txBalance += amt;
          } else {
            txBalance -= amt;
          }
        });

        // If there are recorded transactions or an account code, sync
        if (relatedTxs.length > 0) {
          tr.balance = txBalance;
          tr.available_balance = txBalance;
        } else if (tr.account_code && balanceMap[tr.account_code] !== undefined) {
          tr.balance = balanceMap[tr.account_code];
          tr.available_balance = balanceMap[tr.account_code];
        }

        // Synchronize container balances if present
        if (tr.containers && tr.containers.length > 0) {
          tr.containers.forEach((cnt) => {
            let cntBal = 0;
            const cntTxs = relatedTxs.filter((tx) => {
              if (tx.currency && cnt.currency && tx.currency.toUpperCase() === cnt.currency.toUpperCase()) {
                return true;
              }
              return false;
            });
            cntTxs.forEach((tx) => {
              const amt = Number(tx.amount || 0);
              if (tx.type === "deposit" || tx.type === "sales" || tx.type === "transfer_in") {
                cntBal += amt;
              } else {
                cntBal -= amt;
              }
            });
            if (cntTxs.length > 0) {
              cnt.balance = cntBal;
            }
          });
        }
      });
    }

    this.saveState();
  }

  // Resolve matching treasury for a specific account code, currency, or description
  resolveTreasuryForAccount(
    accountCode: string,
    currency?: string,
    movementNote?: string
  ): TreasuryAccount | undefined {
    if (!this.state.treasuries || this.state.treasuries.length === 0) return undefined;

    // 1. Direct match by account_code
    const directMatch = this.state.treasuries.find(
      (t) => !t.deleted && t.account_code && t.account_code === accountCode
    );
    if (directMatch) return directMatch;

    const code = String(accountCode || "").trim();
    const curr = (currency || "").toUpperCase();
    const note = (movementNote || "").toLowerCase();

    // 2. Specific Known System Accounts
    if (code === "15010100" || code === "150101" || code.startsWith("150101")) {
      // Ahmed Hossam USD treasury
      const usdTr = this.state.treasuries.find((t) => !t.deleted && (t.id === "tr-4" || (t.currency === "USD" && t.type === "cash")));
      if (usdTr) return usdTr;
    }

    if (code === "15010200" || code === "150102" || (code.startsWith("1501") && curr === "EGP")) {
      // Ahmed Hossam EGP treasury
      const egpTr = this.state.treasuries.find((t) => !t.deleted && (t.id === "tr-5" || (t.currency === "EGP" && t.name_ar.includes("مصري"))));
      if (egpTr) return egpTr;
    }

    if (code === "101000" || code === "1010" || code.startsWith("101000")) {
      if (curr === "USD") {
        const usdTr = this.state.treasuries.find((t) => !t.deleted && t.currency === "USD");
        if (usdTr) return usdTr;
      } else if (curr === "SSP") {
        const sspTr = this.state.treasuries.find((t) => !t.deleted && t.currency === "SSP");
        if (sspTr) return sspTr;
      }
      // Default to restaurant main cashier
      const cashierTr = this.state.treasuries.find((t) => !t.deleted && (t.id === "tr-1" || t.linked_to_restaurant));
      if (cashierTr) return cashierTr;
    }

    if (code === "101001" || code.includes("juba") || note.includes("جوبا")) {
      const jubaTr = this.state.treasuries.find((t) => !t.deleted && (t.id === "tr-juba" || t.branch_id === "branch-2" || t.name_ar.includes("جوبا")));
      if (jubaTr) return jubaTr;
    }

    if (code === "102000" || code.startsWith("1502") || code.startsWith("1020") || note.includes("بنك") || note.includes("cib")) {
      const bankTr = this.state.treasuries.find((t) => !t.deleted && (t.type === "bank" || t.id === "tr-2" || t.id === "tr-cib"));
      if (bankTr) return bankTr;
    }

    // 3. Match by account name in store
    const acc = this.state.accounts.find((a) => a.code === code);
    if (acc) {
      const accName = acc.name_ar.toLowerCase();
      if (accName.includes("دولار") || accName.includes("usd")) {
        const t = this.state.treasuries.find((tr) => !tr.deleted && tr.currency === "USD");
        if (t) return t;
      }
      if (accName.includes("بنك") || accName.includes("cib") || accName.includes("ايدين")) {
        const t = this.state.treasuries.find((tr) => !tr.deleted && tr.type === "bank");
        if (t) return t;
      }
      if (accName.includes("كاشير") || accName.includes("صالة") || accName.includes("مطعم")) {
        const t = this.state.treasuries.find((tr) => !tr.deleted && (tr.id === "tr-1" || tr.linked_to_restaurant));
        if (t) return t;
      }
      if (accName.includes("مصري") || accName.includes("ادارة") || accName.includes("إدارة")) {
        const t = this.state.treasuries.find((tr) => !tr.deleted && (tr.id === "tr-5" || tr.currency === "EGP"));
        if (t) return t;
      }
    }

    // Fallback: match by currency
    if (curr) {
      const fallbackByCurr = this.state.treasuries.find((t) => !t.deleted && t.currency === curr);
      if (fallbackByCurr) return fallbackByCurr;
    }

    return this.state.treasuries.find((t) => !t.deleted);
  }

  // Determine movement type for treasury transaction
  inferMovementTypeFromLine(
    line: JournalLine,
    mainDesc: string = "",
    otherLines: JournalLine[] = []
  ): TreasuryTransaction["type"] {
    const isDebit = Number(line.debit || 0) > 0;
    const isCredit = Number(line.credit || 0) > 0;
    const desc = (line.description || "" + " " + mainDesc).toLowerCase();

    // Check other lines accounts
    const hasRevenueAccount = otherLines.some((l) => l.account_code.startsWith("4"));
    const hasExpenseAccount = otherLines.some((l) => l.account_code.startsWith("5") || l.account_code.startsWith("6") || l.account_code.startsWith("3"));
    const hasTreasuryAccount = otherLines.some((l) => l.account_code.startsWith("1501") || l.account_code.startsWith("1010") || l.account_code.startsWith("1020"));
    const hasSupplierOrInv = otherLines.some((l) => l.account_code.startsWith("103") || l.account_code.startsWith("202") || l.account_code.startsWith("140"));

    if (isDebit) {
      // Money IN to Treasury
      if (desc.includes("تحويل") || desc.includes("تمويل") || hasTreasuryAccount) return "transfer_in";
      if (desc.includes("مبيعات") || desc.includes("ايراد") || desc.includes("إيراد") || hasRevenueAccount) return "sales";
      if (desc.includes("تسوية") || desc.includes("فارق")) return "reconciliation";
      return "deposit";
    }

    if (isCredit) {
      // Money OUT from Treasury
      if (desc.includes("تحويل") || desc.includes("تمويل") || hasTreasuryAccount) return "transfer_out";
      if (desc.includes("شراء") || desc.includes("مشتريات") || desc.includes("خامات") || hasSupplierOrInv) return "purchase";
      if (
        desc.includes("مصروف") ||
        desc.includes("مرتب") ||
        desc.includes("اجور") ||
        desc.includes("أجور") ||
        desc.includes("بنزين") ||
        desc.includes("صيانة") ||
        desc.includes("بوفيه") ||
        desc.includes("ايجار") ||
        desc.includes("إيجار") ||
        desc.includes("سلف") ||
        hasExpenseAccount
      ) {
        return "expense";
      }
      if (desc.includes("تسوية") || desc.includes("عجز")) return "reconciliation";
      return "withdrawal";
    }

    return "deposit";
  }

  // Import Journal Entries from Excel and link with general accounts & correct treasuries
  importJournalEntriesAndSyncTreasuries(
    entries: JournalEntry[],
    options: { sourceName?: string } = {}
  ): {
    insertedEntries: number;
    newAccountsCreated: number;
    linkedTreasuryTransactions: number;
  } {
    let insertedEntries = 0;
    let newAccountsCreated = 0;
    let linkedTreasuryTransactions = 0;

    const existingEntryIds = new Set(this.state.journalEntries.map((je) => je.id));
    const existingEntryRefs = new Set(
      this.state.journalEntries.map((je) => `${je.reference || ""}_${je.date || ""}_${je.description || ""}`)
    );

    const existingAccountCodes = new Set(this.state.accounts.map((a) => a.code));
    const existingTxIds = new Set(this.state.treasuryTransactions.map((tx) => tx.id));
    const existingTxRefs = new Set(
      this.state.treasuryTransactions.map((tx) => `${tx.related_entity_id || ""}_${tx.treasury_id}_${tx.amount}_${tx.type}`)
    );

    entries.forEach((entry) => {
      const entryKey = `${entry.reference || ""}_${entry.date || ""}_${entry.description || ""}`;
      
      // Determine if entry is new
      let entryToProcess = entry;
      if (!existingEntryIds.has(entry.id) && !existingEntryRefs.has(entryKey)) {
        this.state.journalEntries.unshift(entry);
        existingEntryIds.add(entry.id);
        existingEntryRefs.add(entryKey);
        insertedEntries++;
      } else {
        const found = this.state.journalEntries.find(
          (j) => j.id === entry.id || `${j.reference || ""}_${j.date || ""}_${j.description || ""}` === entryKey
        );
        if (found) entryToProcess = found;
      }

      // Check each line
      (entryToProcess.lines || []).forEach((line, lineIndex) => {
        const code = String(line.account_code || "").trim();
        if (!code) return;

        // 1. Ensure Account exists in Chart of Accounts
        if (!existingAccountCodes.has(code)) {
          let type: Account["type"] = "asset";
          if (code.startsWith("1")) type = "asset";
          else if (code.startsWith("2")) type = "liability";
          else if (code.startsWith("3")) type = "equity";
          else if (code.startsWith("4")) type = "revenue";
          else if (code.startsWith("5") || code.startsWith("6")) type = "expense";

          let level = 3;
          if (code.length <= 1) level = 1;
          else if (code.length <= 3) level = 2;
          else if (code.length <= 5) level = 3;
          else level = 4;

          const newAcc: Account = {
            code,
            name_ar: line.description ? `حساب (${code}) - ${line.description}` : `حساب محاسبي (${code})`,
            type,
            level,
            balance: 0,
            initial_balance: 0,
            status: "active",
            currency: line.currency || entryToProcess.currency || "EGP",
            system_binding: "none",
          };

          this.state.accounts.push(newAcc);
          existingAccountCodes.add(code);
          newAccountsCreated++;
        }

        // 2. Check if line touches a Treasury / Cash / Bank account
        const isTreasuryAccount =
          code.startsWith("1501") ||
          code.startsWith("1010") ||
          code.startsWith("1502") ||
          code.startsWith("1020") ||
          this.state.treasuries.some((t) => t.account_code === code);

        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        const amount = debit > 0 ? debit : credit;

        if (isTreasuryAccount && amount > 0) {
          const matchedTreasury = this.resolveTreasuryForAccount(
            code,
            line.currency || entryToProcess.currency,
            line.description || entryToProcess.description
          );

          if (matchedTreasury) {
            const otherLines = (entryToProcess.lines || []).filter((_, idx) => idx !== lineIndex);
            const movementType = this.inferMovementTypeFromLine(
              line,
              entryToProcess.description,
              otherLines
            );

            const txCurrency = line.currency || entryToProcess.currency || matchedTreasury.currency || "EGP";
            const txNote = line.description || entryToProcess.description || `قيد رقم ${entryToProcess.reference || entryToProcess.id}`;
            const txKey = `${entryToProcess.id}_${matchedTreasury.id}_${amount}_${movementType}`;

            if (!existingTxRefs.has(txKey)) {
              const txId = `tx-import-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
              const txDate = entryToProcess.date ? new Date(entryToProcess.date).toISOString() : new Date().toISOString();

              const newTx: TreasuryTransaction = {
                id: txId,
                branch_id: matchedTreasury.branch_id || "branch-1",
                treasury_id: matchedTreasury.id,
                type: movementType,
                amount: amount,
                currency: txCurrency,
                payment_method: matchedTreasury.type === "bank" ? "bank_transfer" : "cash",
                note: txNote,
                related_entity_id: entryToProcess.id,
                created_at: txDate,
              };

              this.state.treasuryTransactions.unshift(newTx);
              existingTxIds.add(txId);
              existingTxRefs.add(txKey);
              linkedTreasuryTransactions++;
            }
          }
        }
      });
    });

    this.recalculateAccountBalances();
    this.saveState();

    this.logAction(
      "ADMIN",
      "استيراد ومعالجة قيود Excel",
      `تم استيراد ومعالجة ${insertedEntries} قيد، وإنشاء ${newAccountsCreated} حساب جديد، وربط ${linkedTreasuryTransactions} حركة بالخزائن المقابلة.`,
      "IMPORT"
    );

    return {
      insertedEntries,
      newAccountsCreated,
      linkedTreasuryTransactions,
    };
  }

  // Merge and refresh all records, accounts, and treasuries
  mergeAndSyncAllData(): {
    accountsCount: number;
    entriesCount: number;
    treasuriesUpdated: number;
    transactionsCount: number;
  } {
    // 1. Ensure all accounts in journal lines exist
    const existingAccountCodes = new Set(this.state.accounts.map((a) => a.code));
    let newAccountsCreated = 0;

    this.state.journalEntries.forEach((entry) => {
      (entry.lines || []).forEach((line) => {
        const code = String(line.account_code || "").trim();
        if (code && !existingAccountCodes.has(code)) {
          let type: Account["type"] = "asset";
          if (code.startsWith("1")) type = "asset";
          else if (code.startsWith("2")) type = "liability";
          else if (code.startsWith("3")) type = "equity";
          else if (code.startsWith("4")) type = "revenue";
          else if (code.startsWith("5") || code.startsWith("6")) type = "expense";

          let level = 3;
          if (code.length <= 1) level = 1;
          else if (code.length <= 3) level = 2;
          else if (code.length <= 5) level = 3;
          else level = 4;

          this.state.accounts.push({
            code,
            name_ar: line.description ? `حساب (${code}) - ${line.description}` : `حساب محاسبي (${code})`,
            type,
            level,
            balance: 0,
            initial_balance: 0,
            status: "active",
            currency: line.currency || entry.currency || "EGP",
            system_binding: "none",
          });
          existingAccountCodes.add(code);
          newAccountsCreated++;
        }
      });
    });

    // 2. Link unlinked journal entries to treasury transactions
    const existingTxRefs = new Set(
      (this.state.treasuryTransactions || []).map(
        (tx) => `${tx.related_entity_id || ""}_${tx.treasury_id}_${tx.amount}_${tx.type}`
      )
    );

    this.state.journalEntries.forEach((entry) => {
      (entry.lines || []).forEach((line, idx) => {
        const code = String(line.account_code || "").trim();
        const isTreasuryAccount =
          code.startsWith("1501") ||
          code.startsWith("1010") ||
          code.startsWith("1502") ||
          code.startsWith("1020") ||
          this.state.treasuries.some((t) => t.account_code === code);

        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        const amount = debit > 0 ? debit : credit;

        if (isTreasuryAccount && amount > 0) {
          const matchedTreasury = this.resolveTreasuryForAccount(
            code,
            line.currency || entry.currency,
            line.description || entry.description
          );

          if (matchedTreasury) {
            const otherLines = (entry.lines || []).filter((_, i) => i !== idx);
            const movementType = this.inferMovementTypeFromLine(
              line,
              entry.description,
              otherLines
            );
            const txKey = `${entry.id}_${matchedTreasury.id}_${amount}_${movementType}`;

            if (!existingTxRefs.has(txKey)) {
              const txId = `tx-sync-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
              const newTx: TreasuryTransaction = {
                id: txId,
                branch_id: matchedTreasury.branch_id || "branch-1",
                treasury_id: matchedTreasury.id,
                type: movementType,
                amount: amount,
                currency: line.currency || entry.currency || matchedTreasury.currency || "EGP",
                payment_method: matchedTreasury.type === "bank" ? "bank_transfer" : "cash",
                note: line.description || entry.description || `قيد رقم ${entry.reference || entry.id}`,
                related_entity_id: entry.id,
                created_at: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
              };

              this.state.treasuryTransactions.unshift(newTx);
              existingTxRefs.add(txKey);
            }
          }
        }
      });
    });

    // 3. Recalculate everything
    this.recalculateAccountBalances();
    this.saveState();

    this.logAction(
      "ADMIN",
      "دمج وتحديث البيانات المالية",
      `تم فحص ومطابقة شجرة الحسابات (${this.state.accounts.length} حساب) والقيود (${this.state.journalEntries.length} قيد) وتحديث كافة الخزائن والأرصدة.`,
      "UPDATE"
    );

    return {
      accountsCount: this.state.accounts.length,
      entriesCount: this.state.journalEntries.length,
      treasuriesUpdated: this.state.treasuries.length,
      transactionsCount: this.state.treasuryTransactions.length,
    };
  }

  getAccountLedgerEntries(accountCode: string) {
    const entries: {
      id: string;
      date: string;
      description: string;
      reference?: string;
      debit: number;
      credit: number;
      runningBalance: number;
      created_by: string;
    }[] = [];

    const acc = this.state.accounts.find((a) => a.code === accountCode);
    if (!acc) return { account: null, entries: [] };

    let currentBalance = acc.initial_balance || 0;

    const sortedEntries = [...this.state.journalEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    for (const je of sortedEntries) {
      for (const line of je.lines || []) {
        if (line.account_code === accountCode) {
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);

          if (acc.type === "asset" || acc.type === "expense") {
            currentBalance += debit - credit;
          } else {
            currentBalance += credit - debit;
          }

          entries.push({
            id: je.id,
            date: je.date,
            description: je.description,
            reference: je.reference,
            debit,
            credit,
            runningBalance: currentBalance,
            created_by: je.created_by,
          });
        }
      }
    }

    return { account: acc, entries };
  }

  getLineBaseValue(amount: number | string, rate: number | string): number {
    const val = Number(amount) || 0;
    const r = Number(rate) || 1;
    if (r <= 0) return val;
    return r > 1 ? val / r : val * r;
  }

  // Journal Entries with Double-Entry Verification
  addJournalEntry(
    description: string,
    lines: JournalLine[],
    reference?: string,
    currency: string = "EGP",
    date?: string,
    customId?: string,
  ) {
    if (this.state.isAccountingPeriodLocked) {
      console.warn("Accounting period is locked. Journal entry was not posted.");
      return;
    }

    // Verify debit == credit balance (taking line exchange rate into account)
    const totalDebit = lines.reduce(
      (sum, l) => sum + this.getLineBaseValue(l.debit, l.rate || 1),
      0,
    );
    const totalCredit = lines.reduce(
      (sum, l) => sum + this.getLineBaseValue(l.credit, l.rate || 1),
      0,
    );

    
    if (Math.abs(totalDebit - totalCredit) > 0.5) {
      console.error(
        `Double-entry balance mismatch error: Debit (Base): ${totalDebit}, Credit (Base): ${totalCredit}`,
      );
      if (!customId?.startsWith('ORACLE')) {
        return;
      } else {
        console.warn("Bypassing strict double-entry validation for legacy Oracle import.");
      }
    }


    const entryId =
      customId && customId.trim()
        ? customId.trim()
        : "je-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);

    const entry: JournalEntry = {
      id: entryId,
      branch_id: this.state.currentBranchId,
      date: date || new Date().toISOString().split("T")[0],
      description,
      lines,
      created_at: new Date().toISOString(),
      reference: reference || `REF-${Math.floor(Math.random() * 89999) + 10000}`,
      currency: currency || lines[0]?.currency || "EGP",
      created_by: this.state.currentUser,
      is_approved: true, // Auto post for restaurant fluid transactions
    };

    this.state.journalEntries.unshift(entry);

    // Update Ledger Balances
    lines.forEach((line) => {
      const acc = this.state.accounts.find((a) => a.code === line.account_code);
      if (acc) {
        const lineDebit = this.getLineBaseValue(line.debit, line.rate || 1);
        const lineCredit = this.getLineBaseValue(line.credit, line.rate || 1);
        if (acc.type === "asset" || acc.type === "expense") {
          acc.balance += lineDebit - lineCredit;
        } else {
          acc.balance += lineCredit - lineDebit;
        }
      }
    });

    this.saveState();
  }

  // Automatic Journal Postings for all requested events!
  postSalesInvoiceJournal(
    orderNumber: number,
    total: number,
    subtotal: number,
    tax: number,
    paymentMethod: string = "cash",
    branchId: string,
    currency: string = "EGP",
    treasuryId: string = "tr-1",
    containerId?: string,
  ) {
    let treasuryAccount = "101000"; // Main branch cash (Cashier)
    if (paymentMethod === "card") {
      treasuryAccount = "102000"; // Card / Network
    } else if (paymentMethod === "wallet") {
      treasuryAccount = "103000"; // Mobile Wallet
    }

    const lines: JournalLine[] = [
      // 1. Debit the treasury asset for the full invoice total
      { account_code: treasuryAccount, debit: total, credit: 0 },
      // 2. Credit sales revenue for subtotal
      { account_code: "401000", debit: 0, credit: subtotal },
      // 3. Credit Vat Tax Liability for tax
      { account_code: "202000", debit: 0, credit: tax },
    ];

    this.addJournalEntry(
      `فاتورة مبيعات POS - طلب رقم #${orderNumber}`,
      lines,
      `INV-${orderNumber}`,
    );

    // Update Cashier Treasury balance and log the transaction
    try {
      this.addTreasuryTransaction(
        treasuryId,
        "sales",
        total,
        currency,
        `إيرادات مبيعات المطعم - طلب رقم #${orderNumber}`,
        `INV-${orderNumber}`,
        paymentMethod,
        containerId,
      );
    } catch (err) {
      console.error("Error adding treasury transaction for order:", err);
    }
  }

  syncOperationalSalesWithTreasury(
    orders: any[],
    targetTreasuryId?: string,
  ): { syncedCount: number; totalAmountSynced: number; alreadySyncedCount: number } {
    let syncedCount = 0;
    let totalAmountSynced = 0;
    let alreadySyncedCount = 0;

    const trId =
      targetTreasuryId ||
      this.state.treasuries.find((t) => t.linked_to_restaurant && !t.deleted)?.id ||
      "tr-1";
    const targetTreasury = this.state.treasuries.find((t) => t.id === trId);

    if (!targetTreasury) {
      console.warn("Target cashier treasury not found for sync");
      return { syncedCount: 0, totalAmountSynced: 0, alreadySyncedCount: 0 };
    }

    const validOrders = (orders || []).filter(
      (o) => o && o.order_number && o.status !== "cancelled",
    );

    for (const order of validOrders) {
      const orderRef = `INV-${order.order_number}`;
      const existingTx = this.state.treasuryTransactions.find(
        (tx) => tx.related_entity_id === orderRef,
      );

      if (existingTx) {
        alreadySyncedCount++;
        continue;
      }

      let orderCurrency = "EGP";
      if (order.currency) {
        orderCurrency = order.currency;
      } else if (order.notes) {
        const match = String(order.notes).match(/العملة:\s*([A-Za-z]+)/);
        if (match && match[1]) orderCurrency = match[1];
      }

      const totalAmt = Number(order.total || 0);
      const subtotalAmt = Number(order.subtotal || totalAmt);
      const taxAmt = Number(order.tax || 0);
      const paymentMethod = order.payment_method || "cash";

      let containerId = "";
      if (targetTreasury.containers && targetTreasury.containers.length > 0) {
        const matchedCnt =
          targetTreasury.containers.find(
            (c) =>
              c.currency === orderCurrency &&
              ((paymentMethod === "cash" && c.id.includes("cash")) ||
                (paymentMethod === "card" && c.id.includes("card")) ||
                (paymentMethod === "wallet" && c.id.includes("wallet"))),
          ) || targetTreasury.containers.find((c) => c.currency === orderCurrency);
        if (matchedCnt) {
          containerId = matchedCnt.id;
        }
      }

      try {
        this.postSalesInvoiceJournal(
          order.order_number,
          totalAmt,
          subtotalAmt,
          taxAmt,
          paymentMethod,
          this.state.currentBranchId || "BR-001",
          orderCurrency,
          trId,
          containerId,
        );
        syncedCount++;
        totalAmountSynced += totalAmt;
      } catch (err) {
        console.error(`Error syncing order #${order.order_number}:`, err);
      }
    }

    if (syncedCount > 0) {
      this.recalculateAccountBalances();
      this.saveState();
      this.logAction(
        "CASHIER",
        "مزامنة مبيعات اليوم التشغيلية",
        `تمت مزامنة ${syncedCount} طلب مبيعات بقيمة إجمالية ${totalAmountSynced.toLocaleString()} مع خزينة الكاشير (${targetTreasury.name_ar})`,
        "TRANSACTION",
      );
    }

    return { syncedCount, totalAmountSynced, alreadySyncedCount };
  }

  postSalesReturnJournal(
    orderNumber: number,
    total: number,
    paymentMethod: string = "cash",
    branchId: string,
    currency: string = "EGP",
    treasuryId: string = "tr-1",
    containerId?: string,
  ) {
    let treasuryAccount = "101000";
    if (paymentMethod === "card") {
      treasuryAccount = "102000";
    } else if (paymentMethod === "wallet") {
      treasuryAccount = "103000";
    }

    const lines: JournalLine[] = [
      // Debit Sales Revenue (Reducing revenue)
      { account_code: "401000", debit: total, credit: 0 },
      // Credit Treasury asset (Refunding customer)
      { account_code: treasuryAccount, debit: 0, credit: total },
    ];

    this.addJournalEntry(`مرتجع مبيعات POS - طلب رقم #${orderNumber}`, lines, `SRT-${orderNumber}`);

    try {
      this.addTreasuryTransaction(
        treasuryId,
        "withdrawal",
        total,
        currency,
        `مرتجع مبيعات المطعم - طلب رقم #${orderNumber}`,
        `SRT-${orderNumber}`,
        paymentMethod,
        containerId,
      );
    } catch (err) {
      console.error("Error adding treasury transaction for refund:", err);
    }
  }

  postPurchaseInvoiceJournal(poId: string, supplierId: string, total: number, branchId: string) {
    const lines: JournalLine[] = [
      // Debit Raw Materials Inventory (Increasing asset)
      { account_code: "103000", debit: total, credit: 0 },
      // Credit Supplier Liability (Increasing credit debt)
      { account_code: "201000", debit: 0, credit: total },
    ];

    this.addJournalEntry(
      `فاتورة مشتريات للمورد - أمر شراء #${poId.substring(3, 8)}`,
      lines,
      `PO-${poId.substring(3, 8).toUpperCase()}`,
    );
  }

  postPurchaseReturnJournal(poId: string, amount: number, branchId: string) {
    const lines: JournalLine[] = [
      // Debit Supplier Liability (Reducing debt to supplier)
      { account_code: "201000", debit: amount, credit: 0 },
      // Credit Raw Materials Inventory Asset (Reducing stock)
      { account_code: "103000", debit: 0, credit: amount },
    ];

    this.addJournalEntry(
      `مرتجع بضائع مشتريات للمورد - أمر شراء #${poId.substring(3, 8)}`,
      lines,
      `PRT-${poId.substring(3, 8).toUpperCase()}`,
    );
  }

  postExpenseJournal(
    voucherId: string,
    amount: number,
    accountCode: string,
    costCenter: string,
    branchId: string,
  ) {
    const treasuryAccount = branchId === "branch-2" ? "101001" : "101000";

    const lines: JournalLine[] = [
      // Debit Expense Account
      { account_code: accountCode, debit: amount, credit: 0, cost_center: costCenter },
      // Credit Treasury Cash Asset
      { account_code: treasuryAccount, debit: 0, credit: amount },
    ];

    this.addJournalEntry(
      `سند صرف مصروفات - رقم #${voucherId.substring(4, 9)}`,
      lines,
      `EXP-${voucherId.substring(4, 9).toUpperCase()}`,
    );
  }

  postRevenueJournal(
    voucherId: string,
    amount: number,
    accountCode: string,
    costCenter: string,
    branchId: string,
  ) {
    const treasuryAccount = branchId === "branch-2" ? "101001" : "101000";

    const lines: JournalLine[] = [
      // Debit Treasury Cash Asset
      { account_code: treasuryAccount, debit: amount, credit: 0 },
      // Credit Revenue Account
      { account_code: accountCode, debit: 0, credit: amount, cost_center: costCenter },
    ];

    this.addJournalEntry(
      `سند قبض إيرادات متنوعة - رقم #${voucherId.substring(4, 9)}`,
      lines,
      `REV-${voucherId.substring(4, 9).toUpperCase()}`,
    );
  }

  postTreasuryTransferJournal(
    fromTreasuryId: string,
    toTreasuryId: string,
    amount: number,
    branchId: string,
  ) {
    const fromT = this.state.treasuries.find((t) => t.id === fromTreasuryId);
    const toT = this.state.treasuries.find((t) => t.id === toTreasuryId);

    if (!fromT || !toT) return;

    const fromAcc =
      fromT.type === "bank" ? "102000" : fromT.branch_id === "branch-2" ? "101001" : "101000";
    const toAcc =
      toT.type === "bank" ? "102000" : toT.branch_id === "branch-2" ? "101001" : "101000";

    const lines: JournalLine[] = [
      // Debit Destination Treasury
      { account_code: toAcc, debit: amount, credit: 0 },
      // Credit Source Treasury
      { account_code: fromAcc, debit: 0, credit: amount },
    ];

    this.addJournalEntry(
      `حركة تحويل مالي بين الخزائن - من ${fromT.name_ar} إلى ${toT.name_ar}`,
      lines,
      `TRF-${Math.floor(Math.random() * 8999) + 1000}`,
    );
  }

  postCashDepositJournal(treasuryId: string, amount: number, branchId: string) {
    const targetAcc = branchId === "branch-2" ? "101001" : "101000";

    const lines: JournalLine[] = [
      // Debit Cash Treasury Account
      { account_code: targetAcc, debit: amount, credit: 0 },
      // Credit Partners Capital
      { account_code: "301000", debit: 0, credit: amount },
    ];

    this.addJournalEntry(
      `إيداع تمويل مالي مباشر بالخزينة`,
      lines,
      `DEP-${Math.floor(Math.random() * 8999) + 1000}`,
    );
  }

  postCashWithdrawalJournal(treasuryId: string, amount: number, branchId: string) {
    const targetAcc = branchId === "branch-2" ? "101001" : "101000";

    const lines: JournalLine[] = [
      // Debit Partners Capital (Drawings)
      { account_code: "301000", debit: amount, credit: 0 },
      // Credit Cash Treasury Account
      { account_code: targetAcc, debit: 0, credit: amount },
    ];

    this.addJournalEntry(
      `سحب نقدي مباشر تمويلي من الخزينة`,
      lines,
      `WDL-${Math.floor(Math.random() * 8999) + 1000}`,
    );
  }

  postInventoryAdjustmentJournal(docNumber: string, amount: number, branchId: string) {
    const lines: JournalLine[] = [
      // Debit Inventory Hadr/Loss expense (506000)
      { account_code: "506000", debit: Math.abs(amount), credit: 0 },
      // Credit Raw Materials Inventory Asset (103000)
      { account_code: "103000", debit: 0, credit: Math.abs(amount) },
    ];

    this.addJournalEntry(
      `تسوية جرد مخزني - هدر وخسائر - مستند #${docNumber}`,
      lines,
      `ADJ-${docNumber.substring(4)}`,
    );
  }

  postInventoryConsumptionJournal(orderNumber: number, totalCost: number, branchId: string) {
    const lines: JournalLine[] = [
      // Debit Cost of Goods Sold (COGS)
      { account_code: "501000", debit: totalCost, credit: 0 },
      // Credit Raw Materials Inventory asset
      { account_code: "103000", debit: 0, credit: totalCost },
    ];

    this.addJournalEntry(
      `قيد استهلاك بوم المطبخ (Recipe Consumption) - طلب #${orderNumber}`,
      lines,
      `CON-${orderNumber}`,
    );
  }

  // --- Purchase Actions ---
  createPurchaseOrder(supplierId: string, items: PurchaseOrder["items"], notes?: string) {
    let subtotal = 0;
    items.forEach((i) => {
      subtotal += i.quantity * i.unit_cost;
    });
    const tax = subtotal * 0.14;
    const total = subtotal + tax;

    const po: PurchaseOrder = {
      id: "po-" + Date.now(),
      branch_id: this.state.currentBranchId,
      supplier_id: supplierId,
      order_date: new Date().toISOString().split("T")[0],
      status: "draft",
      items,
      subtotal,
      tax,
      total,
      notes,
    };

    this.state.purchaseOrders.unshift(po);
    this.saveState();
    this.logAction(
      "ADMIN",
      "إنشاء أمر شراء",
      `تم عمل مسودة أمر شراء بمجموع ${total} ج.م`,
      "CREATE",
    );
    return po;
  }

  receivePurchaseOrder(poId: string, treasuryId: string) {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === "received") return;

    po.status = "received";

    // Deduct/Pay from Treasury
    const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
    if (treasury) {
      this.addTreasuryTransaction(
        treasuryId,
        "purchase",
        po.total,
        treasury.currency,
        `شراء بضاعة - أمر شراء #${po.id.substring(3, 8)}`,
        po.id,
      );
    }

    // Update Supplier ledger balance
    this.updateSupplierBalance(po.supplier_id, po.total);

    // Auto post Purchase Invoice Journal
    this.postPurchaseInvoiceJournal(po.id, po.supplier_id, po.total, this.state.currentBranchId);

    this.logAction(
      "ADMIN",
      "استلام أمر شراء ودفع القيمة",
      `تم تسليم الطلبية #${poId.substring(3, 8)} وإجراء القيد المحاسبي`,
      "TRANSACTION",
    );
    this.saveState();
  }

  receivePurchaseOrderPartial(
    poId: string,
    receivedItems: { inventory_id: string; received_quantity: number }[],
    treasuryId: string,
  ): { receivedTotal: number; isFullyReceived: boolean } {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error("أمر الشراء غير موجود");

    let newlyReceivedTotal = 0;
    let isFullyReceived = true;

    po.items = po.items.map((item) => {
      const match = receivedItems.find((r) => r.inventory_id === item.inventory_id);
      const currentReceived = item.received_quantity || 0;
      const newlyReceived = match ? match.received_quantity : 0;

      const updatedReceived = currentReceived + newlyReceived;
      if (updatedReceived < item.quantity) {
        isFullyReceived = false;
      }

      newlyReceivedTotal += newlyReceived * item.unit_cost;

      return {
        ...item,
        received_quantity: updatedReceived,
      };
    });

    const newlyReceivedTax = newlyReceivedTotal * 0.14;
    const grandReceivedTotal = newlyReceivedTotal + newlyReceivedTax;

    if (isFullyReceived) {
      po.status = "received";
    }

    // Deduct/Pay from Treasury for the newly received batch
    const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
    if (treasury && grandReceivedTotal > 0) {
      this.addTreasuryTransaction(
        treasuryId,
        "purchase",
        grandReceivedTotal,
        treasury.currency,
        `استلام جزئي/كامل بضائع - أمر شراء #${po.id.substring(3, 8)}`,
        po.id,
      );
    }

    // Update Supplier ledger balance
    this.updateSupplierBalance(po.supplier_id, grandReceivedTotal);

    // Auto post Purchase Invoice Journal for received amount
    if (grandReceivedTotal > 0) {
      this.postPurchaseInvoiceJournal(
        po.id,
        po.supplier_id,
        grandReceivedTotal,
        this.state.currentBranchId,
      );
    }

    this.logAction(
      "ADMIN",
      "استلام بضائع أمر شراء",
      `تم استلام بضائع من الأمر #${po.id.substring(3, 8)} بقيمة ${grandReceivedTotal.toFixed(2)} ج.م (مكتمل: ${isFullyReceived ? "نعم" : "لا"})`,
      "TRANSACTION",
    );

    this.saveState();

    return { receivedTotal: grandReceivedTotal, isFullyReceived };
  }

  returnPurchaseOrderItems(
    poId: string,
    returnedItems: { inventory_id: string; returned_quantity: number }[],
  ): number {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error("أمر الشراء غير موجود");

    let returnedTotal = 0;

    po.items = po.items.map((item) => {
      const match = returnedItems.find((r) => r.inventory_id === item.inventory_id);
      const currentReturned = item.returned_quantity || 0;
      const newlyReturned = match ? match.returned_quantity : 0;

      const updatedReturned = currentReturned + newlyReturned;
      returnedTotal += newlyReturned * item.unit_cost;

      return {
        ...item,
        returned_quantity: updatedReturned,
      };
    });

    const returnedTax = returnedTotal * 0.14;
    const grandReturnedTotal = returnedTotal + returnedTax;

    po.status = "returned";

    // Deduct from supplier balance (credit note)
    this.updateSupplierBalance(po.supplier_id, -grandReturnedTotal);

    // Post credit return journal
    this.postPurchaseReturnJournal(po.id, grandReturnedTotal, this.state.currentBranchId);

    this.logAction(
      "ADMIN",
      "إرجاع بضائع للمورد",
      `تم إرجاع مرتجعات من الأمر #${po.id.substring(3, 8)} بقيمة ${grandReturnedTotal.toFixed(2)} ج.م خصماً من حساب المورد`,
      "TRANSACTION",
    );

    this.saveState();

    return grandReturnedTotal;
  }

  cancelPurchaseOrder(poId: string): boolean {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === "cancelled") return false;

    const oldStatus = po.status;
    po.status = "cancelled";

    // If it was previously received, we need to reverse the treasury, supplier and journal entries!
    if (oldStatus === "received") {
      // Find treasury transaction
      const tx = this.state.treasuryTransactions.find(
        (t) => t.related_entity_id === poId && t.type === "purchase",
      );
      if (tx) {
        // Reverse treasury payment
        const treasury = this.state.treasuries.find((t) => t.id === tx.treasury_id);
        if (treasury) {
          treasury.balance += tx.amount;
          treasury.available_balance = treasury.balance;
          this.logAction(
            "SYSTEM",
            "عكس حركة الخزينة",
            `استرجاع مبلغ ${tx.amount} ج.م إلى خزينة ${treasury.name_ar}`,
            "TRANSACTION",
          );
        }
      }

      // Reverse Supplier balance
      this.updateSupplierBalance(po.supplier_id, -po.total);

      // Post reversing journal entry
      const lines: JournalLine[] = [
        { account_code: "103000", debit: 0, credit: po.total },
        { account_code: "201000", debit: po.total, credit: 0 },
      ];
      this.addJournalEntry(
        `إلغاء وعكس قيد أمر شراء #${poId.substring(3, 8)}`,
        lines,
        `REV-${poId.substring(3, 8).toUpperCase()}`,
      );
    }

    this.saveState();
    this.logAction(
      "ADMIN",
      "إلغاء أمر الشراء",
      `تم إلغاء أمر الشراء #${poId.substring(3, 8)} بالكامل وتصفية القيود المرتبطة`,
      "TRANSACTION",
    );
    return true;
  }

  // --- Vouchers with Cost Center & Soft Delete ---
  createVoucher(
    type: Voucher["type"],
    category: string,
    amount: number,
    treasuryId: string,
    description: string,
    costCenter = "الإدارة (Administration)",
    attachment?: string,
  ) {
    const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
    const voucher: Voucher = {
      id: "vch-" + Date.now(),
      branch_id: this.state.currentBranchId,
      type,
      category,
      amount,
      currency: treasury?.currency || "EGP",
      payment_method: treasury?.type || "cash",
      treasury_id: treasuryId,
      description,
      status: "approved",
      created_at: new Date().toISOString(),
      cost_center: costCenter,
      attachment,
      deleted: false,
    };

    this.state.vouchers.unshift(voucher);
    this.saveState();

    // Deduct or add to treasury
    if (treasury) {
      const txType = type === "receipt" ? "deposit" : "withdrawal";
      this.addTreasuryTransaction(
        treasuryId,
        txType,
        amount,
        treasury.currency,
        `${type === "receipt" ? "سند قبض" : "سند صرف"} (${category}) - ${description}`,
        voucher.id,
      );

      // Post cost-center specific double-entry journal lines
      const accountMap: Record<string, string> = {
        "رواتب الموظفين": "502000",
        "إيجار الفروع": "503000",
        "الكهرباء والمياه والطاقة": "504000",
        "التسويق والإعلانات": "505000",
        "الهدر والمفقودات": "506000",
      };
      const accountCode = accountMap[category] || "600000"; // default operating expense

      if (type === "payment") {
        this.postExpenseJournal(
          voucher.id,
          amount,
          accountCode,
          costCenter,
          this.state.currentBranchId,
        );
      } else {
        this.postRevenueJournal(
          voucher.id,
          amount,
          "401000",
          costCenter,
          this.state.currentBranchId,
        );
      }
    }

    this.logAction(
      "ADMIN",
      "إنشاء سند مالي",
      `تم تسجيل ${type === "receipt" ? "سند قبض" : "سند صرف"} فئة ${category} بمبلغ ${amount} ج.م بمركز تكلفة ${costCenter}`,
      "CREATE",
    );
    return voucher;
  }

  deleteVoucher(id: string) {
    const vch = this.state.vouchers.find((v) => v.id === id);
    if (vch) {
      vch.deleted = true;
      this.saveState();
      this.logAction(
        "ADMIN",
        "حذف سند مالي (حذف مؤقت)",
        `تم حذف السند المالي #${id} مؤقتاً`,
        "DELETE",
      );
    }
  }

  // Batch / Expiry Tracking
  addExpiryBatch(
    inventoryId: string,
    batchNo: string,
    qty: number,
    expiryDate: string,
    warehouseId?: string,
    storageCondition?: string,
  ) {
    this.state.inventoryExpiry.push({
      id: "exp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      inventory_id: inventoryId,
      branch_id: this.state.currentBranchId,
      warehouse_id: warehouseId || "wh-main-default",
      storage_condition: storageCondition || "chilled_4c",
      batch_no: batchNo,
      quantity: qty,
      expiry_date: expiryDate,
      created_at: new Date().toISOString(),
    });
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة دفعة تاريخ صلاحية",
      `إضافة الدفعة ${batchNo} للكمية ${qty} صالحة حتى ${expiryDate}`,
      "CREATE",
    );
  }

  async disposeExpiryBatch(batchId: string, reason: string) {
    const idx = this.state.inventoryExpiry.findIndex((b) => b.id === batchId);
    if (idx !== -1) {
      const batch = this.state.inventoryExpiry[idx];

      // Calculate wasted value
      const items = localWarehouseStore.getInventory();
      const item = items.find((i) => i.id === batch.inventory_id);
      const cost = item ? Number(item.cost || 0) : 0;
      const qty = Number(batch.quantity || 0);
      const batchValue = qty * cost;

      this.state.totalDisposedExpiryValue = (this.state.totalDisposedExpiryValue || 0) + batchValue;

      // 1. Deduct quantity from inventory stock and log transaction movement
      if (batch.inventory_id && qty > 0) {
        try {
          await inventoryService.addTransaction({
            inventory_id: batch.inventory_id,
            warehouse_id: batch.warehouse_id || "wh-main-default",
            type: "out",
            quantity: qty,
            note: `إعدام وهدر دفعة رقم ${batch.batch_no} - السبب: ${reason}`,
          });
        } catch (err) {
          console.error("Failed to add inventory transaction for batch disposal:", err);
          localWarehouseStore.addTransaction({
            inventory_id: batch.inventory_id,
            warehouse_id: batch.warehouse_id || "wh-main-default",
            type: "out",
            quantity: qty,
            note: `إعدام وهدر دفعة رقم ${batch.batch_no} - السبب: ${reason}`,
          });
        }
      }

      // 2. Post automatic General Ledger journal entry for waste/write-off (حسابات الأستاذ العامة)
      if (batchValue > 0) {
        this.postInventoryAdjustmentJournal(
          batch.batch_no || batch.id.slice(0, 8),
          batchValue,
          this.state.currentBranchId,
        );
      }

      this.state.inventoryExpiry.splice(idx, 1);
      this.saveState();
      this.logAction(
        "ADMIN",
        "إعدام دفعة منتهية الصلاحية",
        `تم إعدام الدفعة ${batch.batch_no} بالكمية ${batch.quantity} (بقيمة ${batchValue} ج.م) بسبب: ${reason}، وتم الخصم من المخزن وإنشاء قيد المحاسبي تلقائياً`,
        "DELETE",
      );
    }
  }

  getMenuItemQualitySpecs(menuItemId: string): MenuItemQualitySpecs {
    if (!this.state.menuQualitySpecs) {
      this.state.menuQualitySpecs = {};
    }
    if (!this.state.menuQualitySpecs[menuItemId]) {
      this.state.menuQualitySpecs[menuItemId] = {
        menu_item_id: menuItemId,
        shelf_life_hours: 24,
        storage_condition: "chilled_4c",
        storage_condition_label: "ثلاجة مبردة (4°م)",
        prep_instructions:
          "يتم التحضير والتسخين وفق معايير النظافة والطهي الآمن على درجة حرارة 75°م على الأقل.",
        allergens: ["جلوتين", "ألبان"],
        quality_checklist: [
          "فحص الرائحة والقوام قبل التقديم",
          "التأكد من سلامة التغليف وتاريخ التجهيز",
          "قياس درجة الحرارة عند الحفظ (أقل من 5°م للمبرد)",
        ],
        max_display_hours: 4,
      };
    }
    return this.state.menuQualitySpecs[menuItemId];
  }

  saveMenuItemQualitySpecs(menuItemId: string, specs: Partial<MenuItemQualitySpecs>) {
    if (!this.state.menuQualitySpecs) {
      this.state.menuQualitySpecs = {};
    }
    const current = this.getMenuItemQualitySpecs(menuItemId);
    this.state.menuQualitySpecs[menuItemId] = {
      ...current,
      ...specs,
    };
    this.saveState();
    this.logAction(
      "ADMIN",
      "تحديث معايير جودة وصلاحية الوجبة",
      `تم تحديث مواصفات جودة وصلاحية الوجبة #${menuItemId}`,
      "UPDATE",
    );
  }

  setPeriodLock(isLocked: boolean) {
    this.state.isAccountingPeriodLocked = isLocked;
    this.saveState();
    this.logAction(
      "ADMIN",
      isLocked ? "إغلاق الفترة المحاسبية" : "فتح الفترة المحاسبية",
      "تم تحديث قفل الفترة المحاسبية لمنع تعديل القيود التاريخية",
      "SYSTEM",
    );
  }

  setFiscalYearStatus(status: "open" | "closed") {
    this.state.fiscalYearStatus = status;
    this.saveState();
    this.logAction(
      "ADMIN",
      status === "closed" ? "إغلاق السنة المالية" : "فتح السنة المالية الجديدة",
      `تم تحديث حالة السنة المالية الحالية إلى ${status === "closed" ? "مغلقة" : "مفتوحة"}`,
      "SYSTEM",
    );
  }

  // --- Extended Inventory Methods ---
  getExtendedItem(
    itemId: string,
    defaultVals?: Partial<ExtendedInventoryItem>,
  ): ExtendedInventoryItem {
    if (!this.state.extendedInventoryItems) {
      this.state.extendedInventoryItems = {};
    }
    if (!this.state.extendedInventoryItems[itemId]) {
      const generatedCode = "INV-" + itemId.substring(0, 5).toUpperCase();
      const generatedBarcode =
        "622" +
        Math.abs(itemId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0))
          .toString()
          .padEnd(10, "0")
          .substring(0, 10);
      this.state.extendedInventoryItems[itemId] = {
        id: itemId,
        item_code: generatedCode,
        barcode: generatedBarcode,
        name_en: "Raw Material Item",
        category: "خامات ومواد أولية",
        preferred_supplier_id: "sup-1",
        average_cost: 0,
        last_purchase_price: 0,
        status: "active",
        ...defaultVals,
      };
      this.saveState();
    }
    return this.state.extendedInventoryItems[itemId];
  }

  saveExtendedItem(itemId: string, details: Partial<ExtendedInventoryItem>) {
    if (!this.state.extendedInventoryItems) {
      this.state.extendedInventoryItems = {};
    }
    const old = { ...this.getExtendedItem(itemId) };
    this.state.extendedInventoryItems[itemId] = {
      ...this.getExtendedItem(itemId),
      ...details,
    };
    this.saveState();

    const changes: string[] = [];
    Object.keys(details).forEach((key) => {
      const valOld = (old as any)[key];
      const valNew = (details as any)[key];
      if (valOld !== valNew) {
        changes.push(`[${key}]: ${valOld} -> ${valNew}`);
      }
    });

    if (changes.length > 0) {
      this.logAction(
        "ADMIN",
        "تعديل تفاصيل الصنف المتقدمة",
        `تم تعديل الصنف #${itemId.substring(0, 5)}: ${changes.join(", ")}`,
        "UPDATE",
      );
    }
  }

  getExtendedItems(): Record<string, ExtendedInventoryItem> {
    return this.state.extendedInventoryItems || {};
  }

  // --- Inventory Transactions Documents ---
  addInventoryDocument(
    doc: Omit<InventoryDocument, "id" | "doc_number" | "created_at">,
  ): InventoryDocument {
    if (!this.state.inventoryDocuments) {
      this.state.inventoryDocuments = [];
    }

    const docCount = this.state.inventoryDocuments.length + 1;
    const docNumber = `DOC-2026-${String(docCount).padStart(4, "0")}`;
    const newDoc: InventoryDocument = {
      ...doc,
      id: "doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      doc_number: docNumber,
      created_at: new Date().toISOString(),
    };

    this.state.inventoryDocuments.unshift(newDoc);
    this.saveState();

    this.logAction(
      "ADMIN",
      `إنشاء مستند مخزني: ${doc.type}`,
      `تم تسجيل مستند ${doc.type} برقم ${docNumber} ويحتوي على ${doc.items.length} أصناف`,
      "CREATE",
    );

    // Auto post journal entry if stock is adjusted
    if (doc.type === "stock_adjustment") {
      let adjustmentVal = 0;
      doc.items.forEach((it) => {
        const diff = (it.counted_quantity ?? 0) - it.quantity;
        adjustmentVal += diff * it.unit_cost;
      });

      if (Math.abs(adjustmentVal) > 0) {
        this.postInventoryAdjustmentJournal(docNumber, adjustmentVal, doc.branch_id);
      }
    }

    return newDoc;
  }

  cancelInventoryDocument(docId: string): boolean {
    if (!this.state.inventoryDocuments) return false;
    const doc = this.state.inventoryDocuments.find((d) => d.id === docId);
    if (!doc || doc.status === "cancelled") return false;

    doc.status = "cancelled";
    this.saveState();

    this.logAction(
      "ADMIN",
      "إلغاء مستند مخزني",
      `تم إلغاء المستند المخزني رقم ${doc.doc_number} بنجاح`,
      "UPDATE",
    );

    return true;
  }

  saveInventorySettings(settings: InventorySettings) {
    this.state.inventorySettings = settings;
    this.saveState();
    this.logAction(
      "ADMIN",
      "تحديث إعدادات المخزن",
      `تم تحديث إعدادات المخزن: السماح بالبيع بالسالب (${settings.allowNegativeStock})`,
      "UPDATE",
    );
  }

  // --- HR Methods ---
  addEmployee(emp: Omit<Employee, "id">) {
    const newEmp: Employee = {
      ...emp,
      id: "emp-" + Date.now(),
    };
    if (!this.state.employees) this.state.employees = [];
    this.state.employees.push(newEmp);
    this.saveState();
    this.logAction("HR", "إضافة موظف جديد", `تم تسجيل الموظف: ${emp.name}`, "CREATE");
    return newEmp;
  }

  updateEmployee(id: string, payload: Partial<Employee>) {
    if (!this.state.employees) this.state.employees = [];
    const emp = this.state.employees.find((e) => e.id === id);
    if (emp) {
      Object.assign(emp, payload);
      this.saveState();
      this.logAction("HR", "تعديل بيانات موظف", `تم تعديل الموظف: ${emp.name}`, "UPDATE");
    }
  }

  deleteEmployee(id: string) {
    if (!this.state.employees) this.state.employees = [];
    const index = this.state.employees.findIndex((e) => e.id === id);
    if (index !== -1) {
      const emp = this.state.employees[index];
      this.state.employees.splice(index, 1);
      this.saveState();
      this.logAction("HR", "حذف موظف", `تم حذف الموظف: ${emp.name}`, "DELETE");
    }
  }

  recordAttendance(
    employeeId: string,
    date: string,
    status: AttendanceRecord["status"],
    checkIn?: string,
    checkOut?: string,
    notes?: string,
  ) {
    if (!this.state.attendance) this.state.attendance = [];
    // Remove if already exists for this employee and date to avoid duplicates
    this.state.attendance = this.state.attendance.filter(
      (r) => !(r.employee_id === employeeId && r.date === date),
    );
    const record: AttendanceRecord = {
      id: "att-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      employee_id: employeeId,
      date,
      status,
      check_in: checkIn,
      check_out: checkOut,
      notes,
    };
    this.state.attendance.push(record);
    this.saveState();
  }

  addLoan(
    employeeId: string,
    amount: number,
    currency: string,
    repaymentMonths: number,
    notes?: string,
  ) {
    if (!this.state.loans) this.state.loans = [];
    const loan: EmployeeLoan = {
      id: "loan-" + Date.now(),
      employee_id: employeeId,
      amount,
      date: new Date().toISOString().split("T")[0],
      currency,
      repayment_months: repaymentMonths,
      paid_amount: 0,
      status: "active",
      notes,
    };
    this.state.loans.push(loan);
    this.saveState();

    // Find employee name
    const emp = this.state.employees?.find((e) => e.id === employeeId);
    this.logAction(
      "HR",
      "طلب سلفة موظف",
      `تم تسجيل سلفة للموظف ${emp?.name || ""} بقيمة ${amount} ${currency}`,
      "CREATE",
    );
    return loan;
  }

  repayLoan(loanId: string, amount: number) {
    if (!this.state.loans) this.state.loans = [];
    const loan = this.state.loans.find((l) => l.id === loanId);
    if (loan) {
      loan.paid_amount += amount;
      if (loan.paid_amount >= loan.amount) {
        loan.status = "paid";
      }
      this.saveState();
    }
  }

  generatePayroll(month: string) {
    if (!this.state.payrolls) this.state.payrolls = [];
    if (!this.state.employees) this.state.employees = [];
    if (!this.state.loans) this.state.loans = [];
    if (!this.state.attendance) this.state.attendance = [];

    // Filter out already generated for this month
    this.state.payrolls = this.state.payrolls.filter(
      (p) => p.month !== month || p.status === "paid",
    );

    const activeEmployees = this.state.employees.filter((e) => e.status === "active");

    activeEmployees.forEach((emp) => {
      // Check if already paid
      const existsPaid = this.state.payrolls?.some(
        (p) => p.employee_id === emp.id && p.month === month && p.status === "paid",
      );
      if (existsPaid) return;

      // Calculate attendance deductions if any
      const empAttendance =
        this.state.attendance?.filter(
          (r) => r.employee_id === emp.id && r.date.startsWith(month),
        ) || [];
      const absentDays = empAttendance.filter((r) => r.status === "absent").length;
      const lateDays = empAttendance.filter((r) => r.status === "late").length;

      const dailyRate = emp.salary / 30;
      const deductions = Math.round(absentDays * dailyRate + lateDays * dailyRate * 0.25);

      // Calculate loan deduction
      const activeLoan = this.state.loans?.find(
        (l) => l.employee_id === emp.id && l.status === "active" && l.currency === emp.currency,
      );
      let loanDeduction = 0;
      if (activeLoan) {
        const monthlyInstallment = activeLoan.amount / activeLoan.repayment_months;
        const remainingLoan = activeLoan.amount - activeLoan.paid_amount;
        loanDeduction = Math.round(Math.min(monthlyInstallment, remainingLoan));
      }

      const netSalary = Math.max(0, emp.salary - deductions - loanDeduction);

      const record: PayrollRecord = {
        id: "pay-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        employee_id: emp.id,
        month,
        basic_salary: emp.salary,
        currency: emp.currency,
        bonuses: 0,
        deductions,
        loan_deduction: loanDeduction,
        net_salary: netSalary,
        status: "draft",
      };

      this.state.payrolls?.push(record);
    });

    this.saveState();
  }

  paySalary(payrollId: string, treasuryId: string) {
    if (!this.state.payrolls) return;
    const record = this.state.payrolls.find((p) => p.id === payrollId);
    if (!record || record.status === "paid") return;

    const emp = this.state.employees?.find((e) => e.id === record.employee_id);
    if (!emp) return;

    // Record Treasury Transaction
    this.addTreasuryTransaction(
      treasuryId,
      "withdrawal",
      record.net_salary,
      record.currency,
      `صرف راتب شهر ${record.month} للموظف ${emp.name}`,
      `PAY-${record.id.substring(4, 9).toUpperCase()}`,
    );

    // If there was a loan deduction, record repayment
    if (record.loan_deduction > 0 && this.state.loans) {
      const activeLoan = this.state.loans.find(
        (l) => l.employee_id === emp.id && l.status === "active" && l.currency === record.currency,
      );
      if (activeLoan) {
        this.repayLoan(activeLoan.id, record.loan_deduction);
      }
    }

    record.status = "paid";
    record.payment_date = new Date().toISOString().split("T")[0];
    record.payment_treasury_id = treasuryId;

    this.saveState();
    this.logAction(
      "HR",
      "صرف راتب موظف",
      `تم صرف راتب الموظف ${emp.name} بقيمة ${record.net_salary} ${record.currency}`,
      "TRANSACTION",
    );
  }

  importOracleBatchData(newAccounts: Account[], newJournalEntries: any[]) {
    // Replace old accounts entirely with Oracle imported accounts
    this.state.accounts = newAccounts.map((acc) => ({
      ...acc,
      balance: acc.initial_balance || 0,
    }));

    // Update treasuries account codes based on uploaded Oracle chart of accounts matching names
    if (this.state.treasuries && this.state.treasuries.length > 0) {
      this.state.treasuries = this.state.treasuries.map((tr) => {
        const matchedAcc = newAccounts.find(
          (acc) =>
            acc.name_ar.includes(tr.name_ar) ||
            tr.name_ar.includes(acc.name_ar) ||
            acc.name_ar.includes("خزينة") ||
            acc.name_ar.includes("صندوق") ||
            acc.name_ar.includes("ارض المول"),
        );
        return {
          ...tr,
          account_code: matchedAcc ? matchedAcc.code : tr.account_code || "101000",
        };
      });
    }

    // Add journal entries / transactions
    if (newJournalEntries && newJournalEntries.length > 0) {
      this.state.journalEntries = [...newJournalEntries, ...(this.state.journalEntries || [])];
    }

    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "استيراد بيانات أوراكل الشاملة",
      `تم استيراد ${newAccounts.length} حساب من أوراكل (عبر المستويات الأربعة) وحذف الحسابات القديمة، مع الاحتفاظ بالخزائن ومطابقة أكوادها حسب شجرة الحسابات المرسلة، واستيراد ${newJournalEntries.length} قيد وحركة مالية بنجاح.`,
      "IMPORT",
    );
  }

  addMallShop(shop: Omit<MallShop, "id">) {
    const newShop: MallShop = {
      ...shop,
      id: "shop-" + Date.now(),
    };
    this.state.mallShops = [...(this.state.mallShops || []), newShop];
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة محلات المول",
      `تم إضافة المحل ${newShop.name_ar} (رقم ${newShop.shop_number}) بنجاح`,
      "CREATE",
    );
  }

  createMallContract(shopId: string, updates: Partial<MallShop>, treasuryId?: string) {
    this.updateMallShop(shopId, updates);
    const contract = updates.contract;
    if (contract && treasuryId) {
      const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
      if (treasury) {
        const treasuryAccountCode =
          treasury.type === "bank"
            ? "102000"
            : treasury.branch_id === "branch-2"
              ? "101001"
              : "101000";

        const totalCollected = (contract.deposit_amount || 0) + (contract.advance_payment || 0);
        if (totalCollected > 0) {
          const lines = [
            {
              account_code: treasuryAccountCode,
              debit: totalCollected,
              credit: 0,
            },
          ];

          if (contract.deposit_amount > 0) {
            lines.push({
              account_code: "201100", // تأمينات مستأجرين
              debit: 0,
              credit: contract.deposit_amount,
            });
          }

          if (contract.advance_payment > 0) {
            lines.push({
              account_code: "201200", // مقدمات إيجار - التزام (أو استخدام 401000)
              // But since we don't know if 201200 exists, we'll use 401000 for simplicity or "201200"
              debit: 0,
              credit: contract.advance_payment,
            });
          }

          this.addJournalEntry(
            `تحصيل تأمين ومقدم عقد إيجار لمحل #${shopId}`,
            lines,
            `CNTR-${Date.now().toString().slice(-6)}`,
            "USD",
            contract.start_date,
          );

          this.addTreasuryTransaction(
            treasuryId,
            "sales",
            totalCollected,
            "USD",
            `تحصيل تأمين ومقدم لعقد إيجار محل #${shopId}`,
            `CNTR-${Date.now().toString().slice(-6)}`,
            "cash",
            null,
          );
        }
      }
    }
  }

  updateMallShop(id: string, updates: Partial<MallShop>) {
    this.state.mallShops = (this.state.mallShops || []).map((s) =>
      s.id === id ? { ...s, ...updates } : s,
    );
    this.saveState();
    this.logAction("ADMIN", "تعديل بيانات المحل", `تم تحديث بيانات المحل رقم ${id}`, "UPDATE");
  }

  deleteMallShop(id: string) {
    this.state.mallShops = (this.state.mallShops || []).filter((s) => s.id !== id);
    this.state.mallPayments = (this.state.mallPayments || []).filter((p) => p.shop_id !== id);
    this.saveState();
    this.logAction("ADMIN", "حذف محل من المول", `تم حذف المحل وسجل مدفوعاته`, "DELETE");
  }

  recordMallPayment(payment: Omit<MallRentalPayment, "id">, treasuryId?: string) {
    const existingIndex = (this.state.mallPayments || []).findIndex(
      (p) => p.shop_id === payment.shop_id && p.year === payment.year && p.month === payment.month,
    );
    if (existingIndex >= 0) {
      this.state.mallPayments[existingIndex] = {
        ...this.state.mallPayments[existingIndex],
        ...payment,
      };
    } else {
      const newPayment: MallRentalPayment = {
        ...payment,
        id: "pay-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      };
      this.state.mallPayments = [...(this.state.mallPayments || []), newPayment];
    }
    this.saveState();
    this.logAction(
      "ADMIN",
      "تسجيل دفعة إيجار",
      `تم تسجيل دفعة إيجار للمحل لشهر ${payment.month}/${payment.year} بقيمة ${payment.amount_paid}`,
      "TRANSACTION",
    );

    if (treasuryId && payment.amount_paid !== 0) {
      const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
      if (treasury) {
        const treasuryAccountCode =
          treasury.type === "bank"
            ? "102000"
            : treasury.branch_id === "branch-2"
              ? "101001"
              : "101000";

        // If amount_paid is positive -> Income (Debit Treasury, Credit Revenue)
        // If amount_paid is negative -> Refund (Credit Treasury, Debit Revenue or Deposit)
        const isRefund = payment.amount_paid < 0;
        const absAmount = Math.abs(payment.amount_paid);
        const revenueAccount = "401000"; // Assuming 401000 is rental revenue

        const lines = [
          {
            account_code: treasuryAccountCode,
            debit: isRefund ? 0 : absAmount,
            credit: isRefund ? absAmount : 0,
          },
          {
            account_code: revenueAccount,
            debit: isRefund ? absAmount : 0,
            credit: isRefund ? 0 : absAmount,
          },
        ];

        this.addJournalEntry(
          isRefund
            ? `رد مقدم/دفعة إيجار للمحل (شهر ${payment.month}/${payment.year})`
            : `تحصيل دفعة إيجار للمحل (شهر ${payment.month}/${payment.year})`,
          lines,
          payment.receipt_number || `REC-${Date.now()}`,
          "USD",
          payment.payment_date || new Date().toISOString().split("T")[0],
        );

        this.addTreasuryTransaction(
          treasuryId,
          isRefund ? "withdrawal" : "sales",
          absAmount,
          "USD",
          isRefund ? `رد مقدم/دفعة إيجار للمحل` : `تحصيل دفعة إيجار للمحل`,
          payment.receipt_number || `REC-${Date.now()}`,
          payment.payment_method === "cash" ? "cash" : "bank_transfer",
          null,
        );
      }
    }
  }

  deleteMallPayment(id: string) {
    this.state.mallPayments = (this.state.mallPayments || []).filter((p) => p.id !== id);
    this.saveState();
    this.logAction("ADMIN", "حذف دفعة إيجار", `تم حذف دفعة الإيجار رقم ${id}`, "DELETE");
  }

  addMallGardenRevenue(rev: Omit<MallGardenRevenue, "id">) {
    const newRev: MallGardenRevenue = {
      ...rev,
      id: "rev-" + Date.now(),
    };
    this.state.mallGardenRevenues = [...(this.state.mallGardenRevenues || []), newRev];
    this.saveState();
    this.logAction("ADMIN", "إضافة إيراد حديقة", `تم إضافة إيراد بقيمة ${newRev.amount}`, "CREATE");
  }

  deleteMallGardenRevenue(id: string) {
    this.state.mallGardenRevenues = (this.state.mallGardenRevenues || []).filter(
      (r) => r.id !== id,
    );
    this.saveState();
    this.logAction("ADMIN", "حذف إيراد حديقة", `تم حذف الإيراد رقم ${id}`, "DELETE");
  }

  addMallGardenExpense(exp: Omit<MallGardenExpense, "id">) {
    const newExp: MallGardenExpense = {
      ...exp,
      id: "exp-" + Date.now(),
    };
    this.state.mallGardenExpenses = [...(this.state.mallGardenExpenses || []), newExp];
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة مصروف مول/حديقة",
      `تم إضافة مصروف ${newExp.title} بقيمة ${newExp.amount}`,
      "CREATE",
    );
  }

  deleteMallGardenExpense(id: string) {
    this.state.mallGardenExpenses = (this.state.mallGardenExpenses || []).filter(
      (e) => e.id !== id,
    );
    this.saveState();
    this.logAction("ADMIN", "حذف مصروف", `تم حذف المصروف رقم ${id}`, "DELETE");
  }

  resetMallData() {
    this.state.mallShops = DEFAULT_MALL_SHOPS;
    this.state.mallPayments = DEFAULT_MALL_PAYMENTS;
    this.state.mallGardenRevenues = DEFAULT_GARDEN_REVENUES;
    this.state.mallGardenExpenses = DEFAULT_GARDEN_EXPENSES;
    this.state.mallTerminatedContractsArchive = [];
    this.saveState();
    this.logAction(
      "ADMIN",
      "إعادة ضبط بيانات المول",
      "تم إعادة تحميل بيانات المحلات والإيجارات الافتراضية بنجاح",
      "UPDATE",
    );
  }

  terminateMallContract(record: Omit<TerminatedContractRecord, "id">, treasuryId?: string) {
    const termRecord: TerminatedContractRecord = {
      ...record,
      id: "term-" + Date.now(),
    };
    this.state.mallTerminatedContractsArchive = [
      termRecord,
      ...(this.state.mallTerminatedContractsArchive || []),
    ];

    const shop = (this.state.mallShops || []).find((s) => s.id === record.shop_id);
    if (shop) {
      shop.status = "vacant";
      shop.tenant_name = "";
      shop.phone = "";
      shop.contract = undefined;
    }

    let treasuryAccountCode = "101000";
    if (treasuryId) {
      const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
      if (treasury) {
        treasuryAccountCode =
          treasury.type === "bank"
            ? "102000"
            : treasury.branch_id === "branch-2"
              ? "101001"
              : "101000";
      }
    }

    if (record.refund_amount > 0 && treasuryId) {
      this.addTreasuryTransaction(
        treasuryId,
        "withdrawal",
        record.refund_amount,
        "USD",
        `رد تأمين لفسخ عقد إيجار المحل #${record.shop_number}`,
        `TERM-${record.shop_number}`,
        "cash",
        null,
      );
    }

    if (record.deposit_amount > 0 || record.refund_amount > 0) {
      const lines = [];
      const depositAmount = record.deposit_amount || 0;
      const refundAmount = record.refund_amount || 0;

      if (depositAmount > 0) {
        lines.push({
          account_code: "201100", // تأمينات مستأجرين
          debit: depositAmount,
          credit: 0,
        });
      }

      if (refundAmount > 0) {
        lines.push({
          account_code: treasuryAccountCode,
          debit: 0,
          credit: refundAmount,
        });
      }

      const diff = depositAmount - refundAmount;
      if (diff > 0) {
        // Forfeited deposit -> revenue
        lines.push({
          account_code: "401000", // إيرادات
          debit: 0,
          credit: diff,
        });
      } else if (diff < 0) {
        // Refunded more than deposit -> expense
        lines.push({
          account_code: "501000", // مصاريف
          debit: Math.abs(diff),
          credit: 0,
        });
      }

      this.addJournalEntry(
        `إثبات فسخ عقد إيجار المحل #${record.shop_number} وتسوية التأمين`,
        lines,
        `TERM-${record.shop_number}`,
        "USD",
        record.termination_date,
      );
    }

    this.saveState();
    this.logAction(
      "ADMIN",
      "فسخ عقد إيجار محل",
      `تم فسخ عقد المحل #${record.shop_number} وأرشفة العقد ورد التأمين بقيمة ${record.refund_amount} USD`,
      "UPDATE",
    );
  }
}

export const erpStore = new ERPStore();
