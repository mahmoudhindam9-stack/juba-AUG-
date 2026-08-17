import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

const oldContainers = `{ id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },`;

const newContainers = `{ id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-card-ssp", name: "فيزا سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-wallet-usd", name: "محفظة دولار", currency: "USD", balance: 0 },`;

content = content.replace(
  /\{ id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 \},\s*\{ id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 \},/g,
  newContainers,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
