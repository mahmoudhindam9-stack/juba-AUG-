import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching orders...");
  const { data, error } = await supabase.from("orders").select("*");
  if (error) {
    console.error("Fetch error:", error);
    return;
  }
  console.log("Total orders found:", data.length);

  const pendingOrders = data.filter(
    (o) => o.status === "pending" || o.status === "in_kitchen" || o.status === "draft",
  );
  console.log("Pending orders to delete:", pendingOrders.length);

  if (pendingOrders.length > 0) {
    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .in(
        "id",
        pendingOrders.map((o) => o.id),
      );
    if (deleteError) {
      console.error("Delete error:", deleteError);
    } else {
      console.log("Successfully deleted pending orders!");
    }
  }
}

run();
