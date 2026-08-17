import fs from "fs";

let indexContent = fs.readFileSync("src/routes/index.tsx", "utf8");
indexContent = indexContent.replace(
  /if \(loadingUser\) \{[\s\S]*?return \([\s\S]*?جاري التحقق من الصلاحيات\.\.\.[\s\S]*?<\/div>\s*\);\s*\}/,
  "",
);
fs.writeFileSync("src/routes/index.tsx", indexContent);
