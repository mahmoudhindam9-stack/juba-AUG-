import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");
content = content.replace(
  '  treasury_id: string;\n  type: "deposit"',
  '  treasury_id: string;\n  container_id?: string;\n  type: "deposit"',
);
fs.writeFileSync("src/shared/services/erpStore.ts", content);
