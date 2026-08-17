import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");
content = content.replace(
  "export interface TreasuryAccount {\n  id: string;",
  `export interface TreasuryContainer {
  id: string;
  name: string;
  currency: string;
  balance?: number;
}

export interface TreasuryAccount {
  id: string;
  containers?: TreasuryContainer[];`,
);
fs.writeFileSync("src/shared/services/erpStore.ts", content);
