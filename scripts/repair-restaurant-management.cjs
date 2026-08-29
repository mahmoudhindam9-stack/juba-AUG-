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
  const next = content.slice(0, index) + to + content.slice(index + from.length);
  return next;
}

// 1) Make the Oven KDS consume the same Supabase broadcast used by the
// persistent table-order bridge. The existing DB/localStorage listeners stay intact.
{
  const path = "src/routes/oven.tsx";
  let content = read(path);
  const from = `      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {\n        fetchPendingOrders();\n      })\n      .subscribe();`;
  const to = `      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {\n        fetchPendingOrders();\n      })\n      .on("broadcast", { event: "NEW_OVEN_ORDER" }, () => {\n        fetchPendingOrders();\n      })\n      .subscribe();`;
  if (!content.includes(`.on("broadcast", { event: "NEW_OVEN_ORDER" }`)) {
    content = replaceOnce(path, content, from, to, "oven broadcast listener");
  }
  write(path, content);
}

// 2) Repair receipt display/printing when the invoice object contains zero or
// missing monetary fields. Values are derived from the actual receipt items,
// while preserving non-zero values supplied by the order.
{
  const path = "src/routes/pos.tsx";
  let content = read(path);

  const handlePrintMarker = `  const handlePrint = () => {\n    const isConnected = printerService.isPrinterConnected();`;
  const handlePrintReplacement = `  const calculatedItemsSubtotal = itemsList.reduce(\n    (sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 0),\n    0,\n  );\n  const displaySubtotal = Number(invoice.subtotal) > 0 ? Number(invoice.subtotal) : calculatedItemsSubtotal;\n  const displayDiscount = Number(invoice.discount) || 0;\n  const displayServiceFee = Number(invoice.service_fee) || 0;\n  const displayDeliveryFee = Number(invoice.delivery_fee) || 0;\n  const taxRateForDisplay = Number(invoice.tax_rate ?? receiptSettings.defaultTaxRate ?? 14);\n  const displayTax = Number(invoice.tax) > 0\n    ? Number(invoice.tax)\n    : Number((displaySubtotal * taxRateForDisplay / 100).toFixed(2));\n  const displayTotal = Number(invoice.total) > 0\n    ? Number(invoice.total)\n    : Math.max(0, displaySubtotal - displayDiscount + displayServiceFee + displayDeliveryFee + displayTax);\n\n  const handlePrint = () => {\n    const isConnected = printerService.isPrinterConnected();`;
  if (!content.includes("const calculatedItemsSubtotal = itemsList.reduce(")) {
    content = replaceOnce(path, content, handlePrintMarker, handlePrintReplacement, "receipt calculation block");
  }

  const receiptValuesFrom = `      subtotal: Number(invoice.subtotal),\n      discount: invoice.discount ? Number(invoice.discount) : undefined,\n      serviceFee: invoice.service_fee ? Number(invoice.service_fee) : undefined,\n      deliveryFee: invoice.delivery_fee ? Number(invoice.delivery_fee) : undefined,\n      tax: Number(invoice.tax),\n      taxRate: invoice.tax_rate ?? receiptSettings.defaultTaxRate,\n      total: Number(invoice.total),`;
  const receiptValuesTo = `      subtotal: displaySubtotal,\n      discount: displayDiscount || undefined,\n      serviceFee: displayServiceFee || undefined,\n      deliveryFee: displayDeliveryFee || undefined,\n      tax: displayTax,\n      taxRate: invoice.tax_rate ?? receiptSettings.defaultTaxRate,\n      total: displayTotal,\n      currency,`;
  if (!content.includes("subtotal: displaySubtotal")) {
    content = replaceOnce(path, content, receiptValuesFrom, receiptValuesTo, "print receipt totals");
  }

  const jsxFrom = `        <Row label={t.subtotal} value={formatPrice(Number(invoice.subtotal))} />`;
  const jsxTo = `        <Row label={t.subtotal} value={formatPrice(displaySubtotal)} />`;
  if (!content.includes("formatPrice(displaySubtotal)")) {
    content = replaceOnce(path, content, jsxFrom, jsxTo, "receipt subtotal display");
  }

  content = content.replace(
    `            value={formatPrice(Number(invoice.tax))}`,
    `            value={formatPrice(displayTax)}`,
  );
  content = content.replace(
    `            {formatPrice(Number(invoice.total))}`,
    `            {formatPrice(displayTotal)}`,
  );

  write(path, content);
}

console.log("Restaurant management repair patch applied successfully.");
