import fs from "fs";

let content = fs.readFileSync("src/routes/index.tsx", "utf8");

if (!content.includes("import { useMemo, useState, useEffect }")) {
  content = content.replace(
    'import { useMemo, useState } from "react";',
    'import { useMemo, useState, useEffect } from "react";',
  );
}

const useEffectSnippet = `
  useEffect(() => {
    if (selectedTreasury === "tr-1") {
      if (payment === "cash" && currency === "SSP") setSelectedContainer("cnt-cash-ssp");
      else if (payment === "wallet" && currency === "SSP") setSelectedContainer("cnt-wallet-ssp");
      else if (payment === "card" && currency === "USD") setSelectedContainer("cnt-card-usd");
      else if (payment === "cash" && currency === "USD") setSelectedContainer("cnt-cash-usd");
      else if (payment === "cash" && currency === "EGP") setSelectedContainer("cnt-cash-egp");
      else setSelectedContainer("");
    }
  }, [payment, currency, selectedTreasury]);
`;

// Insert after selectedContainer state definition
content = content.replace(
  '  const [selectedContainer, setSelectedContainer] = useState<string>("");',
  '  const [selectedContainer, setSelectedContainer] = useState<string>("");\n' + useEffectSnippet,
);

fs.writeFileSync("src/routes/index.tsx", content);
