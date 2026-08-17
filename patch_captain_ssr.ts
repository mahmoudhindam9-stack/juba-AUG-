import fs from "fs";

const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `function getLocalTables(): Table[] {
  try {
    const raw = localStorage.getItem(LOCAL_TABLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}`,
  `function getLocalTables(): Table[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_TABLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}`,
);

content = content.replace(
  `function saveLocalTables(tables: Table[]) {
  try {
    localStorage.setItem(LOCAL_TABLES_KEY, JSON.stringify(tables));
  } catch (e) {`,
  `function saveLocalTables(tables: Table[]) {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem(LOCAL_TABLES_KEY, JSON.stringify(tables));
  } catch (e) {`,
);

content = content.replace(
  `  const tableOrders = useSyncExternalStore(tableOrdersStore.subscribe.bind(tableOrdersStore), () =>
    tableOrdersStore.getAllOrders(),
  );`,
  `  const tableOrders = useSyncExternalStore(
    tableOrdersStore.subscribe.bind(tableOrdersStore), 
    () => tableOrdersStore.getAllOrders(),
    () => []
  );`,
);

fs.writeFileSync(path, content, "utf8");
