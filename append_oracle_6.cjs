const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  { code: "170", name_ar: "ارصدة مدينة اخرى", type: "asset", level: 2, parent_code: "1" },
  { code: "180", name_ar: "اصول اخرى طويلة الاجل", type: "asset", level: 2, parent_code: "1" }
];

let replaced = false;
let toReplace = code.trim();
if (toReplace.endsWith("];")) {
  let customStr = newAccounts.map(a => {
    return `{ code: "${a.code}", name_ar: "${a.name_ar}"${a.name_en ? `, name_en: "${a.name_en}"` : ''}, type: "${a.type}", level: ${a.level}, parent_code: "${a.parent_code}" }`;
  }).join(',\n  ');
  
  let fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + customStr + "\n];\n";

  fs.writeFileSync('src/shared/data/oracleAccounts.ts', fixedCode);
  console.log("Appended new assets accounts successfully.");
} else {
  console.log("Could not find the array ending to append.");
}
