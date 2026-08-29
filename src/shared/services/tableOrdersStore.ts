import { MenuItem } from "@/shared/types";
import { supabase } from "@/integrations/supabase/client";

export interface TableCartLine {
  item: MenuItem;
  quantity: number;
  notes?: string;
  selectedAdditions?: any[];
}

export interface TableOrder {
  id: string;
  table_id: string;
  table_number: number;
  table_name?: string | null;
  items: TableCartLine[];
  order_type: "dine_in" | "takeaway" | "delivery";
  notes: string;
  selectedAdditions: string[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent_to_cashier" | "in_checkout" | "completed" | "cancelled";
  sentToKitchen?: boolean;
  kitchenCompleted?: boolean;
  kitchenOrderId?: string;
  is_self_order?: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "restocash_table_orders_v1";
const OVEN_CHANNEL = "oven_orders_channel";

class TableOrdersStore {
  private orders: TableOrder[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.loadState();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) {
          this.loadState();
          this.notify();
        }
      });
      window.addEventListener("table-orders-updated", () => {
        this.loadState();
        this.notify();
      });
      window.addEventListener("force_oven_refresh", () => {
        this.loadState();
        this.notify();
      });
    }
  }

  private loadState() {
    try {
      if (typeof window === "undefined" || typeof localStorage === "undefined") {
        this.orders = [];
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      this.orders = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load table orders:", e);
      this.orders = [];
    }
  }

  private saveState() {
    try {
      if (typeof window === "undefined" || typeof localStorage === "undefined") return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
      window.dispatchEvent(new Event("table-orders-updated"));
      window.dispatchEvent(new Event("force_oven_refresh"));
    } catch (e) {
      console.error("Failed to save table orders:", e);
    }
  }

  private broadcastKitchenOrder(order: TableOrder) {
    void (async () => {
      try {
        const channel = supabase.channel(OVEN_CHANNEL);
        await new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (!settled) {
              settled = true;
              resolve();
            }
          };
          channel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              try {
                await channel.send({
                  type: "broadcast",
                  event: "NEW_OVEN_ORDER",
                  payload: {
                    order_id: order.kitchenOrderId || order.id,
                    table_id: order.table_id,
                    table_number: order.table_number,
                    order_type: order.order_type,
                    notes: order.notes,
                    items: order.items,
                    subtotal: Number(order.subtotal || 0),
                    tax: Number(order.tax || 0),
                    total: Number(order.total || 0),
                    created_at: order.created_at,
                  },
                });
              } finally {
                supabase.removeChannel(channel);
                finish();
              }
            }
          });
          setTimeout(() => {
            supabase.removeChannel(channel);
            finish();
          }, 5000);
        });
      } catch (error) {
        console.warn("Kitchen broadcast failed; database/local bridge remains active:", error);
      }
    })();
  }

  private persistKitchenOrderToDatabase(order: TableOrder) {
    if (!order.sentToKitchen || order.kitchenOrderId) return;

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .insert({
            subtotal: Number(order.subtotal || 0),
            tax: Number(order.tax || 0),
            total: Number(order.total || 0),
            payment_method: "cash",
            order_type: order.order_type,
            table_id: order.table_id && /^[0-9a-fA-F-]{36}$/.test(order.table_id) ? order.table_id : null,
            status: "pending",
            notes: order.notes || null,
            items: (order.items || []).map((line: any) => ({
              id: line?.item?.id || line?.id,
              menu_item_id: line?.item?.id || line?.menu_item_id || line?.id,
              name_ar: line?.item?.name_ar || line?.name_ar || line?.name || "صنف",
              price: Number(line?.item?.price ?? line?.price ?? 0),
              quantity: Number(line?.quantity ?? 1),
              requires_oven: Boolean(line?.item?.requires_oven ?? line?.requires_oven),
            })),
          })
          .select("id")
          .single();

        if (error || !data?.id) {
          console.warn("Could not persist kitchen order to Supabase:", error);
          this.broadcastKitchenOrder(order);
          return;
        }

        const index = this.orders.findIndex((o) => o.id === order.id);
        if (index >= 0) {
          this.orders[index] = {
            ...this.orders[index],
            kitchenOrderId: data.id,
            updated_at: new Date().toISOString(),
          };
          this.saveState();
          this.broadcastKitchenOrder(this.orders[index]);
        }
      } catch (error) {
        console.warn("Kitchen DB bridge failed; keeping local order:", error);
        this.broadcastKitchenOrder(order);
      }
    })();
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getAllOrders() {
    return this.orders;
  }

  public getOrderByTableId(tableId: string) {
    return this.orders.find(
      (o) =>
        o.table_id === tableId &&
        ["draft", "sent_to_cashier", "in_checkout"].includes(o.status),
    );
  }

  public getPendingCashierOrders() {
    return this.orders.filter((o) => o.status === "sent_to_cashier");
  }

  public saveOrder(orderData: Partial<TableOrder>): TableOrder {
    const now = new Date().toISOString();
    const existingIndex = this.orders.findIndex(
      (o) =>
        (orderData.id && o.id === orderData.id) ||
        (!!orderData.table_id &&
          o.table_id === orderData.table_id &&
          ["draft", "sent_to_cashier", "in_checkout"].includes(o.status)),
    );

    if (existingIndex >= 0) {
      const updated = {
        ...this.orders[existingIndex],
        ...orderData,
        subtotal: Number(orderData.subtotal ?? this.orders[existingIndex].subtotal ?? 0),
        tax: Number(orderData.tax ?? this.orders[existingIndex].tax ?? 0),
        total: Number(orderData.total ?? this.orders[existingIndex].total ?? 0),
        updated_at: now,
      } as TableOrder;
      this.orders[existingIndex] = updated;
      this.saveState();
      this.notify();
      if (updated.sentToKitchen) {
        this.persistKitchenOrderToDatabase(updated);
        this.broadcastKitchenOrder(updated);
      }
      return updated;
    }

    const newOrder: TableOrder = {
      id: orderData.id || `tbl-ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      table_id: orderData.table_id || "",
      table_number: Number(orderData.table_number ?? 0),
      table_name: orderData.table_name ?? "",
      items: orderData.items || [],
      order_type: orderData.order_type || "dine_in",
      notes: orderData.notes || "",
      selectedAdditions: orderData.selectedAdditions || [],
      subtotal: Number(orderData.subtotal ?? 0),
      tax: Number(orderData.tax ?? 0),
      total: Number(orderData.total ?? 0),
      status: orderData.status || "draft",
      sentToKitchen: Boolean(orderData.sentToKitchen),
      kitchenCompleted: Boolean(orderData.kitchenCompleted),
      kitchenOrderId: orderData.kitchenOrderId,
      is_self_order: Boolean(orderData.is_self_order),
      created_at: orderData.created_at || now,
      updated_at: now,
    };

    this.orders.push(newOrder);
    this.saveState();
    this.notify();

    if (newOrder.sentToKitchen) {
      this.persistKitchenOrderToDatabase(newOrder);
      this.broadcastKitchenOrder(newOrder);
    }

    return newOrder;
  }

  public sendOrderToKitchen(orderId: string) {
    const target = this.orders.find((o) => o.id === orderId);
    if (!target) return;
    target.sentToKitchen = true;
    target.kitchenCompleted = false;
    target.kitchenOrderId = target.kitchenOrderId || undefined;
    target.updated_at = new Date().toISOString();
    this.saveState();
    this.notify();
    this.persistKitchenOrderToDatabase(target);
    this.broadcastKitchenOrder(target);
  }

  public completeKitchenOrder(orderId: string) {
    const target = this.orders.find((o) => o.id === orderId);
    if (!target) return;
    target.kitchenCompleted = true;
    target.updated_at = new Date().toISOString();
    this.saveState();
    this.notify();
  }

  public updateStatus(orderId: string, status: TableOrder["status"]) {
    const target = this.orders.find((o) => o.id === orderId);
    if (!target) return;
    target.status = status;
    target.updated_at = new Date().toISOString();
    this.saveState();
    this.notify();
  }

  public removeOrder(orderId: string) {
    this.orders = this.orders.filter((o) => o.id !== orderId);
    this.saveState();
    this.notify();
  }

  public clearOrder(tableId: string) {
    this.clearTableOrder(tableId);
  }

  public clearTableOrder(tableId: string) {
    this.orders = this.orders.filter((o) => o.table_id !== tableId);
    this.saveState();
    this.notify();
  }

  public clearAll() {
    this.orders = [];
    this.saveState();
    this.notify();
  }

  public markKitchenCompletedByTableId(tableId: string) {
    let changed = false;
    this.orders.forEach((o) => {
      if (o.table_id === tableId && o.sentToKitchen && !o.kitchenCompleted) {
        o.kitchenCompleted = true;
        o.updated_at = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) {
      this.saveState();
      this.notify();
    }
  }
}

export const tableOrdersStore = new TableOrdersStore();
