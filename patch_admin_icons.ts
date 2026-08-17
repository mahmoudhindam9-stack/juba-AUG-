import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

const importsToAdd = ["RefreshCw", "Database", "Save", "Upload", "Code"];
for (const imp of importsToAdd) {
  if (!content.includes(imp + ",")) {
    content = content.replace("import {", "import { " + imp + ",");
  }
}

fs.writeFileSync("src/routes/admin/index.tsx", content);
