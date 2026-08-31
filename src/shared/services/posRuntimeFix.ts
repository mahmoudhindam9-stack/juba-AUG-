import { supabase } from "@/integrations/supabase/client";
import { tableOrdersStore } from "./tableOrdersStore";
import { printerService } from "./printerService";

// Keep the existing receipt printer API, but never allow an empty/zero invoice
// object to erase amounts that can be reconstructed from its line items.
const originalPrintReceipt = printerService.printReceipt.bind(printerService);
const originalPrintHtmlWindow = printerService.printHtmlWindow.bind(printerService);

function normalizeReceipt(data: any) {
  if (!data) return data;
  const items = Array.isArray(data.items) ? data.items : [];
  const itemsSubtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item?.price || 0) * Number(item?.quantity || 0),
    0,
  );
  const subtotal = Number(data.subtotal) || itemsSubtotal;
  const discount = Number(data.discount) || 0;
  const serviceFee = Number(data.serviceFee) || 0;
  const deliveryFee = Number(data.deliveryFee) || 0;
  const tax = Number(data.tax) || 0;
  const total =
    Number(data.total) || Math.max(0, subtotal - discount + serviceFee + deliveryFee + tax);
  return { ...data, subtotal, discount, serviceFee, deliveryFee, tax, total };
}

printerService.printReceipt = async (data?: any) => originalPrintReceipt(normalizeReceipt(data));
printerService.printHtmlWindow = (data: any) => originalPrintHtmlWindow(normalizeReceipt(data));

function mirrorOrderToKitchen(order: any) {
  if (!order || !["pending", "in_kitchen"].includes(order.status)) return;

  const items = Array.isArray(order.items) ? order.items : [];
  const localOrder = tableOrdersStore.saveOrder({
    table_id: order.table_id || `pos-${order.id}`,
    table_number: Number(order.table_number || 0),
    table_name: order.table_name || null,
    items: items.map((item: any) => ({
      item: item.item || item,
      quantity: Number(item.quantity || 1),
    })),
    order_type: order.order_type || "dine_in",
    notes: order.notes || "",
    selectedAdditions: [],
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    total: Number(order.total || 0),
    status: "draft",
    sentToKitchen: true,
    kitchenCompleted: false,
    is_self_order: false,
  });

  if (localOrder && !localOrder.kitchenCompleted) {
    tableOrdersStore.sendOrderToKitchen(localOrder.id);
  }
}

if (typeof window !== "undefined") {
  const channel = supabase
    .channel("restocash_pos_oven_bridge")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      ({ new: order }) => {
        mirrorOrderToKitchen(order);
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders" },
      ({ new: order }) => {
        if (order?.status === "served" && order?.table_id) {
          tableOrdersStore.markKitchenCompletedByTableId(order.table_id);
        } else {
          mirrorOrderToKitchen(order);
        }
      },
    )
    .subscribe();

  void channel;
}
