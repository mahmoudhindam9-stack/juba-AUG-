import fs from "fs";
let content = fs.readFileSync("src/routes/cashier-treasury.tsx", "utf8");

content = content.replace(
  / {8}"tr-1",\n {8}"withdrawal",/g,
  '        cashierTreasuryId,\n        "withdrawal",',
);

fs.writeFileSync("src/routes/cashier-treasury.tsx", content);
