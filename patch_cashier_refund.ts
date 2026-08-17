import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  'const [refundContainer, setRefundContainer] = useState<string>("");',
  `const [refundContainer, setRefundContainer] = useState<string>("");
  const [customRefundAmount, setCustomRefundAmount] = useState<number>(0);
  const [customRefundCurrency, setCustomRefundCurrency] = useState<string>("EGP");
  const [customRefundPaymentMethod, setCustomRefundPaymentMethod] = useState<string>("cash");`,
);

content = content.replace(
  "setRefundOrderDialog(order);",
  `setRefundOrderDialog(order);
                              setCustomRefundAmount(getOrderOriginalAmount(order, exchangeRates, erpState.treasuryTransactions));
                              setCustomRefundCurrency(getOrderCurrency(order, erpState.treasuryTransactions));
                              setCustomRefundPaymentMethod(order.payment_method || "cash");`,
);

fs.writeFileSync(path, content, "utf8");
