import fs from "fs";

let indexContent = fs.readFileSync("src/routes/index.tsx", "utf8");
indexContent = indexContent.replace(
  /const \[loadingUser, setLoadingUser\] = useState\(false\);\n/,
  "",
);
fs.writeFileSync("src/routes/index.tsx", indexContent);
