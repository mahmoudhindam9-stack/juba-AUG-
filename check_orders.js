import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from("orders").select("*");
  console.log("Total orders:", data?.length);
  const pending = data?.filter((o) => o.status === "pending");
  console.log("Pending orders:", pending?.length);
}

run();
