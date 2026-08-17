import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

content = content.replace(
  /"order_number,subtotal,tax,total,payment_method,order_type,status,items,created_at,currency"/g,
  '"order_number,subtotal,tax,total,payment_method,order_type,status,items,created_at"',
);

fs.writeFileSync("src/routes/index.tsx", content);
