import fs from "fs";

let content = fs.readFileSync("src/routes/index.tsx", "utf8");
content = content.replace(
  '        table_id: orderType === "dine_in" ? selectedTable || null : null,\n        status: "pending",\n        notes: combinedNotes || null,',
  '        table_id: orderType === "dine_in" ? selectedTable || null : null,\n        status: "pending",\n        notes: combinedNotes || null,\n        currency: currency,',
);

// We should also check the select query when fetching orders to include 'currency'
content = content.replace(
  '      .select("order_number,subtotal,tax,total,payment_method,order_type,status,items,created_at")',
  '      .select("order_number,subtotal,tax,total,payment_method,order_type,status,items,created_at,currency")',
);

fs.writeFileSync("src/routes/index.tsx", content);
