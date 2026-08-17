import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

content = content.replace(/treasuryId: string = "tr-1"/g, 'treasuryId: string = "tr-300"');

fs.writeFileSync("src/shared/services/erpStore.ts", content);
