import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `                  refundMutation.mutate({
                    order: refundOrderDialog,
                    treasuryId: refundTreasury,
                    containerId: refundContainer,
                    reason: refundReason,
                  });`,
  `                  refundMutation.mutate({
                    order: refundOrderDialog,
                    treasuryId: refundTreasury,
                    containerId: refundContainer,
                    reason: refundReason,
                    amount: customRefundAmount,
                    currency: customRefundCurrency,
                    paymentMethod: customRefundPaymentMethod,
                  });`,
);

fs.writeFileSync(path, content, "utf8");
