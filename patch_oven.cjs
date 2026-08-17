const fs = require("fs");
const path = "src/routes/oven.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  /const markAsCompleted = async \(order: any\) => \{[\s\S]*?fetchPendingOrders\(\);\n    \} catch \(e: any\) \{/g,
  `const markAsCompleted = async (order: any) => {
    try {
      console.log("markAsCompleted called with order:", order);
      if (order.id && !order.isLocalStore) {
        const { error } = await supabase.from("orders").update({ status: "served" }).eq("id", order.id);
        if (error) {
          console.error("Supabase error updating status:", error);
          throw error;
        }
      }
      if (order.table_id) {
        tableOrdersStore.markKitchenCompletedByTableId(order.table_id);
      }
      toast({ title: "الطلب جاهز! 👨‍🍳", description: "تم تحديث حالة الطلب إلى مكتمل/تم التقديم." });
      fetchPendingOrders();
    } catch (e: any) {`,
);

content = content.replace(
  /const deleteSingleOrder = async \(order: any\) => \{[\s\S]*?fetchPendingOrders\(\);\n    \} catch \(e: any\) \{/g,
  `const deleteSingleOrder = async (order: any) => {
    try {
      console.log("deleteSingleOrder called with order:", order);
      if (!order.isLocalStore) {
        const { error } = await supabase.from("orders").delete().eq("id", order.id);
        if (error) {
          console.error("Supabase error deleting order:", error);
          throw error;
        }
      }
      if (order.table_id) {
        // Just remove from oven view by marking kitchen as completed, do not destroy the table order
        tableOrdersStore.markKitchenCompletedByTableId(order.table_id);
      }
      toast({ title: "تم الحذف", description: "تم حذف الطلب بنجاح." });
      fetchPendingOrders();
    } catch (e: any) {`,
);

fs.writeFileSync(path, content, "utf8");
