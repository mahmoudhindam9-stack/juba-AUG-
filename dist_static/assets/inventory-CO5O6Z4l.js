import { i as e, o as t, r as n, t as r } from "./client-C2Div8lN.js";
import { t as i } from "./useQuery-D8gK3K9x.js";
import { t as a } from "./useMutation-CTdn_-aq.js";
import { t as o } from "./index-D35RyiWQ.js";
var s = t(e()),
  c = n();
function l() {
  let e = o(),
    [t, n] = (0, s.useState)(null),
    [l, u] = (0, s.useState)({}),
    d = i({
      queryKey: [`inventory_items`],
      queryFn: async () => {
        for (let e of [`inventory`, `stock`]) {
          let { data: t, error: n } = await r.from(e).select(`*`);
          if (!n && t && t.length > 0) return { table: e, rows: t };
        }
        return { table: null, rows: [] };
      },
    }),
    f = d.data?.rows ?? [],
    p = d.data?.table ?? null,
    m = (0, s.useMemo)(() => (f[0] ? Object.keys(f[0]) : []), [f]),
    h = (0, s.useMemo)(() => m.find((e) => e.toLowerCase() === `id`) ?? m[0] ?? `id`, [m]),
    g = (0, s.useMemo)(
      () => m.filter((e) => /quantity|qty|count|stock|amount|available|balance/i.test(e)),
      [m],
    ),
    _ = a(
      async ({ rowId: e, changes: t }) => {
        if (!p) throw Error(`No inventory table available`);
        let n = { ...t },
          { data: i, error: a } = await r.from(p).update(n).eq(h, e).select();
        if (a) throw a;
        return i;
      },
      { onSuccess: () => e.invalidateQueries({ queryKey: [`inventory_items`] }) },
    );
  return d.isLoading
    ? (0, c.jsx)(`div`, { className: `p-8`, children: `جاري التحميل…` })
    : !p || f.length === 0
      ? (0, c.jsxs)(`div`, {
          className: `p-8`,
          children: [
            (0, c.jsx)(`h1`, { className: `text-2xl font-bold mb-4`, children: `جرد المخزن` }),
            (0, c.jsx)(`div`, {
              children:
                "لم يتم العثور على بيانات جرد (جرب إنشاء جدول `inventory` أو `stock` في قاعدة البيانات).",
            }),
          ],
        })
      : (0, c.jsxs)(`div`, {
          className: `p-8`,
          children: [
            (0, c.jsxs)(`div`, {
              className: `flex items-center justify-between mb-6`,
              children: [
                (0, c.jsxs)(`h1`, {
                  className: `text-2xl font-bold`,
                  children: [`جرد المخزن (`, p, `)`],
                }),
                (0, c.jsx)(`div`, {
                  className: `flex items-center gap-2`,
                  children: (0, c.jsx)(`button`, {
                    onClick: async () => {
                      let e = Object.entries(l);
                      for (let [t, n] of e)
                        try {
                          await _.mutateAsync({ rowId: t, changes: n });
                        } catch (e) {
                          (console.error(e), alert(`فشل حفظ السطر ${t}: ${e.message}`));
                        }
                      u({});
                    },
                    disabled: Object.keys(l).length === 0,
                    className: `px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-60`,
                    children: `حفظ التغييرات`,
                  }),
                }),
              ],
            }),
            (0, c.jsx)(`div`, {
              className: `overflow-auto`,
              children: (0, c.jsxs)(`table`, {
                className: `w-full text-sm`,
                children: [
                  (0, c.jsx)(`thead`, {
                    children: (0, c.jsxs)(`tr`, {
                      className: `text-left`,
                      children: [
                        m.map((e) =>
                          (0, c.jsx)(
                            `th`,
                            { className: `py-2 pr-4 font-semibold`, children: e },
                            e,
                          ),
                        ),
                        (0, c.jsx)(`th`, {
                          className: `py-2 pr-4 font-semibold`,
                          children: `الإجراءات`,
                        }),
                      ],
                    }),
                  }),
                  (0, c.jsx)(`tbody`, {
                    children: f.map((e, t) => {
                      let n = String(e[h]),
                        r = l[n] ?? {};
                      return (0, c.jsxs)(
                        `tr`,
                        {
                          className: `border-t`,
                          children: [
                            m.map((t) => {
                              let i = r[t] ?? e[t];
                              return g.includes(t)
                                ? (0, c.jsx)(
                                    `td`,
                                    {
                                      className: `py-2 pr-4`,
                                      children: (0, c.jsx)(`input`, {
                                        type: `number`,
                                        value: i ?? ``,
                                        onChange: (e) => {
                                          let r =
                                            e.target.value === `` ? null : Number(e.target.value);
                                          u((e) => ({ ...e, [n]: { ...(e[n] ?? {}), [t]: r } }));
                                        },
                                        className: `w-24 border rounded px-2 py-1`,
                                      }),
                                    },
                                    t,
                                  )
                                : (0, c.jsx)(
                                    `td`,
                                    { className: `py-2 pr-4`, children: String(i ?? ``) },
                                    t,
                                  );
                            }),
                            (0, c.jsx)(`td`, {
                              className: `py-2 pr-4`,
                              children: (0, c.jsxs)(`div`, {
                                className: `flex items-center gap-2`,
                                children: [
                                  (0, c.jsx)(`button`, {
                                    onClick: async () => {
                                      let e = l[n] ?? {};
                                      if (Object.keys(e).length === 0) {
                                        alert(`لا توجد تغييرات لحفظ هذا السطر`);
                                        return;
                                      }
                                      try {
                                        (await _.mutateAsync({ rowId: n, changes: e }),
                                          u((e) => {
                                            let t = { ...e };
                                            return (delete t[n], t);
                                          }),
                                          alert(`تم الحفظ`));
                                      } catch (e) {
                                        alert(`فشل الحفظ: ${e.message}`);
                                      }
                                    },
                                    className: `px-3 py-1 rounded bg-primary text-primary-foreground text-sm`,
                                    children: `حفظ`,
                                  }),
                                  (0, c.jsx)(`button`, {
                                    onClick: () =>
                                      u((e) => {
                                        let t = { ...e };
                                        return (delete t[n], t);
                                      }),
                                    className: `px-3 py-1 rounded border text-sm`,
                                    children: `إلغاء`,
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        n,
                      );
                    }),
                  }),
                ],
              }),
            }),
          ],
        });
}
export { l as component };
