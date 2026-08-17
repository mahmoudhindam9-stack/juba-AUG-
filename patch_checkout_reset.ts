import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

content = content.replace(
  '      setOrderNotes("");\n      setSelectedAdditions([]);',
  '      setOrderNotes("");\n      setSelectedAdditions([]);\n      setAuthNumber("");\n      setMobileNumber("");',
);

fs.writeFileSync("src/routes/index.tsx", content);
