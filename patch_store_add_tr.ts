import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

content = content.replace(
  `  addTreasury(
    name_ar: string,
    type: "cash" | "bank",
    currency: string,
    openingBalance = 0,
    employee = "غير محدد",
  ) {
    const treasury: TreasuryAccount = {
      id: "tr-" + Date.now(),
      branch_id: this.state.currentBranchId,
      name_ar,
      type,
      currency,
      balance: openingBalance,
      is_open: true,
      opening_balance: openingBalance,
      available_balance: openingBalance,
      responsible_employee: employee,
      status: "active",
      deleted: false,
    };`,
  `  addTreasury(
    name_ar: string,
    type: "cash" | "bank",
    currency: string,
    openingBalance = 0,
    employee = "غير محدد",
    containers: TreasuryContainer[] = [],
    linked_to_restaurant = false,
  ) {
    const treasury: TreasuryAccount = {
      id: "tr-" + Date.now(),
      branch_id: this.state.currentBranchId,
      name_ar,
      type,
      currency,
      balance: openingBalance,
      is_open: true,
      opening_balance: openingBalance,
      available_balance: openingBalance,
      responsible_employee: employee,
      status: "active",
      deleted: false,
      containers,
      linked_to_restaurant,
    };`,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
