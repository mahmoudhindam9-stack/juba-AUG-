import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

content = content.replace(
  /id: "tr-1",\n {4}branch_id: "branch-1",\n {4}name_ar: "خزينة الكاشير",\n {4}type: "cash",\n {4}currency: "EGP",\n {4}linked_to_restaurant: true,\n {4}balance: 15000,\n {4}is_open: true,\n {4}opening_balance: 15000,\n {4}available_balance: 15000,\n {4}responsible_employee: "أحمد علي",\n {4}status: "active",\n {4}deleted: false,\n {2}},/,
  `id: "tr-1",
    branch_id: "branch-1",
    name_ar: "خزينة الكاشير",
    type: "cash",
    currency: "MULTI",
    linked_to_restaurant: true,
    balance: 15000,
    is_open: true,
    opening_balance: 15000,
    available_balance: 15000,
    responsible_employee: "أحمد علي",
    status: "active",
    deleted: false,
    containers: [
      { id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },
      { id: "cnt-card-usd", name: "فيزا دولار", currency: "USD", balance: 0 },
      { id: "cnt-cash-usd", name: "كاش دولار", currency: "USD", balance: 0 },
      { id: "cnt-cash-egp", name: "كاش مصري", currency: "EGP", balance: 15000 }
    ]
  },`,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
