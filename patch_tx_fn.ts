import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");
content = content.replace(
  "    relatedId?: string,\n    paymentMethod?: string,\n  ) {",
  "    relatedId?: string,\n    paymentMethod?: string,\n    containerId?: string,\n  ) {",
);
content = content.replace(
  "      payment_method: paymentMethod,",
  "      payment_method: paymentMethod,\n      container_id: containerId,",
);
fs.writeFileSync("src/shared/services/erpStore.ts", content);
