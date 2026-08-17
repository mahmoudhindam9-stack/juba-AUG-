const fs = require("fs");
const path = "src/routes/oven.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  /const fetchPendingOrders = async \(\) => \{[\s\S]*?setOrders\(combined\);\n  \};/g,
  `const fetchPendingOrders = async () => {
    try {
      let dbOrders: any[] = [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or("status.eq.pending,status.eq.in_kitchen")
        .order("created_at", { ascending: true });

      if (!error && data) {
        dbOrders = data;
      }

      // Merge with local table orders store that are sent to kitchen and not completed
      const allLocal = tableOrdersStore.getAllOrders();
      const localStoreOrders = allLocal
        .filter(
          (o) =>
            (o.status === "draft" || o.status === "sent_to_cashier") &&
            o.sentToKitchen &&
            !o.kitchenCompleted,
        )
        .map((lo) => ({
          id: lo.kitchenOrderId || lo.id,
          table_id: lo.table_id,
          table_number: lo.table_number,
          order_type: lo.order_type || "dine_in",
          status: "pending",
          notes: lo.notes || \`طاولة #\${lo.table_number}\`,
          created_at: lo.created_at || new Date().toISOString(),
          items: Array.isArray(lo.items) ? lo.items.map((i) => ({
            id: i?.item?.id || i?.id || Math.random().toString(),
            name_ar: i?.item?.name_ar || i?.name_ar || "عنصر غير معروف",
            quantity: i?.quantity || 1,
            requires_oven: i?.item?.requires_oven || i?.requires_oven || false,
          })) : [],
          isLocalStore: true,
          localStoreId: lo.id,
        }));

      // Combine and deduplicate
      const dbOrderIds = new Set(dbOrders.map((o) => o.id));
      const extraLocal = localStoreOrders.filter((l) => !dbOrderIds.has(l.id));

      const combined = [...dbOrders, ...extraLocal].sort(
        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
      );

      setOrders(combined);
    } catch (err) {
      console.error("fetchPendingOrders completely failed:", err);
    }
  };`,
);

fs.writeFileSync(path, content, "utf8");
