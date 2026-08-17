import fs from "fs";
let content = fs.readFileSync("src/entry-client.tsx", "utf8");

if (!content.includes("translator.start()")) {
  content = content.replace(
    'import { hydrateRoot } from "react-dom/client";',
    'import { hydrateRoot } from "react-dom/client";\nimport { translator } from "./shared/services/translationService";\n\ntranslator.start();\n',
  );
  fs.writeFileSync("src/entry-client.tsx", content);
}
