import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

content = content.replace(
  / {2}constructor\(\) \{\n {4}this\.state = this\.loadState\(\);\n {2}\}/g,
  '  constructor() {\n    this.state = this.loadState();\n    if (typeof window !== "undefined") {\n      setTimeout(() => this.saveState(), 1000);\n    }\n  }',
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
