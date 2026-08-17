import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

const replacement = `
      // Post to ERP automated journal entries and update treasury balances (Cashier / Bank)
      try {
        const rate = exchangeRates[currency] || 1;
        const convertedTotal = currency === "EGP" ? Number(data.total) : Number(data.total) / rate;
        const convertedSubtotal = currency === "EGP" ? Number(data.subtotal) : Number(data.subtotal) / rate;
        const convertedTax = currency === "EGP" ? Number(data.tax) : Number(data.tax) / rate;

        erpStore.postSalesInvoiceJournal(
          data.order_number,
          Number(convertedTotal.toFixed(2)),
          Number(convertedSubtotal.toFixed(2)),
          Number(convertedTax.toFixed(2)),
          data.payment_method,
          erpStore.getState().currentBranchId,
          currency,
          selectedTreasury,
          selectedContainer,
        );
      } catch (erpErr) {`;

content = content.replace(
  / {6}\/\/ Post to ERP automated journal entries and update treasury balances \(Cashier \/ Bank\)[\s\S]*?\} catch \(erpErr\) \{/,
  replacement,
);

fs.writeFileSync("src/routes/index.tsx", content);
