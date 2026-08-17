import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pencil,
  Trash2,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Users as UsersIcon,
  Save,
  Undo2,
} from "lucide-react";
import { erpStore, UserPermission, SystemUser } from "@/shared/services/erpStore";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "المستخدمين والصلاحيات" }] }),
  component: UsersPage,
});

const roleLabels: Record<string, string> = {
  admin: "مدير عام",
  manager: "مشرف / محاسب مالي",
  cashier: "كاشير صالة وتوصيل",
  kitchen: "مطبخ بار",
};

const PERMISSIONS_LIST = [
  {
    key: "orders" as const,
    name: "الطلبات والمبيعات",
    desc: "استعراض وإدارة سجلات الطلبات والمبيعات",
  },
  {
    key: "pos" as const,
    name: "نقطة البيع (POS)",
    desc: "الوصول المباشر لشاشة البيع وطلبات الكاشير السريعة",
  },
  {
    key: "captain" as const,
    name: "Captain Order",
    desc: "إنشاء وتعديل طلبات الطاولات",
  },
  {
    key: "kitchen" as const,
    name: "إدارة المطبخ (KDS)",
    desc: "متابعة وإتمام تجهيز الطلبات من شاشة المطبخ",
  },
  {
    key: "delivery" as const,
    name: "طلبات التوصيل",
    desc: "إدارة وتوزيع ومتابعة طلبات التوصيل الخارجية",
  },
  {
    key: "inventory" as const,
    name: "إدارة المخزون",
    desc: "التحكم في الأصناف، جرد المخازن، التحويلات والتالف",
  },
  {
    key: "purchasing" as const,
    name: "المشتريات والموردين",
    desc: "إضافة فواتير الشراء والمرتجعات وإدارة حسابات الموردين",
  },
  {
    key: "production" as const,
    name: "الإنتاج والتصنيع",
    desc: "إدارة وصفات الطهي وعمليات التصنيع وتكاليفها",
  },
  {
    key: "hr" as const,
    name: "الموارد البشرية (HR)",
    desc: "إدارة الموظفين، السلف، المرتبات وسجلات الحضور",
  },
  {
    key: "treasury" as const,
    name: "إدارة الخزائن",
    desc: "فتح وإغلاق الخزائن وإجراء التعديلات المالية اليدوية",
  },
  {
    key: "accounting" as const,
    name: "الحسابات المحاسبية",
    desc: "تسجيل قيود اليومية وقيد السندات المالية وتعديل الأرصدة",
  },
  {
    key: "journal_approval" as const,
    name: "اعتماد قيود اليومية",
    desc: "الموافقة على القيود التلقائية واليدوية وترحيلها",
  },
  {
    key: "expense_approval" as const,
    name: "اعتماد سندات الصرف",
    desc: "مراجعة ودراسة مستندات الصرف واعتماد المصروفات بالفروع",
  },
  {
    key: "revenue_approval" as const,
    name: "اعتماد سندات القبض",
    desc: "اعتماد استلام الإيرادات المتنوعة ومبيعات الهدر",
  },
  {
    key: "cost_centers" as const,
    name: "إدارة مراكز التكلفة",
    desc: "توزيع السندات وتحليل ربحية قطاعات المطبخ والبار",
  },
  {
    key: "reports" as const,
    name: "التقارير والميزانية",
    desc: "قائمة الدخل، الميزانية العمومية، والتدفقات النقدية",
  },
  {
    key: "branch_mgmt" as const,
    name: "إعدادات الفروع",
    desc: "إنشاء الفروع وتحديث إعدادات المؤسسة الأساسية",
  },
  {
    key: "users_roles" as const,
    name: "إدارة المستخدمين",
    desc: "إضافة وتعديل حسابات الدخول وتخصيص الصلاحيات",
  },
  {
    key: "audit_logs" as const,
    name: "سجل العمليات الأمني",
    desc: "معاينة سجل المراقبة لكشف التلاعب والتحقق من العمليات",
  },
];

