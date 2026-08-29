const fs = require("fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}
function write(path, content) {
  fs.writeFileSync(path, content);
}
function replaceOnce(path, content, from, to, label) {
  const index = content.indexOf(from);
  if (index === -1) throw new Error(`Patch target not found: ${label} in ${path}`);
  return content.slice(0, index) + to + content.slice(index + from.length);
}

// 1) Oven: consume the same realtime broadcast used by the persistent table-order bridge.
{
  const path = "src/routes/oven.tsx";
  let content = read(path);
  if (!content.includes(`.on("broadcast", { event: "NEW_OVEN_ORDER" }`)) {
    const from = `      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {\n        fetchPendingOrders();\n      })\n      .subscribe();`;
    const to = `      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {\n        fetchPendingOrders();\n      })\n      .on("broadcast", { event: "NEW_OVEN_ORDER" }, () => {\n        fetchPendingOrders();\n      })\n      .subscribe();`;
    content = replaceOnce(path, content, from, to, "oven broadcast listener");
  }
  write(path, content);
}

// 2) POS receipt: make all displayed/printed monetary values deterministic even
// when the invoice returned by the backend contains zero/missing totals.
{
  const path = "src/routes/pos.tsx";
  let content = read(path);

  // The current file already contains the earlier receipt repair, but its
  // calculatedItemsSubtotal is scoped inside handlePrint while the JSX uses it
  // outside that function. Replace that broken block with component-scope values.
  const brokenScope = `  const handlePrint = () => {\n    const calculatedItemsSubtotal = itemsList.reduce(\n      (sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 0),\n      0,\n    );\n    const printableSubtotal = Number(invoice.subtotal) || calculatedItemsSubtotal;\n    const printableDiscount = Number(invoice.discount) || 0;\n    const printableServiceFee = Number(invoice.service_fee) || 0;\n    const printableDeliveryFee = Number(invoice.delivery_fee) || 0;\n    const printableTax = Number(invoice.tax) || 0;\n    const printableTotal =\n      Number(invoice.total) ||\n      Math.max(\n        0,\n        printableSubtotal -\n          printableDiscount +\n          printableServiceFee +\n          printableDeliveryFee +\n          printableTax,\n      );\n\n    const isConnected = printerService.isPrinterConnected();`;
  const fixedScope = `  const calculatedItemsSubtotal = itemsList.reduce(\n    (sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 0),\n    0,\n  );\n  const displaySubtotal = Number(invoice.subtotal) > 0 ? Number(invoice.subtotal) : calculatedItemsSubtotal;\n  const displayDiscount = Number(invoice.discount) || 0;\n  const displayServiceFee = Number(invoice.service_fee) || 0;\n  const displayDeliveryFee = Number(invoice.delivery_fee) || 0;\n  const taxRateForDisplay = Number(invoice.tax_rate ?? receiptSettings.defaultTaxRate ?? 14);\n  const displayTax = Number(invoice.tax) > 0\n    ? Number(invoice.tax)\n    : Number((displaySubtotal * taxRateForDisplay / 100).toFixed(2));\n  const displayTotal = Number(invoice.total) > 0\n    ? Number(invoice.total)\n    : Math.max(0, displaySubtotal - displayDiscount + displayServiceFee + displayDeliveryFee + displayTax);\n\n  const handlePrint = () => {\n    const isConnected = printerService.isPrinterConnected();`;
  if (content.includes(brokenScope)) {
    content = replaceOnce(path, content, brokenScope, fixedScope, "receipt scope repair");
  }

  // If an older version is present, normalize its print values as well.
  content = content.replace(
    /      subtotal: Number\(invoice\.subtotal\),\n      discount: invoice\.discount \? Number\(invoice\.discount\) : undefined,\n      serviceFee: invoice\.service_fee \? Number\(invoice\.service_fee\) : undefined,\n      deliveryFee: invoice\.delivery_fee \? Number\(invoice\.delivery_fee\) : undefined,\n      tax: Number\(invoice\.tax\),\n      taxRate: invoice\.tax_rate \?\? receiptSettings\.defaultTaxRate,\n      total: Number\(invoice\.total\),/,
    `      subtotal: displaySubtotal,\n      discount: displayDiscount || undefined,\n      serviceFee: displayServiceFee || undefined,\n      deliveryFee: displayDeliveryFee || undefined,\n      tax: displayTax,\n      taxRate: invoice.tax_rate ?? receiptSettings.defaultTaxRate,\n      total: displayTotal,\n      currency,`,
  );

  // Normalize the JSX receipt totals.
  content = content.replace(
    `        <Row label={t.subtotal} value={formatPrice(Number(invoice.subtotal))} />`,
    `        <Row label={t.subtotal} value={formatPrice(displaySubtotal)} />`,
  );
  content = content.replace(
    `            value={formatPrice(Number(invoice.tax))}`,
    `            value={formatPrice(displayTax)}`,
  );
  content = content.replace(
    `            {formatPrice(Number(invoice.total))}`,
    `            {formatPrice(displayTotal)}`,
  );

  // Remove the obsolete broken display declarations if they remain below handlePrint.
  const brokenDisplay = `  const displaySubtotal = Number(invoice.subtotal) || calculatedItemsSubtotal;\n  const displayTax = Number(invoice.tax) || 0;\n  const displayTotal = Number(invoice.total) || Math.max(0, displaySubtotal - Number(invoice.discount || 0) + Number(invoice.service_fee || 0) + Number(invoice.delivery_fee || 0) + displayTax);\n\n`;
  content = content.replace(brokenDisplay, "");

  write(path, content);
}

console.log("Restaurant management repair patch applied successfully.");
