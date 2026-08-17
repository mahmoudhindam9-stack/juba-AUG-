import { useState } from "react";
import { erpStore, Supplier } from "@/shared/services/erpStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, UserPlus, Phone, DollarSign, Pencil, Truck } from "lucide-react";

export function SupplierManagement() {
  const [erpState, setErpState] = useState(erpStore.getState());
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name_ar: "",
    phone: "",
    opening_balance: "0",
  });

  const suppliers = erpState.suppliers.filter(
    (s) => !s.deleted && (s.name_ar.includes(search) || (s.phone || "").includes(search)),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar) return;

    if (editingId) {
      erpStore.updateSupplier(editingId, {
        name_ar: form.name_ar,
        phone: form.phone,
      });
    } else {
      erpStore.addSupplier(form.name_ar, form.phone, Number(form.opening_balance));
    }

    setForm({ name_ar: "", phone: "", opening_balance: "0" });
    setEditingId(null);
    setErpState(erpStore.getState());
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم تحديث بيانات الموردين في النظام.",
    });
  };

  const handleEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({
      name_ar: s.name_ar,
      phone: s.phone || "",
      opening_balance: String(s.balance),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟ لن يتم حذف تاريخ المعاملات المرتبطة به.")) {
      erpStore.deleteSupplier(id);
      setErpState(erpStore.getState());
      toast({
        title: "تم الحذف",
        description: "تم نقل المورد إلى قائمة المحذوفات مؤقتاً.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border border-border/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Truck className="text-primary" size={20} />
            <span>{editingId ? "تعديل مورد" : "إضافة مورد جديد"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <UserPlus size={14} />
                اسم المورد *
              </Label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm((s) => ({ ...s, name_ar: e.target.value }))}
                placeholder="مثال: شركة العالمية للتوريدات"
                className="bg-muted/30 border-muted-foreground/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Phone size={14} />
                رقم الهاتف
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                placeholder="01xxxxxxxxx"
                className="bg-muted/30 border-muted-foreground/20 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <DollarSign size={14} />
                الرصيد الافتتاحي (مدين/دائن)
              </Label>
              <Input
                type="number"
                disabled={!!editingId}
                value={form.opening_balance}
                onChange={(e) => setForm((s) => ({ ...s, opening_balance: e.target.value }))}
                className="bg-muted/30 border-muted-foreground/20 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-xl font-bold gap-2">
                {editingId ? "تحديث" : <Plus size={16} />}
                {editingId ? "تحديث البيانات" : "إضافة المورد"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name_ar: "", phone: "", opening_balance: "0" });
                  }}
                  className="rounded-xl font-bold"
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-black">قائمة الموردين النشطين</CardTitle>
            <div className="relative w-64">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="بحث عن مورد..."
                className="pr-9 h-9 rounded-xl text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/50">
              <tr>
                <th className="px-4 py-3">اسم المورد</th>
                <th className="px-4 py-3">رقم الهاتف</th>
                <th className="px-4 py-3 text-center">الرصيد الحالي</th>
                <th className="px-4 py-3 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-4 font-bold text-foreground">{s.name_ar}</td>
                  <td className="px-4 py-4 text-muted-foreground">{s.phone || "---"}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`font-black ${s.balance > 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {Math.abs(s.balance).toLocaleString()} ج.م
                      {s.balance > 0 ? " (دائن)" : " (مدين)"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-left">
                    <div className="flex justify-start gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(s)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    لا يوجد موردين مضافين حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
