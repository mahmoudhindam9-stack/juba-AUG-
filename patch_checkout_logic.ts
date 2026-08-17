import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

// 1. Update useEffect container selection
const newEffect = `
  useEffect(() => {
    const treasury = erpStore.getState().treasuries.find((t) => t.id === selectedTreasury);
    if (treasury && treasury.containers) {
      if (payment === "cash" && currency === "SSP") setSelectedContainer("cnt-cash-ssp");
      else if (payment === "wallet" && currency === "SSP") setSelectedContainer("cnt-wallet-ssp");
      else if (payment === "card" && currency === "SSP") setSelectedContainer("cnt-card-ssp");
      else if (payment === "cash" && currency === "USD") setSelectedContainer("cnt-cash-usd");
      else if (payment === "card" && currency === "USD") setSelectedContainer("cnt-card-usd");
      else if (payment === "wallet" && currency === "USD") setSelectedContainer("cnt-wallet-usd");
      else if (payment === "cash" && currency === "EGP") setSelectedContainer("cnt-cash-egp");
      else if (payment === "card" && currency === "EGP") setSelectedContainer("cnt-card-egp");
      else if (payment === "wallet" && currency === "EGP") setSelectedContainer("cnt-wallet-egp");
      else setSelectedContainer("");
    }
  }, [payment, currency, selectedTreasury]);
`;

content = content.replace(
  / {2}useEffect\(\(\) => \{\n {4}const treasury = erpStore\.getState\(\)\.treasuries\.find\(\(t\) => t\.id === selectedTreasury\);\n {4}if \(treasury && treasury\.containers\) \{[\s\S]*? {4}\}\n {2}\}, \[payment, currency, selectedTreasury\]\);/m,
  newEffect.trim(),
);

// 2. Update disable logic in Confirm Order button
const newDisabled =
  'disabled={placeOrder.isPending || (orderType === "dine_in" && !selectedTable) || (payment === "card" && !authNumber) || (payment === "wallet" && !mobileNumber)}';

content = content.replace(
  /disabled=\{placeOrder\.isPending \|\| \(orderType === "dine_in" && !selectedTable\)\}/,
  newDisabled,
);

fs.writeFileSync("src/routes/index.tsx", content);
