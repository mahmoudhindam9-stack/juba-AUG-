import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

const replacement = `  useEffect(() => {
    if (selectedTreasury === "tr-1") {
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
  /useEffect\(\(\) => \{\s*if \(selectedTreasury === "tr-1"\) \{[\s\S]*?else setSelectedContainer\(""\);\s*\}\s*\}, \[payment, currency, selectedTreasury\]\);/g,
  replacement,
);

fs.writeFileSync("src/routes/index.tsx", content);
