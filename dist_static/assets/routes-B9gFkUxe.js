import { i as e, o as t, r as n, t as r } from "./client-C2Div8lN.js";
import { t as i } from "./useQuery-D8gK3K9x.js";
import { t as a } from "./useMutation-CTdn_-aq.js";
import { t as o, y as s } from "./index-D35RyiWQ.js";
import { n as c, t as l } from "./xlsx-DXM_A2ny.js";
var u = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  d = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  f = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => (n ? n.toUpperCase() : t.toLowerCase())),
  p = (e) => {
    let t = f(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  m = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  h = (e) => {
    for (let t in e) if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
    return !1;
  },
  g = t(e()),
  _ = (0, g.forwardRef)(
    (
      {
        color: e = `currentColor`,
        size: t = 24,
        strokeWidth: n = 2,
        absoluteStrokeWidth: r,
        className: i = ``,
        children: a,
        iconNode: o,
        ...s
      },
      c,
    ) =>
      (0, g.createElement)(
        `svg`,
        {
          ref: c,
          ...m,
          width: t,
          height: t,
          stroke: e,
          strokeWidth: r ? (Number(n) * 24) / Number(t) : n,
          className: u(`lucide`, i),
          ...(!a && !h(s) && { "aria-hidden": `true` }),
          ...s,
        },
        [...o.map(([e, t]) => (0, g.createElement)(e, t)), ...(Array.isArray(a) ? a : [a])],
      ),
  ),
  v = (e, t) => {
    let n = (0, g.forwardRef)(({ className: n, ...r }, i) =>
      (0, g.createElement)(_, {
        ref: i,
        iconNode: t,
        className: u(`lucide-${d(p(e))}`, `lucide-${e}`, n),
        ...r,
      }),
    );
    return ((n.displayName = p(e)), n);
  },
  y = v(`banknote`, [
    [`rect`, { width: `20`, height: `12`, x: `2`, y: `6`, rx: `2`, key: `9lu3g6` }],
    [`circle`, { cx: `12`, cy: `12`, r: `2`, key: `1c9p78` }],
    [`path`, { d: `M6 12h.01M18 12h.01`, key: `113zkx` }],
  ]),
  b = v(`credit-card`, [
    [`rect`, { width: `20`, height: `14`, x: `2`, y: `5`, rx: `2`, key: `ynyp8z` }],
    [`line`, { x1: `2`, x2: `22`, y1: `10`, y2: `10`, key: `1b3vmo` }],
  ]),
  x = v(`file-spreadsheet`, [
    [
      `path`,
      {
        d: `M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,
        key: `1oefj6`,
      },
    ],
    [`path`, { d: `M14 2v5a1 1 0 0 0 1 1h5`, key: `wfsgrz` }],
    [`path`, { d: `M8 13h2`, key: `yr2amv` }],
    [`path`, { d: `M14 13h2`, key: `un5t4a` }],
    [`path`, { d: `M8 17h2`, key: `2yhykz` }],
    [`path`, { d: `M14 17h2`, key: `10kma7` }],
  ]),
  S = v(`loader-circle`, [[`path`, { d: `M21 12a9 9 0 1 1-6.219-8.56`, key: `13zald` }]]),
  C = v(`minus`, [[`path`, { d: `M5 12h14`, key: `1ays0h` }]]),
  w = v(`plus`, [
    [`path`, { d: `M5 12h14`, key: `1ays0h` }],
    [`path`, { d: `M12 5v14`, key: `s699le` }],
  ]),
  T = v(`printer`, [
    [
      `path`,
      {
        d: `M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,
        key: `143wyd`,
      },
    ],
    [`path`, { d: `M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`, key: `1itne7` }],
    [`rect`, { x: `6`, y: `14`, width: `12`, height: `8`, rx: `1`, key: `1ue0tg` }],
  ]),
  E = v(`search`, [
    [`path`, { d: `m21 21-4.34-4.34`, key: `14j7rj` }],
    [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `4ej97u` }],
  ]),
  D = v(`shopping-cart`, [
    [`circle`, { cx: `8`, cy: `21`, r: `1`, key: `jimo8o` }],
    [`circle`, { cx: `19`, cy: `21`, r: `1`, key: `13723u` }],
    [
      `path`,
      {
        d: `M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12`,
        key: `9zh506`,
      },
    ],
  ]),
  O = v(`smartphone`, [
    [`rect`, { width: `14`, height: `20`, x: `5`, y: `2`, rx: `2`, ry: `2`, key: `1yt0o3` }],
    [`path`, { d: `M12 18h.01`, key: `mhygvu` }],
  ]),
  k = v(`trash-2`, [
    [`path`, { d: `M10 11v6`, key: `nco0om` }],
    [`path`, { d: `M14 11v6`, key: `outv1u` }],
    [`path`, { d: `M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`, key: `miytrc` }],
    [`path`, { d: `M3 6h18`, key: `d0wm0j` }],
    [`path`, { d: `M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`, key: `e791ji` }],
  ]),
  A = v(`utensils-crossed`, [
    [`path`, { d: `m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8`, key: `n7qcjb` }],
    [
      `path`,
      {
        d: `M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7`,
        key: `d0u48b`,
      },
    ],
    [`path`, { d: `m2.1 21.8 6.4-6.3`, key: `yn04lh` }],
    [`path`, { d: `m19 5-7 7`, key: `194lzd` }],
  ]),
  j = v(`x`, [
    [`path`, { d: `M18 6 6 18`, key: `1bl5f8` }],
    [`path`, { d: `m6 6 12 12`, key: `d8bk6v` }],
  ]),
  M = n(),
  N = 0.14;
function P() {
  let e = o(),
    [t, n] = (0, g.useState)([]),
    [u, d] = (0, g.useState)(``),
    [f, p] = (0, g.useState)(`all`),
    [m, h] = (0, g.useState)(!1),
    [_, v] = (0, g.useState)(null),
    [T, P] = (0, g.useState)(`cash`),
    B = i({
      queryKey: [`menu_categories`],
      queryFn: async () => {
        let { data: e, error: t } = await r
          .from(`menu_categories`)
          .select(`id,name_ar,sort_order`)
          .order(`sort_order`);
        if (t) throw t;
        return e;
      },
    }),
    V = i({
      queryKey: [`menu_items`],
      queryFn: async () => {
        let { data: e, error: t } = await r
          .from(`menu_items`)
          .select(`id,name_ar,price,category_id,image_url`)
          .eq(`is_available`, !0)
          .order(`created_at`);
        if (t) throw t;
        return e ?? [];
      },
    }),
    H = (e) => {
      n((t) =>
        t.find((t) => t.item.id === e.id)
          ? t.map((t) => (t.item.id === e.id ? { ...t, quantity: t.quantity + 1 } : t))
          : [...t, { item: e, quantity: 1 }],
      );
    },
    U = (e, t) => {
      n((n) =>
        n
          .map((n) => {
            if (n.item.id === e) {
              let e = n.quantity + t;
              return e > 0 ? { ...n, quantity: e } : null;
            }
            return n;
          })
          .filter((e) => e !== null),
      );
    },
    W = (e) => n((t) => t.filter((t) => t.item.id !== e)),
    G = t.reduce((e, t) => e + t.item.price * t.quantity, 0),
    K = G * N,
    q = G + K,
    J = t.reduce((e, t) => e + t.quantity, 0),
    Y = (0, g.useMemo)(
      () =>
        (V.data ?? []).filter((e) => {
          let t = f === `all` || e.category_id === f,
            n = !u.trim() || e.name_ar.includes(u.trim());
          return t && n;
        }),
      [V.data, f, u],
    ),
    X = a({
      mutationFn: async () => {
        let e = {
            subtotal: Number(G.toFixed(2)),
            tax: Number(K.toFixed(2)),
            total: Number(q.toFixed(2)),
            payment_method: T,
            items: t.map((e) => ({
              id: e.item.id,
              name_ar: e.item.name_ar,
              price: e.item.price,
              quantity: e.quantity,
            })),
          },
          { data: n, error: i } = await r
            .from(`orders`)
            .insert(e)
            .select(`order_number,subtotal,tax,total,payment_method,items,created_at`)
            .single();
        if (i) throw i;
        return n;
      },
      onSuccess: (t) => {
        (v(t), n([]), h(!1), e.invalidateQueries({ queryKey: [`orders`] }));
      },
    });
  return (0, M.jsxs)(`div`, {
    className: `min-h-screen flex bg-background text-foreground`,
    dir: `rtl`,
    style: { fontFamily: `"Tajawal", "Cairo", system-ui, sans-serif` },
    children: [
      (0, M.jsxs)(`div`, {
        className: `flex-1 flex flex-col min-w-0`,
        children: [
          (0, M.jsxs)(`header`, {
            className: `px-8 py-5 border-b border-border flex items-center justify-between gap-6`,
            style: { background: `var(--gradient-primary)` },
            children: [
              (0, M.jsxs)(`div`, {
                className: `flex items-center gap-3 text-primary-foreground`,
                children: [
                  (0, M.jsx)(`div`, {
                    className: `w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center`,
                    children: (0, M.jsx)(A, { size: 22 }),
                  }),
                  (0, M.jsxs)(`div`, {
                    children: [
                      (0, M.jsx)(`h1`, {
                        className: `text-xl font-black tracking-tight leading-none`,
                        children: `Juba Restaurant`,
                      }),
                      (0, M.jsxs)(`p`, {
                        className: `text-xs opacity-80 mt-1`,
                        children: [`نظام نقطة البيع • `, new Date().toLocaleDateString(`ar-EG`)],
                      }),
                    ],
                  }),
                ],
              }),
              (0, M.jsxs)(`div`, {
                className: `flex-1 max-w-md relative`,
                children: [
                  (0, M.jsx)(E, {
                    className: `absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/70`,
                    size: 18,
                  }),
                  (0, M.jsx)(`input`, {
                    type: `text`,
                    placeholder: `ابحث عن صنف...`,
                    className: `w-full bg-primary-foreground/15 backdrop-blur border border-primary-foreground/20 rounded-2xl py-3 pr-11 pl-4 text-sm text-primary-foreground placeholder:text-primary-foreground/60 outline-none focus:border-primary-foreground/60 transition`,
                    value: u,
                    onChange: (e) => d(e.target.value),
                  }),
                ],
              }),
              (0, M.jsxs)(`div`, {
                className: `flex items-center gap-2`,
                children: [
                  (0, M.jsx)(s, {
                    to: `/admin`,
                    className: `hidden sm:inline-flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/15 backdrop-blur border border-primary-foreground/10 text-primary-foreground text-sm font-medium px-3 py-2 rounded-2xl transition`,
                    title: `لوحة الإدارة`,
                    children: `الإدارة`,
                  }),
                  (0, M.jsxs)(`button`, {
                    onClick: async () => {
                      let { data: e, error: t } = await r
                        .from(`orders`)
                        .select(`order_number,subtotal,tax,total,payment_method,items,created_at`)
                        .order(`created_at`, { ascending: !1 });
                      if (t) {
                        alert(`تعذر تحميل الطلبات: ` + t.message);
                        return;
                      }
                      let n = e ?? [];
                      if (n.length === 0) {
                        alert(`لا توجد طلبات لتصديرها`);
                        return;
                      }
                      let i = { cash: `نقدي`, card: `بطاقة`, wallet: `محفظة` },
                        a = n.map((e) => ({
                          "رقم الطلب": e.order_number,
                          التاريخ: new Date(e.created_at).toLocaleString(`ar-EG`),
                          "عدد الأصناف": e.items.reduce((e, t) => e + t.quantity, 0),
                          "المجموع الفرعي": Number(e.subtotal),
                          الضريبة: Number(e.tax),
                          الإجمالي: Number(e.total),
                          "طريقة الدفع": i[e.payment_method],
                        })),
                        o = n.flatMap((e) =>
                          e.items.map((t) => ({
                            "رقم الطلب": e.order_number,
                            التاريخ: new Date(e.created_at).toLocaleString(`ar-EG`),
                            الصنف: t.name_ar,
                            السعر: Number(t.price),
                            الكمية: t.quantity,
                            الإجمالي: Number(t.price) * t.quantity,
                          })),
                        ),
                        s = {
                          "إجمالي الطلبات": n.length,
                          "إجمالي المبيعات": n.reduce((e, t) => e + Number(t.total), 0),
                          "إجمالي الضريبة": n.reduce((e, t) => e + Number(t.tax), 0),
                          نقدي: n
                            .filter((e) => e.payment_method === `cash`)
                            .reduce((e, t) => e + Number(t.total), 0),
                          بطاقة: n
                            .filter((e) => e.payment_method === `card`)
                            .reduce((e, t) => e + Number(t.total), 0),
                          محفظة: n
                            .filter((e) => e.payment_method === `wallet`)
                            .reduce((e, t) => e + Number(t.total), 0),
                        },
                        u = l.book_new(),
                        d = l.json_to_sheet(a);
                      ((d[`!views`] = [{ RTL: !0 }]), l.book_append_sheet(u, d, `الطلبات`));
                      let f = l.json_to_sheet(o);
                      ((f[`!views`] = [{ RTL: !0 }]), l.book_append_sheet(u, f, `تفاصيل الأصناف`));
                      let p = l.json_to_sheet([s]);
                      ((p[`!views`] = [{ RTL: !0 }]),
                        l.book_append_sheet(u, p, `الملخص`),
                        c(u, `juba-orders-${new Date().toISOString().slice(0, 10)}.xlsx`));
                    },
                    className: `flex items-center gap-2 bg-primary-foreground/15 hover:bg-primary-foreground/25 backdrop-blur border border-primary-foreground/20 text-primary-foreground text-sm font-bold px-4 py-3 rounded-2xl transition`,
                    title: `تصدير تقرير الطلبات إلى Excel`,
                    children: [
                      (0, M.jsx)(x, { size: 18 }),
                      (0, M.jsx)(`span`, {
                        className: `hidden sm:inline`,
                        children: `تصدير Excel`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, M.jsx)(`div`, {
            className: `px-8 py-4 border-b border-border bg-card`,
            children: (0, M.jsxs)(`div`, {
              className: `flex gap-2 overflow-x-auto pb-1`,
              children: [
                (0, M.jsx)(I, { label: `الكل`, active: f === `all`, onClick: () => p(`all`) }),
                (B.data ?? []).map((e) =>
                  (0, M.jsx)(
                    I,
                    { label: e.name_ar, active: f === e.id, onClick: () => p(e.id) },
                    e.id,
                  ),
                ),
              ],
            }),
          }),
          (0, M.jsx)(`div`, {
            className: `flex-1 overflow-y-auto p-8`,
            children: V.isLoading
              ? (0, M.jsx)(`div`, {
                  className: `flex items-center justify-center h-64 text-muted-foreground`,
                  children: (0, M.jsx)(S, { className: `animate-spin` }),
                })
              : Y.length === 0
                ? (0, M.jsx)(`div`, {
                    className: `text-center text-muted-foreground py-20`,
                    children: `لا توجد أصناف مطابقة`,
                  })
                : (0, M.jsx)(`div`, {
                    className: `grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5`,
                    children: Y.map((e) =>
                      (0, M.jsxs)(
                        `button`,
                        {
                          onClick: () => H(e),
                          className: `group bg-card rounded-3xl overflow-hidden border border-border text-right transition-all hover:-translate-y-1 active:scale-[0.98]`,
                          style: { boxShadow: `var(--shadow-card)` },
                          children: [
                            (0, M.jsxs)(`div`, {
                              className: `relative aspect-[4/3] overflow-hidden bg-muted`,
                              children: [
                                e.image_url &&
                                  (0, M.jsx)(`img`, {
                                    src: e.image_url,
                                    alt: e.name_ar,
                                    className: `w-full h-full object-cover group-hover:scale-110 transition-transform duration-500`,
                                    loading: `lazy`,
                                  }),
                                (0, M.jsxs)(`div`, {
                                  className: `absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow`,
                                  children: [e.price, ` ج.م`],
                                }),
                              ],
                            }),
                            (0, M.jsxs)(`div`, {
                              className: `p-4`,
                              children: [
                                (0, M.jsx)(`h4`, {
                                  className: `font-bold text-sm text-card-foreground line-clamp-1`,
                                  children: e.name_ar,
                                }),
                                (0, M.jsxs)(`div`, {
                                  className: `mt-2 flex items-center gap-1.5 text-xs text-primary font-semibold`,
                                  children: [
                                    (0, M.jsx)(w, { size: 14 }),
                                    (0, M.jsx)(`span`, { children: `إضافة للطلب` }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        },
                        e.id,
                      ),
                    ),
                  }),
          }),
        ],
      }),
      (0, M.jsxs)(`aside`, {
        className: `w-[380px] bg-card border-r border-border flex flex-col shrink-0`,
        style: { boxShadow: `var(--shadow-elegant)` },
        children: [
          (0, M.jsxs)(`div`, {
            className: `px-6 py-5 border-b border-border flex items-center justify-between`,
            children: [
              (0, M.jsxs)(`div`, {
                className: `flex items-center gap-2.5`,
                children: [
                  (0, M.jsx)(`div`, {
                    className: `w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground`,
                    style: { background: `var(--gradient-primary)` },
                    children: (0, M.jsx)(D, { size: 20 }),
                  }),
                  (0, M.jsxs)(`div`, {
                    children: [
                      (0, M.jsx)(`h2`, {
                        className: `font-black text-base leading-none`,
                        children: `الطلب الحالي`,
                      }),
                      (0, M.jsxs)(`p`, {
                        className: `text-xs text-muted-foreground mt-1`,
                        children: [J, ` صنف`],
                      }),
                    ],
                  }),
                ],
              }),
              t.length > 0 &&
                (0, M.jsx)(`button`, {
                  onClick: () => n([]),
                  className: `text-xs text-destructive hover:underline`,
                  children: `مسح الكل`,
                }),
            ],
          }),
          (0, M.jsx)(`div`, {
            className: `flex-1 overflow-y-auto px-4 py-4 space-y-2`,
            children:
              t.length === 0
                ? (0, M.jsxs)(`div`, {
                    className: `text-center py-16 px-4`,
                    children: [
                      (0, M.jsx)(`div`, {
                        className: `w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3`,
                        children: (0, M.jsx)(D, { size: 26 }),
                      }),
                      (0, M.jsxs)(`p`, {
                        className: `text-sm text-muted-foreground`,
                        children: [
                          `السلة فارغة`,
                          (0, M.jsx)(`br`, {}),
                          (0, M.jsx)(`span`, {
                            className: `text-xs`,
                            children: `اضغط على الأصناف لإضافتها`,
                          }),
                        ],
                      }),
                    ],
                  })
                : t.map((e) =>
                    (0, M.jsxs)(
                      `div`,
                      {
                        className: `flex gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition group`,
                        children: [
                          e.item.image_url &&
                            (0, M.jsx)(`img`, {
                              src: e.item.image_url,
                              alt: ``,
                              className: `w-14 h-14 rounded-xl object-cover shrink-0`,
                            }),
                          (0, M.jsxs)(`div`, {
                            className: `flex-1 min-w-0`,
                            children: [
                              (0, M.jsxs)(`div`, {
                                className: `flex items-start justify-between gap-2`,
                                children: [
                                  (0, M.jsx)(`h5`, {
                                    className: `font-bold text-sm line-clamp-1`,
                                    children: e.item.name_ar,
                                  }),
                                  (0, M.jsx)(`button`, {
                                    onClick: () => W(e.item.id),
                                    className: `text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition`,
                                    children: (0, M.jsx)(k, { size: 14 }),
                                  }),
                                ],
                              }),
                              (0, M.jsxs)(`div`, {
                                className: `flex items-center justify-between mt-2`,
                                children: [
                                  (0, M.jsxs)(`span`, {
                                    className: `text-sm font-black text-primary`,
                                    children: [(e.item.price * e.quantity).toFixed(0), ` ج.م`],
                                  }),
                                  (0, M.jsxs)(`div`, {
                                    className: `flex items-center gap-1.5 bg-card rounded-lg border border-border p-0.5`,
                                    dir: `ltr`,
                                    children: [
                                      (0, M.jsx)(`button`, {
                                        onClick: () => U(e.item.id, -1),
                                        className: `w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center transition`,
                                        children: (0, M.jsx)(C, { size: 12 }),
                                      }),
                                      (0, M.jsx)(`span`, {
                                        className: `text-xs font-bold w-5 text-center`,
                                        children: e.quantity,
                                      }),
                                      (0, M.jsx)(`button`, {
                                        onClick: () => U(e.item.id, 1),
                                        className: `w-6 h-6 rounded-md bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center transition`,
                                        children: (0, M.jsx)(w, { size: 12 }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      e.item.id,
                    ),
                  ),
          }),
          (0, M.jsxs)(`div`, {
            className: `border-t border-border p-5 space-y-3 bg-card`,
            children: [
              (0, M.jsx)(F, { label: `المجموع الفرعي`, value: `${G.toFixed(2)} ج.م` }),
              (0, M.jsx)(F, { label: `الضريبة (14%)`, value: `${K.toFixed(2)} ج.م` }),
              (0, M.jsx)(`div`, { className: `h-px border-t border-dashed border-border` }),
              (0, M.jsxs)(`div`, {
                className: `flex justify-between items-baseline`,
                children: [
                  (0, M.jsx)(`span`, { className: `font-bold text-sm`, children: `الإجمالي` }),
                  (0, M.jsxs)(`span`, {
                    className: `text-2xl font-black text-primary`,
                    children: [q.toFixed(2), ` ج.م`],
                  }),
                ],
              }),
              (0, M.jsxs)(`button`, {
                disabled: t.length === 0,
                onClick: () => h(!0),
                className: `w-full py-4 rounded-2xl text-primary-foreground font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 active:scale-[0.99] transition`,
                style: {
                  background: `var(--gradient-primary)`,
                  boxShadow: `var(--shadow-elegant)`,
                },
                children: [`إتمام الطلب • `, q.toFixed(2), ` ج.م`],
              }),
            ],
          }),
        ],
      }),
      m &&
        (0, M.jsx)(R, {
          onClose: () => h(!1),
          children: (0, M.jsxs)(`div`, {
            className: `p-8`,
            children: [
              (0, M.jsxs)(`div`, {
                className: `flex items-center justify-between mb-6`,
                children: [
                  (0, M.jsx)(`h3`, {
                    className: `text-xl font-black`,
                    children: `اختر طريقة الدفع`,
                  }),
                  (0, M.jsx)(`button`, {
                    onClick: () => h(!1),
                    className: `w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center`,
                    children: (0, M.jsx)(j, { size: 18 }),
                  }),
                ],
              }),
              (0, M.jsxs)(`div`, {
                className: `grid grid-cols-3 gap-3 mb-6`,
                children: [
                  (0, M.jsx)(L, {
                    icon: (0, M.jsx)(y, { size: 22 }),
                    label: `نقدي`,
                    active: T === `cash`,
                    onClick: () => P(`cash`),
                  }),
                  (0, M.jsx)(L, {
                    icon: (0, M.jsx)(b, { size: 22 }),
                    label: `بطاقة`,
                    active: T === `card`,
                    onClick: () => P(`card`),
                  }),
                  (0, M.jsx)(L, {
                    icon: (0, M.jsx)(O, { size: 22 }),
                    label: `محفظة`,
                    active: T === `wallet`,
                    onClick: () => P(`wallet`),
                  }),
                ],
              }),
              (0, M.jsxs)(`div`, {
                className: `rounded-2xl bg-muted p-4 space-y-2 mb-6`,
                children: [
                  (0, M.jsx)(F, { label: `المجموع الفرعي`, value: `${G.toFixed(2)} ج.م` }),
                  (0, M.jsx)(F, { label: `الضريبة`, value: `${K.toFixed(2)} ج.م` }),
                  (0, M.jsx)(`div`, { className: `h-px border-t border-dashed border-border` }),
                  (0, M.jsxs)(`div`, {
                    className: `flex justify-between items-baseline`,
                    children: [
                      (0, M.jsx)(`span`, { className: `font-bold`, children: `الإجمالي` }),
                      (0, M.jsxs)(`span`, {
                        className: `text-xl font-black text-primary`,
                        children: [q.toFixed(2), ` ج.م`],
                      }),
                    ],
                  }),
                ],
              }),
              X.isError &&
                (0, M.jsxs)(`p`, {
                  className: `text-sm text-destructive mb-3`,
                  children: [`تعذّر حفظ الطلب: `, X.error.message],
                }),
              (0, M.jsxs)(`button`, {
                disabled: X.isPending,
                onClick: () => X.mutate(),
                className: `w-full py-4 rounded-2xl text-primary-foreground font-bold disabled:opacity-60 flex items-center justify-center gap-2`,
                style: {
                  background: `var(--gradient-primary)`,
                  boxShadow: `var(--shadow-elegant)`,
                },
                children: [
                  X.isPending ? (0, M.jsx)(S, { size: 18, className: `animate-spin` }) : null,
                  `تأكيد وطباعة الفاتورة`,
                ],
              }),
            ],
          }),
        }),
      _ &&
        (0, M.jsx)(R, {
          onClose: () => v(null),
          children: (0, M.jsx)(z, { invoice: _, onClose: () => v(null) }),
        }),
    ],
  });
}
function F({ label: e, value: t }) {
  return (0, M.jsxs)(`div`, {
    className: `flex justify-between text-sm text-muted-foreground`,
    children: [
      (0, M.jsx)(`span`, { children: e }),
      (0, M.jsx)(`span`, { className: `font-semibold text-foreground`, children: t }),
    ],
  });
}
function I({ label: e, active: t, onClick: n }) {
  return (0, M.jsx)(`button`, {
    onClick: n,
    className:
      `px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ` +
      (t
        ? `bg-primary text-primary-foreground border-primary shadow`
        : `bg-card text-foreground border-border hover:border-primary/40`),
    children: e,
  });
}
function L({ icon: e, label: t, active: n, onClick: r }) {
  return (0, M.jsxs)(`button`, {
    onClick: r,
    className:
      `flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition ` +
      (n
        ? `border-primary bg-primary/5 text-primary`
        : `border-border bg-card text-muted-foreground hover:border-primary/40`),
    children: [e, (0, M.jsx)(`span`, { className: `text-sm font-bold`, children: t })],
  });
}
function R({ children: e, onClose: t }) {
  return (0, M.jsx)(`div`, {
    className: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in`,
    onClick: t,
    children: (0, M.jsx)(`div`, {
      className: `bg-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto`,
      style: { boxShadow: `var(--shadow-elegant)` },
      onClick: (e) => e.stopPropagation(),
      children: e,
    }),
  });
}
function z({ invoice: e, onClose: t }) {
  return (0, M.jsxs)(`div`, {
    className: `p-8`,
    id: `invoice`,
    children: [
      (0, M.jsxs)(`div`, {
        className: `text-center mb-6`,
        children: [
          (0, M.jsx)(`div`, {
            className: `w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-primary-foreground mb-3`,
            style: { background: `var(--gradient-primary)` },
            children: (0, M.jsx)(A, { size: 24 }),
          }),
          (0, M.jsx)(`h3`, { className: `text-2xl font-black`, children: `Juba Restaurant` }),
          (0, M.jsx)(`p`, {
            className: `text-xs text-muted-foreground mt-1`,
            children: `فاتورة ضريبية مبسطة`,
          }),
        ],
      }),
      (0, M.jsxs)(`div`, {
        className: `border-y border-dashed border-border py-3 mb-4 flex justify-between text-sm`,
        children: [
          (0, M.jsxs)(`div`, {
            children: [
              (0, M.jsx)(`div`, {
                className: `text-muted-foreground text-xs`,
                children: `رقم الطلب`,
              }),
              (0, M.jsxs)(`div`, {
                className: `font-black text-lg text-primary`,
                children: [`#`, e.order_number],
              }),
            ],
          }),
          (0, M.jsxs)(`div`, {
            className: `text-left`,
            children: [
              (0, M.jsx)(`div`, {
                className: `text-muted-foreground text-xs`,
                children: `التاريخ`,
              }),
              (0, M.jsx)(`div`, {
                className: `font-semibold`,
                children: new Date(e.created_at).toLocaleString(`ar-EG`, {
                  dateStyle: `short`,
                  timeStyle: `short`,
                }),
              }),
            ],
          }),
        ],
      }),
      (0, M.jsx)(`div`, {
        className: `space-y-2 mb-4`,
        children: e.items.map((e, t) =>
          (0, M.jsxs)(
            `div`,
            {
              className: `flex justify-between text-sm`,
              children: [
                (0, M.jsxs)(`span`, {
                  className: `flex-1`,
                  children: [
                    (0, M.jsxs)(`span`, {
                      className: `text-muted-foreground ml-1`,
                      children: [`×`, e.quantity],
                    }),
                    e.name_ar,
                  ],
                }),
                (0, M.jsxs)(`span`, {
                  className: `font-bold`,
                  children: [(e.price * e.quantity).toFixed(2), ` ج.م`],
                }),
              ],
            },
            t,
          ),
        ),
      }),
      (0, M.jsxs)(`div`, {
        className: `border-t border-dashed border-border pt-3 space-y-2`,
        children: [
          (0, M.jsx)(F, { label: `المجموع الفرعي`, value: `${Number(e.subtotal).toFixed(2)} ج.م` }),
          (0, M.jsx)(F, { label: `الضريبة (14%)`, value: `${Number(e.tax).toFixed(2)} ج.م` }),
          (0, M.jsx)(F, {
            label: `طريقة الدفع`,
            value: { cash: `نقدي`, card: `بطاقة`, wallet: `محفظة` }[e.payment_method],
          }),
          (0, M.jsxs)(`div`, {
            className: `flex justify-between items-baseline pt-2 border-t border-border`,
            children: [
              (0, M.jsx)(`span`, { className: `font-bold`, children: `الإجمالي` }),
              (0, M.jsxs)(`span`, {
                className: `text-2xl font-black text-primary`,
                children: [Number(e.total).toFixed(2), ` ج.م`],
              }),
            ],
          }),
        ],
      }),
      (0, M.jsx)(`p`, {
        className: `text-center text-xs text-muted-foreground mt-6`,
        children: `شكراً لزيارتكم — نتشرّف بخدمتكم دائماً`,
      }),
      (0, M.jsxs)(`div`, {
        className: `mt-6 grid grid-cols-2 gap-3`,
        children: [
          (0, M.jsxs)(`button`, {
            onClick: () => window.print(),
            className: `py-3 rounded-2xl border border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted`,
            children: [(0, M.jsx)(T, { size: 16 }), `طباعة`],
          }),
          (0, M.jsx)(`button`, {
            onClick: t,
            className: `py-3 rounded-2xl text-primary-foreground font-bold text-sm`,
            style: { background: `var(--gradient-primary)` },
            children: `طلب جديد`,
          }),
        ],
      }),
    ],
  });
}
export { P as component };
