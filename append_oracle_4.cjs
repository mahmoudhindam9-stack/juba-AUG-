const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  { code: "130", name_ar: "خزينة وبنوك", name_en: "Banks and Treasury", type: "asset", level: 2, parent_code: "1" },
  { code: "13010", name_ar: "خزينة", type: "asset", level: 3, parent_code: "130" },
  { code: "13010100", name_ar: "خزينة بالدولار", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010101", name_ar: "خزينة دولار - كينيدي", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010102", name_ar: "خزينة دولار - 501", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010103", name_ar: "خزينة دولار - الادارة", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010105", name_ar: "خزينة بالدولار سنترال بوب", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010110", name_ar: "خزينة بالسوداني", name_en: "Treasury SSP", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010111", name_ar: "خزينة سوداني - كينيدي", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010115", name_ar: "خزينة بالسوداني - سنترال بوب", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010120", name_ar: "خزينه FM", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010125", name_ar: "خزينة مصري - الادارة", type: "asset", level: 4, parent_code: "13010" },
  
  { code: "13010130", name_ar: "خزينه كاشير المطعم", type: "asset", level: 4, parent_code: "13010" },
  { code: "13010135", name_ar: "خزينه تذاكر الدخول", type: "asset", level: 4, parent_code: "13010" },

  { code: "13020", name_ar: "بنوك", type: "asset", level: 3, parent_code: "130" },
  { code: "13020100", name_ar: "CHARTER SSP", name_en: "CHARTER SSP", type: "asset", level: 4, parent_code: "13020" },
  { code: "13020110", name_ar: "CHARTER usd", name_en: "CHARTER usd", type: "asset", level: 4, parent_code: "13020" },
  { code: "13020120", name_ar: "EDEN SSP", name_en: "EDEN SSP", type: "asset", level: 4, parent_code: "13020" },
  { code: "13020130", name_ar: "Equity ssp", name_en: "Equity ssp", type: "asset", level: 4, parent_code: "13020" },
  { code: "13020140", name_ar: "Equity usd", name_en: "Equity usd", type: "asset", level: 4, parent_code: "13020" },
  { code: "13020150", name_ar: "kcb SSP", name_en: "kcb SSP", type: "asset", level: 4, parent_code: "13020" },
  { code: "13020160", name_ar: "kcb usd", name_en: "kcb usd", type: "asset", level: 4, parent_code: "13020" },

  { code: "13025", name_ar: "خزينة FM", name_en: "Treasury FOR FM", type: "asset", level: 3, parent_code: "130" },
  { code: "13025100", name_ar: "خزينه FM", type: "asset", level: 4, parent_code: "13025" },

  { code: "13030", name_ar: "بنوك FM", name_en: "Banks FM", type: "asset", level: 3, parent_code: "130" },
  { code: "13030100", name_ar: "Equity SSP FM", name_en: "Equity SSP FM", type: "asset", level: 4, parent_code: "13030" },

  { code: "13040", name_ar: "تحويلات", name_en: "Transfers", type: "asset", level: 3, parent_code: "130" },
  { code: "13040100", name_ar: "تحويلات بنكية", type: "asset", level: 4, parent_code: "13040" },
  { code: "13040110", name_ar: "تحويلات خزينة - سوداني دولار", type: "asset", level: 4, parent_code: "13040" }
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
