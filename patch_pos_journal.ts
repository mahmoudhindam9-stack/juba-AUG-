import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");
content = content.replace(
  `  postSalesInvoiceJournal(
    orderNumber: number,
    total: number,
    subtotal: number,
    tax: number,
    paymentMethod: string = "cash",
    branchId: string,
    currency: string = "EGP",
  ) {`,
  `  postSalesInvoiceJournal(
    orderNumber: number,
    total: number,
    subtotal: number,
    tax: number,
    paymentMethod: string = "cash",
    branchId: string,
    currency: string = "EGP",
    treasuryId: string = "tr-1",
    containerId?: string,
  ) {`,
);

content = content.replace(
  `      this.addTreasuryTransaction(
        "tr-1",
        "sales",
        total,
        currency,
        \`إيرادات مبيعات المطعم - طلب رقم #\${orderNumber}\`,
        \`INV-\${orderNumber}\`,
        paymentMethod,
      );`,
  `      this.addTreasuryTransaction(
        treasuryId,
        "sales",
        total,
        currency,
        \`إيرادات مبيعات المطعم - طلب رقم #\${orderNumber}\`,
        \`INV-\${orderNumber}\`,
        paymentMethod,
        containerId
      );`,
);

content = content.replace(
  `  postSalesReturnJournal(
    orderNumber: number,
    total: number,
    paymentMethod: string = "cash",
    branchId: string,
    currency: string = "EGP",
  ) {`,
  `  postSalesReturnJournal(
    orderNumber: number,
    total: number,
    paymentMethod: string = "cash",
    branchId: string,
    currency: string = "EGP",
    treasuryId: string = "tr-1",
    containerId?: string,
  ) {`,
);

content = content.replace(
  `      this.addTreasuryTransaction(
        "tr-1",
        "withdrawal",
        total,
        currency,
        \`مرتجع مبيعات المطعم - طلب رقم #\${orderNumber}\`,
        \`SRT-\${orderNumber}\`,
        paymentMethod,
      );`,
  `      this.addTreasuryTransaction(
        treasuryId,
        "withdrawal",
        total,
        currency,
        \`مرتجع مبيعات المطعم - طلب رقم #\${orderNumber}\`,
        \`SRT-\${orderNumber}\`,
        paymentMethod,
        containerId
      );`,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
