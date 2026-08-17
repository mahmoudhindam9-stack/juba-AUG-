import { SupabaseClient } from "@supabase/supabase-js";
declare const supabase: SupabaseClient<any, "public", any>;
supabase.from("recipes" as any).upsert({});
