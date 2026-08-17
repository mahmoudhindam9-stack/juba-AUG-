import { i as e, o as t, r as n, t as r } from "./client-C2Div8lN.js";
import { t as i } from "./useQuery-D8gK3K9x.js";
var a = t(e()),
  o = n();
function s() {
  let e = i({
      queryKey: [`menu_items_for_components`],
      queryFn: async () => {
        let { data: e, error: t } = await r
          .from(`menu_items`)
          .select(`id,name_ar,price,category_id,image_url`)
          .eq(`is_available`, !0)
          .order(`name_ar`);
        if (t) throw t;
        return e ?? [];
      },
    }),
    t = i({
      queryKey: [`menu_categories_for_components`],
      queryFn: async () => {
        let { data: e, error: t } = await r.from(`menu_categories`).select(`id,name_ar`);
        if (t) throw t;
        return e ?? [];
      },
    }),
    n = (0, a.useMemo)(() => {
      let e = new Map();
      return ((t.data ?? []).forEach((t) => e.set(t.id, t.name_ar)), e);
    }, [t.data]),
    s = e.data ?? [];
  return (0, o.jsxs)(`div`, {
    className: `p-8`,
    children: [
      (0, o.jsx)(`h1`, { className: `text-2xl font-bold mb-4`, children: `مكونات الوجبات` }),
      e.isLoading
        ? (0, o.jsx)(`div`, { children: `جاري التحميل…` })
        : s.length === 0
          ? (0, o.jsx)(`div`, { children: `لا توجد أصناف متاحة` })
          : (0, o.jsx)(`div`, {
              className: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4`,
              children: s.map((e) =>
                (0, o.jsxs)(
                  `div`,
                  {
                    className: `bg-card p-3 rounded-xl border border-border`,
                    children: [
                      (0, o.jsx)(`div`, {
                        className: `aspect-[4/3] bg-muted rounded-md overflow-hidden mb-3`,
                        children: e.image_url
                          ? (0, o.jsx)(`img`, {
                              src: e.image_url,
                              alt: e.name_ar,
                              className: `w-full h-full object-cover`,
                            })
                          : (0, o.jsx)(`div`, {
                              className: `w-full h-full flex items-center justify-center text-muted-foreground`,
                              children: `لا توجد صورة`,
                            }),
                      }),
                      (0, o.jsxs)(`div`, {
                        className: `flex items-center justify-between`,
                        children: [
                          (0, o.jsxs)(`div`, {
                            children: [
                              (0, o.jsx)(`div`, {
                                className: `font-bold text-sm`,
                                children: e.name_ar,
                              }),
                              (0, o.jsx)(`div`, {
                                className: `text-xs text-muted-foreground`,
                                children: n.get(e.category_id) ?? `عام`,
                              }),
                            ],
                          }),
                          (0, o.jsxs)(`div`, {
                            className: `text-sm font-black`,
                            children: [e.price, ` ج.م`],
                          }),
                        ],
                      }),
                    ],
                  },
                  e.id,
                ),
              ),
            }),
    ],
  });
}
export { s as component };