function UsersPage() {
  const [erpState, setErpState] = useState(erpStore.getState());
  const [localUsers, setLocalUsers] = useState(erpStore.getUsers());

  // Delete User State
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    password: "",
    role: "cashier",
  });
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [isConfirmUpsertOpen, setIsConfirmUpsertOpen] = useState(false);

  // Permissions Modal State
  const [permissionsUser, setPermissionsUser] = useState<SystemUser | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<UserPermission | null>(null);
  const [isConfirmSavePermsOpen, setIsConfirmSavePermsOpen] = useState(false);

  useEffect(() => {
    const unsub = erpStore.subscribe(() => {
      setLocalUsers(erpStore.getUsers());
      setErpState(erpStore.getState());
    });
    return unsub;
  }, []);

  const upsert = () => {
    if (editing) {
      erpStore.upsertUser({
        ...editing,
        full_name: form.full_name,
        username: form.username,
        phone: form.phone,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      });
      setEditing(null);
    } else {
      erpStore.upsertUser({
        id: `u-${Date.now()}`,
        full_name: form.full_name,
        username: form.username,
        phone: form.phone,
        role: form.role,
        password: form.password,
        created_at: new Date().toISOString(),
      });
    }
    setForm({ full_name: "", username: "", phone: "", password: "", role: "cashier" });
    setIsConfirmUpsertOpen(false);
  };

  const deleteUser = () => {
    if (userToDelete) {
      erpStore.deleteUser(userToDelete);
    }
    setUserToDelete(null);
    setIsConfirmDeleteOpen(false);
  };

  const startEdit = (p: SystemUser) => {
    setEditing(p);
    setForm({
      full_name: p.full_name ?? "",
      username: p.username ?? "",
      phone: p.phone ?? "",
      password: "",
      role: p.role,
    });
  };

  const openPermissionsForUser = (user: SystemUser) => {
    setPermissionsUser(user);
    const currentPerms = erpState.userPermissions[user.username] || {
      orders: false,
      pos: false,
      captain: false,
      kitchen: false,
      delivery: false,
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
    };
    setEditedPermissions({ ...currentPerms });
  };

  const handleSavePermissions = () => {
    if (permissionsUser && editedPermissions) {
      erpStore.updateUserPermission(permissionsUser.username, editedPermissions);
      setErpState(erpStore.getState());
    }
    setIsConfirmSavePermsOpen(false);
    setPermissionsUser(null);
    setEditedPermissions(null);
  };

  const togglePermission = (key: keyof UserPermission) => {
    if (!editedPermissions) return;
    setEditedPermissions({
      ...editedPermissions,
      [key]: !editedPermissions[key],
    });
  };

  const selectAllPerms = (value: boolean) => {
    if (!editedPermissions) return;
    const updated: any = {};
    PERMISSIONS_LIST.forEach((p) => {
      updated[p.key] = value;
    });
    setEditedPermissions(updated);
  };

  return (
    <div className="space-y-8 p-1 sm:p-2" dir="rtl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-black flex items-center gap-1.5">
            <UsersIcon size={14} />
            إدارة الكوادر البشرية والرقابة
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground mt-2">
          إدارة المستخدمين وصلاحيات الوصول والرقابة
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          إضافة وتعديل حسابات المستخدمين والأنظمة، تخصيص جدول الصلاحيات (ACL)، وقفل الفترات والدفاتر
          المالية
        </p>
      </div>

      {/* User Registration & List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <span>حسابات كادر العمل والمنظومة</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="md:col-span-2 lg:col-span-1">
            <Label className="text-xs font-bold">الاسم الكامل</Label>
            <Input
              className="h-9 rounded-xl border-input bg-background px-3 text-xs mt-1"
              placeholder="مثال: أحمد محمد"
              value={form.full_name}
              onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Label className="text-xs font-bold">اسم المستخدم / البريد (للدخول)</Label>
            <Input
              className="h-9 rounded-xl border-input bg-background px-3 text-xs mt-1"
              placeholder="مثال: admin"
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Label className="text-xs font-bold">رقم الهاتف</Label>
            <Input
              className="h-9 rounded-xl border-input bg-background px-3 text-xs mt-1"
              placeholder="01xxxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Label className="text-xs font-bold">الرقم السري</Label>
            <Input
              type="password"
              className="h-9 rounded-xl border-input bg-background px-3 text-xs mt-1"
              placeholder={editing ? "اتركه فارغاً لعدم التغيير" : "الرقم السري"}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <Label className="text-xs font-bold">الدور الوظيفي الأساسي</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-bold mt-1"
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
            >
              {Object.entries(roleLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-6 flex justify-end items-end gap-2 mt-2">
            {editing && (
              <Button
                variant="outline"
                className="h-9 px-6 rounded-xl font-bold"
                onClick={() => {
                  setEditing(null);
                  setForm({
                    full_name: "",
                    username: "",
                    phone: "",
                    password: "",
                    role: "cashier",
                  });
                }}
              >
                إلغاء التعديل
              </Button>
            )}
            <Button
              className="h-9 px-6 rounded-xl font-bold gap-2"
              onClick={() => setIsConfirmUpsertOpen(true)}
              disabled={!form.full_name || !form.username || (!editing && !form.password)}
            >
              <Save size={16} />
              {editing ? "حفظ التعديلات" : "إضافة مستخدم جديد"}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-right p-3 font-bold">الاسم الكامل</th>
                <th className="text-right p-3 font-bold">اسم الدخول</th>
                <th className="text-right p-3 font-bold">رقم الهاتف</th>
                <th className="text-right p-3 font-bold">الدور الوظيفي</th>
                <th className="text-center p-3 font-bold w-40">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-semibold">
              {localUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-foreground">{u.full_name || "-"}</td>
                  <td className="p-3 font-mono">{u.username || "-"}</td>
                  <td className="p-3 font-mono">{u.phone || "-"}</td>
                  <td className="p-3">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-black text-[10px]">
                      {roleLabels[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="p-3 flex items-center justify-center gap-1.5 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 rounded-lg gap-1.5 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                      onClick={() => openPermissionsForUser(u)}
                    >
                      <ShieldCheck size={14} />
                      الصلاحيات
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => startEdit(u)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => {
                        setUserToDelete(u.id);
                        setIsConfirmDeleteOpen(true);
                      }}
                      disabled={u.username === "admin"}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lock accounting periods & fiscal year status */}
      <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <Lock size={18} className="text-amber-500" />
          <span>قفل الفترات والسنة المالية</span>
        </h3>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          حماية الدفاتر المحاسبية من التعديل التاريخي بأثر رجعي، وإتمام إجراءات إقفال نهاية العام
          بنجاح.
        </p>
        <div className="space-y-4 pt-2">
          <div className="border border-border p-3.5 rounded-xl flex items-center justify-between bg-muted/20">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-foreground">قفل الفترة المحاسبية التاريخية</h4>
              <p className="text-[10px] text-muted-foreground">
                قفل كامل لدفتر اليومية والأستاذ العام للحد من التعديل
              </p>
            </div>
            <button
              onClick={() => {
                const nextLock = !erpState.isAccountingPeriodLocked;
                erpStore.setPeriodLock(nextLock);
                setErpState(erpStore.getState());
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition ${
                erpState.isAccountingPeriodLocked
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {erpState.isAccountingPeriodLocked ? "🔒 مقفلة حالياً" : "🔓 مفتوحة وقابلة للترحيل"}
            </button>
          </div>
          <div className="border border-border p-3.5 rounded-xl flex items-center justify-between bg-muted/20">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-foreground">إغلاق السنة المالية الحالية</h4>
              <p className="text-[10px] text-muted-foreground">
                ترحيل الأرصدة الختامية كأرصدة إفتتاحية جديدة تلقائياً
              </p>
            </div>
            <button
              onClick={() => {
                const nextStatus = erpState.fiscalYearStatus === "open" ? "closed" : "open";
                erpStore.setFiscalYearStatus(nextStatus);
                setErpState(erpStore.getState());
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition ${
                erpState.fiscalYearStatus === "closed"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {erpState.fiscalYearStatus === "closed"
                ? "🔴 مغلقة ومرحلة"
                : "🟢 سنة مالية نشطة ومفتوحة"}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Permissions Dialog */}

      <AlertDialog open={isConfirmUpsertOpen} onOpenChange={setIsConfirmUpsertOpen}>
        <AlertDialogContent className="text-right dir-rtl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-primary" size={20} />
              {editing ? "تأكيد تعديل بيانات المستخدم" : "تأكيد إضافة مستخدم جديد"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editing
                ? "هل أنت متأكد من حفظ التعديلات على هذا الحساب؟"
                : "هل أنت متأكد من إضافة هذا المستخدم الجديد؟"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction onClick={upsert} className="bg-primary hover:bg-primary/90">
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent className="text-right dir-rtl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="text-destructive" size={20} />
              تأكيد حذف المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>تراجع</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmSavePermsOpen} onOpenChange={setIsConfirmSavePermsOpen}>
        <AlertDialogContent className="text-right dir-rtl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-emerald-500" size={20} />
              تأكيد حفظ الصلاحيات
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حفظ التعديلات الجديدة على صلاحيات المستخدم؟ سيتم تطبيق هذه الصلاحيات
              فوراً وقد تؤثر على وصول المستخدم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSavePermissions}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              تأكيد الحفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detailed Permissions Dialog */}
      <Dialog open={!!permissionsUser} onOpenChange={(open) => !open && setPermissionsUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto text-right dir-rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
              <ShieldCheck className="text-primary" size={22} />
              صلاحيات المستخدم: {permissionsUser?.full_name} ({permissionsUser?.username})
            </DialogTitle>
            <DialogDescription className="text-xs">
              تفعيل أو إلغاء تفعيل صلاحيات الدخول والعمليات لكل قسم من أقسام المنظومة بالتفصيل.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
              <span className="text-xs font-bold text-foreground">التحكم السريع بالصلاحيات:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold"
                  onClick={() => selectAllPerms(true)}
                >
                  تحديد الكل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold text-destructive hover:text-destructive"
                  onClick={() => selectAllPerms(false)}
                >
                  إلغاء الكل
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERMISSIONS_LIST.map((perm) => {
                const isChecked = editedPermissions ? !!editedPermissions[perm.key] : false;
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isChecked
                        ? "bg-primary/5 border-primary/40 shadow-xs"
                        : "bg-background border-border/70 hover:bg-muted/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-black text-xs text-foreground flex items-center justify-between">
                        <span>{perm.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isChecked ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}
                        >
                          {isChecked ? "مفعل" : "معطل"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {perm.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="h-9 px-5 rounded-xl font-bold"
              onClick={() => setPermissionsUser(null)}
            >
              إلغاء
            </Button>
            <Button
              className="h-9 px-6 rounded-xl font-bold gap-2 bg-primary text-primary-foreground"
              onClick={() => setIsConfirmSavePermsOpen(true)}
            >
              <Save size={16} />
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
