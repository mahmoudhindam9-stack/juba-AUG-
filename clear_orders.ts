import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearOrders() {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .in("status", ["pending", "preparing", "ready"]);
  console.log("Cleared orders:", data, error);
}
clearOrders();
