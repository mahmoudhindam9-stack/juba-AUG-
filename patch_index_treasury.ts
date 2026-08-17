import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

const replacementState = `
  const initialTreasury = erpStore.getState().treasuries.find(t => t.linked_to_restaurant)?.id || "tr-300";
  const [selectedTreasury, setSelectedTreasury] = useState<string>(initialTreasury);`;

content = content.replace(
  / {2}const \[selectedTreasury, setSelectedTreasury\] = useState<string>\("tr-1"\);/g,
  replacementState,
);

const replacementEffect = `
  useEffect(() => {
    const treasury = erpStore.getState().treasuries.find(t => t.id === selectedTreasury);
    if (treasury && treasury.containers) {
      if (payment === "cash" && currency === "SSP") setSelectedContainer("cnt-cash-ssp");
      else if (payment === "wallet" && currency === "SSP") setSelectedContainer("cnt-wallet-ssp");
      else if (payment === "card" && currency === "USD") setSelectedContainer("cnt-card-usd");
      else if (payment === "cash" && currency === "USD") setSelectedContainer("cnt-cash-usd");
      else if (payment === "cash" && currency === "EGP") setSelectedContainer("cnt-cash-egp");
      else if (payment === "card" && currency === "EGP") setSelectedContainer("cnt-card-egp");
      else if (payment === "wallet" && currency === "EGP") setSelectedContainer("cnt-wallet-egp");
      else setSelectedContainer("");
    }
  }, [payment, currency, selectedTreasury]);`;

content = content.replace(
  / {2}useEffect\(\(\) => \{\s*if \(selectedTreasury === "tr-1"\) \{[\s\S]*?else setSelectedContainer\(""\);\s*\}\s*\}, \[payment, currency, selectedTreasury\]\);/g,
  replacementEffect,
);

fs.writeFileSync("src/routes/index.tsx", content);
