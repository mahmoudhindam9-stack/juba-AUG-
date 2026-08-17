import fs from "fs";

const path = "src/routes/menu.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `  const availableItems = useMemo(() => {
    return erpState.menuItems.filter((item) => item.is_active && item.is_available);
  }, [erpState.menuItems]);

  const categories = erpState.menuCategories;`,
  `  const availableItems = useMemo(() => {
    return (erpState?.menuItems || []).filter((item) => item.is_active && item.is_available);
  }, [erpState?.menuItems]);

  const categories = erpState?.menuCategories || [];`,
);

fs.writeFileSync(path, content, "utf8");
