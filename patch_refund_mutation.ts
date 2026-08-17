import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `  // Refund mutation linked directly to order and its original currency
  const refundMutation = useMutation({
    mutationFn: async ({
      order,
      treasuryId,
      containerId,
      reason,
    }: {
      order: Order;
      treasuryId: string;
      containerId: string;
      reason?: string;
    }) => {
      const orderCurrency = getOrderCurrency(order, erpState.treasuryTransactions);
      const refundAmount = getOrderOriginalAmount(
        order,
        exchangeRates,
        erpState.treasuryTransactions,
      );`,
  `  // Refund mutation linked directly to order and its original currency
  const refundMutation = useMutation({
    mutationFn: async ({
      order,
      treasuryId,
      containerId,
      reason,
      amount,
      currency,
      paymentMethod
    }: {
      order: Order;
      treasuryId: string;
      containerId: string;
      reason?: string;
      amount: number;
      currency: string;
      paymentMethod: string;
    }) => {
      const orderCurrency = currency;
      const refundAmount = amount;`,
);

content = content.replace(
  `      erpStore.postSalesReturnJournal(
        order.order_number,
        refundAmount,
        order.payment_method || "cash",`,
  `      erpStore.postSalesReturnJournal(
        order.order_number,
        refundAmount,
        paymentMethod,`,
);

content = content.replace(
  `    onSuccess: (_, { order }) => {
      const orderCurrency = getOrderCurrency(order, erpState.treasuryTransactions);
      const refundAmount = getOrderOriginalAmount(
        order,
        exchangeRates,
        erpState.treasuryTransactions,
      );`,
  `    onSuccess: (_, { order, amount, currency }) => {
      const orderCurrency = currency;
      const refundAmount = amount;`,
);

fs.writeFileSync(path, content, "utf8");
