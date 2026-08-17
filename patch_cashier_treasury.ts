import fs from "fs";
let content = fs.readFileSync("src/routes/cashier-treasury.tsx", "utf8");

// 1. Initial State
content = content.replace(
  /const \[refundTreasury, setRefundTreasury\] = useState<string>\("tr-1"\);/g,
  'const [refundTreasury, setRefundTreasury] = useState<string>(erpStore.getState().treasuries.find(t => t.linked_to_restaurant)?.id || "tr-300");',
);

// 2. Effect
content = content.replace(
  /if \(refundOrderDialog && refundTreasury === "tr-1"\)/g,
  'if (refundOrderDialog && refundTreasury === (erpStore.getState().treasuries.find(t => t.linked_to_restaurant)?.id || "tr-300"))',
);

// 3. Finding Cashier Treasury
const replacement3 = `
  const cashierTreasuryId = erpState.treasuries.find((t) => t.linked_to_restaurant)?.id || "tr-300";
  const cashierTreasury = erpState.treasuries.find((t) => t.id === cashierTreasuryId) || {
    id: cashierTreasuryId,`;

content = content.replace(
  / {2}const cashierTreasury = erpState\.treasuries\.find\(\(t\) => t\.id === "tr-1"\) \|\| \{\n {4}id: "tr-1",/g,
  replacement3,
);

// 4. Filtering Transactions
content = content.replace(
  /const transactions = erpState\.treasuryTransactions\.filter\(\(tx\) => tx\.treasury_id === "tr-1"\);/g,
  "const transactions = erpState.treasuryTransactions.filter((tx) => tx.treasury_id === cashierTreasuryId);",
);

// 5. In postSalesReturnJournal (Wait, does postSalesReturnJournal have a default "tr-1"?)
content = content.replace(
  / {8}"tr-1",\n {8}refundContainer/g,
  "        cashierTreasuryId,\n        refundContainer",
);

fs.writeFileSync("src/routes/cashier-treasury.tsx", content);
