import { MenuItem } from "@/shared/types";

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

class TableOrdersStore {
  private orders: TableOrder[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.loadState();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) { this.loadState(); this.notify(); }
      });
      window.addEventListener("table-orders-updated", () => { this.loadState(); this.notify(); });
      window.addEventListener("force_oven_refresh", () => { this.loadState(); this.notify(); });
    }
  }

  private loadState() {
    try {
      if (typeof window === "undefined") { this.orders = []; return; }
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      this.orders = Array.isArray(parsed) ? parsed : [];
    } catch (e) { console.error("Failed to load table orders:", e); this.orders = []; }
  }

  private saveState() {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
      window.dispatchEvent(new Event("table-orders-updated"));
    } catch (e) { console.error("Failed to save table orders:", e); }
  }

  public subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  private notify() { this.listeners.forEach((fn) => fn()); }
  public getAllOrders() { return this.orders; }

  public getOrderByTableId(tableId: string) {
    return this.orders.find((o) => o.table_id === tableId && ["draft", "sent_to_cashier", "in_checkout"].includes(o.status));
  }

  public getPendingCashierOrders() { return this.orders.filter((o) => o.status === "sent_to_cashier"); }

  public saveOrder(orderData: Partial<TableOrder>): TableOrder {
    const now = new Date().toISOString();
    const existingIndex = this.orders.findIndex((o) =>
      (orderData.id && o.id === orderData.id) ||
      (!!orderData.table_id && o.table_id === orderData.table_id && ["draft", "sent_to_cashier", "in_checkout"].includes(o.status))
    );

    if (existingIndex >= 0) {
      const updated = { ...this.orders[existingIndex], ...orderData, updated_at: now } as TableOrder;
      this.orders[existingIndex] = updated;
      this.saveState(); this.notify(); return updated;
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
    this.orders.push(newOrder); this.saveState(); this.notify(); return newOrder;
  }

  public sendOrderToKitchen(orderId: string) {
    const target = this.orders.find((o) => o.id === orderId);
    if (!target) return;
    target.sentToKitchen = true;
    target.kitchenCompleted = false;
    target.kitchenOrderId = target.kitchenOrderId || `KITCHEN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    target.updated_at = new Date().toISOString();
    this.saveState(); this.notify();
  }

  public completeKitchenOrder(orderId: string) {
    const target = this.orders.find((o) => o.id === orderId);
    if (!target) return;
    target.kitchenCompleted = true;
    target.updated_at = new Date().toISOString();
    this.saveState(); this.notify();
  }

  public updateStatus(orderId: string, status: TableOrder["status"]) {
    const target = this.orders.find((o) => o.id === orderId);
    if (!target) return;
    target.status = status;
    target.updated_at = new Date().toISOString();
    this.saveState(); this.notify();
  }

  public removeOrder(orderId: string) {
    this.orders = this.orders.filter((o) => o.id !== orderId);
    this.saveState(); this.notify();
  }

  public clearOrder(tableId: string) { this.clearTableOrder(tableId); }

  public clearTableOrder(tableId: string) {
    this.orders = this.orders.filter((o) => o.table_id !== tableId);
    this.saveState(); this.notify();
  }

  public clearAll() { this.orders = []; this.saveState(); this.notify(); }

  public markKitchenCompletedByTableId(tableId: string) {
    let changed = false;
    this.orders.forEach((o) => {
      if (o.table_id === tableId && o.sentToKitchen && !o.kitchenCompleted) {
        o.kitchenCompleted = true; o.updated_at = new Date().toISOString(); changed = true;
      }
    });
    if (changed) { this.saveState(); this.notify(); }
  }
}

export const tableOrdersStore = new TableOrdersStore();
