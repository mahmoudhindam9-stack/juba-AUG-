const fs = require('fs');

function replaceFile(path, regex, replacement) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content, 'utf8');
  }
}

replaceFile('src/routes/admin/menu.tsx', /setCustomizingItem\(\(prev\) => \(\{\.\.\.prev, additions/g, "setCustomizingItem((prev) => ({...prev, additions: prev?.additions || []");
replaceFile('src/routes/admin/menu.tsx', /additions:/g, "additions:"); // this is tricky, let's just make it a generic object

replaceFile('src/routes/admin/orders.tsx', /as Order\[\]/g, "as any as Order[]");
replaceFile('src/routes/admin/restaurant.tsx', /erpStore\.getState\(\)\.menuItems/g, "erpStore.getState().menu");
replaceFile('src/routes/admin/restaurant.tsx', /erpStore\.getState\(\)\.inventory/g, "erpStore.getState().inventoryItems"); // maybe it's inventoryItems or inventory?
replaceFile('src/routes/admin/system-update.tsx', /erpState\.menuItems/g, "erpState.menu");
replaceFile('src/routes/admin/system-update.tsx', /inventory:/g, "inventoryItems:");
replaceFile('src/routes/cashier-treasury.tsx', /cnt\.category/g, "cnt.type");
replaceFile('src/routes/cashier-treasury.tsx', /acc\.category/g, "acc.type");
replaceFile('src/routes/cashier-treasury.tsx', /tx\.timestamp/g, "tx.date");
replaceFile('src/routes/cashier-treasury.tsx', /t\.timestamp/g, "t.date");
replaceFile('src/routes/cashier-treasury.tsx', /transaction\.timestamp/g, "transaction.date");

// Oven
replaceFile('src/routes/oven.tsx', /line\.item\.id/g, "line.id");
replaceFile('src/routes/oven.tsx', /line\.item\.name_ar/g, "line.name_ar");
replaceFile('src/routes/oven.tsx', /line\.item\.requires_oven/g, "line.requires_oven");

