import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "served" })
    .eq("id", "20692abf-3adb-472e-9cb7-67ed41e2f716")
    .select();
  console.log("Data:", data);
  console.log("Error:", error);
}

run();
