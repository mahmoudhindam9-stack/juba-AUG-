import { r as e, t } from "./client-C2Div8lN.js";
import { y as n } from "./index-D35RyiWQ.js";
import { n as r, t as i } from "./xlsx-DXM_A2ny.js";
var a = e();
function o() {
  return (0, a.jsxs)(`div`, {
    className: `p-8`,
    children: [
      (0, a.jsxs)(`div`, {
        className: `flex items-center justify-between mb-6`,
        children: [
          (0, a.jsx)(`h1`, { className: `text-2xl font-bold`, children: `لوحة الإدارة` }),
          (0, a.jsx)(`div`, {
            className: `flex items-center gap-2`,
            children: (0, a.jsx)(n, {
              to: `/`,
              className: `text-sm text-muted-foreground hover:underline`,
              children: `العودة للرئيسية`,
            }),
          }),
        ],
      }),
      (0, a.jsxs)(`div`, {
        className: `grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl`,
        children: [
          (0, a.jsx)(`button`, {
            onClick: async () => {
              let { data: e, error: n } = await t
                .from(`orders`)
                .select(`order_number,subtotal,tax,total,payment_method,items,created_at`)
                .order(`created_at`, { ascending: !1 });
              if (n) {
                alert(`تعذر تحميل الطلبات: ` + n.message);
                return;
              }
              let a = e ?? [];
              if (a.length === 0) {
                alert(`لا توجد طلبات لتصديرها`);
                return;
              }
              let o = { cash: `نقدي`, card: `بطاقة`, wallet: `محفظة` },
                s = a.map((e) => ({
                  "رقم الطلب": e.order_number,
                  التاريخ: new Date(e.created_at).toLocaleString(`ar-EG`),
                  "عدد الأصناف": (e.items ?? []).reduce((e, t) => e + (t.quantity ?? 0), 0),
                  "المجموع الفرعي": Number(e.subtotal),
                  الضريبة: Number(e.tax),
                  الإجمالي: Number(e.total),
                  "طريقة الدفع": o[e.payment_method] ?? e.payment_method,
                })),
                c = a.flatMap((e) =>
                  (e.items ?? []).map((t) => ({
                    "رقم الطلب": e.order_number,
                    التاريخ: new Date(e.created_at).toLocaleString(`ar-EG`),
                    الصنف: t.name_ar,
                    السعر: Number(t.price),
                    الكمية: t.quantity,
                    الإجمالي: Number(t.price) * t.quantity,
                  })),
                ),
                l = {
                  "إجمالي الطلبات": a.length,
                  "إجمالي المبيعات": a.reduce((e, t) => e + Number(t.total), 0),
                  "إجمالي الضريبة": a.reduce((e, t) => e + Number(t.tax), 0),
                },
                u = i.book_new(),
                d = i.json_to_sheet(s);
              ((d[`!views`] = [{ RTL: !0 }]), i.book_append_sheet(u, d, `الطلبات`));
              let f = i.json_to_sheet(c);
              ((f[`!views`] = [{ RTL: !0 }]), i.book_append_sheet(u, f, `تفاصيل الأصناف`));
              let p = i.json_to_sheet([l]);
              ((p[`!views`] = [{ RTL: !0 }]),
                i.book_append_sheet(u, p, `الملخص`),
                r(u, `admin-orders-${new Date().toISOString().slice(0, 10)}.xlsx`));
            },
            className: `px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold`,
            children: `تصدير الطلبات إلى Excel`,
          }),
          (0, a.jsx)(n, {
            to: `/admin/inventory`,
            className: `inline-flex items-center justify-center px-4 py-3 rounded-xl border border-input bg-background text-sm font-medium`,
            children: `الانتقال إلى الجرد`,
          }),
        ],
      }),
    ],
  });
}
export { o as component };
