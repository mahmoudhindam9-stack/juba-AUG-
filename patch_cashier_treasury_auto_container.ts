import fs from "fs";

let content = fs.readFileSync("src/routes/cashier-treasury.tsx", "utf8");

const useEffectSnippet = `
  useEffect(() => {
    if (refundOrderDialog && refundTreasury === "tr-1") {
      const payment = refundOrderDialog.payment_method;
      const currency = refundOrderDialog.currency || "EGP";
      
      if (payment === "cash" && currency === "SSP") setRefundContainer("cnt-cash-ssp");
      else if (payment === "wallet" && currency === "SSP") setRefundContainer("cnt-wallet-ssp");
      else if (payment === "card" && currency === "USD") setRefundContainer("cnt-card-usd");
      else if (payment === "cash" && currency === "USD") setRefundContainer("cnt-cash-usd");
      else if (payment === "cash" && currency === "EGP") setRefundContainer("cnt-cash-egp");
      else setRefundContainer("");
    }
  }, [refundOrderDialog, refundTreasury]);
`;

// Insert the useEffectSnippet after refundContainer state definition
content = content.replace(
  '  const [refundContainer, setRefundContainer] = useState<string>("");',
  '  const [refundContainer, setRefundContainer] = useState<string>("");\n' + useEffectSnippet,
);

fs.writeFileSync("src/routes/cashier-treasury.tsx", content);
