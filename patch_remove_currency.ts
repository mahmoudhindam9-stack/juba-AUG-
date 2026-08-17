import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

// Remove from payload
content = content.replace(
  '        status: "pending",\n        notes: combinedNotes || null,\n        currency: currency,',
  '        status: "pending",\n        notes: combinedNotes || null,',
);

// Remove from select
content = content.replace(
  '      .select("order_number,subtotal,tax,total,payment_method,order_type,status,items,created_at,currency")',
  '      .select("order_number,subtotal,tax,total,payment_method,order_type,status,items,created_at")',
);

fs.writeFileSync("src/routes/index.tsx", content);
