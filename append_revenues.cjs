const fs = require('fs');
const path = 'src/shared/data/oracleAccounts.ts';
let content = fs.readFileSync(path, 'utf8');

const newAccounts = [
  // Level 1
  { code: "4", name_ar: "الايرادات", name_en: "Revenues", type: "revenue", level: 1 },
  
  // Level 2
  { code: "410", name_ar: "ايرادات المول", type: "revenue", level: 2, parent_code: "4" },
  { code: "420", name_ar: "ايرادات الاذاعة", name_en: "FM revenue", type: "revenue", level: 2, parent_code: "4" },
  { code: "430", name_ar: "ايرادات سنترال بوب", name_en: "Bob Revenu", type: "revenue", level: 2, parent_code: "4" },

  // Level 3
  { code: "41010", name_ar: "ايرادات متنوعة", type: "revenue", level: 3, parent_code: "410" },
  { code: "41020", name_ar: "ايرادات النشاط", name_en: "Activity revenues", type: "revenue", level: 3, parent_code: "410" },
  
  { code: "42010", name_ar: "ايرادات متنوعة", type: "revenue", level: 3, parent_code: "420" },
  { code: "42020", name_ar: "ايرادات نشاط", name_en: "activity revenue", type: "revenue", level: 3, parent_code: "420" },

  { code: "43020", name_ar: "ايرادات نشاط", type: "revenue", level: 3, parent_code: "430" },

  // Level 4
  { code: "41010100", name_ar: "فرق تحويل عملات", type: "revenue", level: 4, parent_code: "41010" },
  { code: "41010110", name_ar: "ايراد ايجار ارض", type: "revenue", level: 4, parent_code: "41010" },
  { code: "41020100", name_ar: "ايرادات تاجير محلات المول", type: "revenue", level: 4, parent_code: "41020" },

  { code: "42010100", name_ar: "ايرادات الاذاعة", type: "revenue", level: 4, parent_code: "42010" },
  { code: "42020100", name_ar: "ايرادات محلات السنترال بوب", type: "revenue", level: 4, parent_code: "42020" },

  { code: "43020100", name_ar: "ايرادات محلات السنترال بوب", type: "revenue", level: 4, parent_code: "43020" },
  { code: "43020200", name_ar: "ايرادات تذاكر - سنترال بوب", type: "revenue", level: 4, parent_code: "43020" },
  { code: "43020300", name_ar: "ايرادات كافيتريا - سنترال بوب", type: "revenue", level: 4, parent_code: "43020" }
];

let match = content.match(/export const (ORACLE_MIGRATION_ACCOUNTS|oracleAccounts).*?\[\s*([\s\S]*?)\s*\];/);

if (match) {
  let inner = match[2];
  
  let objectsStr = inner.split(/,\s*\n\s*\{/g);
  let parsedObjects = [];
  
  for (let i = 0; i < objectsStr.length; i++) {
    let str = objectsStr[i];
    if (i > 0) str = "{" + str; 
    if (str.trim().startsWith("//")) {
       parsedObjects.push({ type: 'comment', text: str });
       continue;
    }
    
    let codeMatch = str.match(/code:\s*"([^"]+)"/);
    if (codeMatch) {
       parsedObjects.push({ type: 'obj', code: codeMatch[1], text: str.trim() });
    } else {
       parsedObjects.push({ type: 'text', text: str });
    }
  }

  const newCodes = newAccounts.map(a => a.code);
  parsedObjects = parsedObjects.filter(obj => {
    if (obj.type === 'obj' && newCodes.includes(obj.code)) {
      return false;
    }
    return true;
  });

  for (const acc of newAccounts) {
     let enProp = acc.name_en ? `, name_en: "${acc.name_en}"` : "";
     let parentProp = acc.parent_code ? `, parent_code: "${acc.parent_code}"` : "";
     let str = `{ code: "${acc.code}", name_ar: "${acc.name_ar}"${enProp}, type: "${acc.type}", level: ${acc.level}${parentProp} }`;
     parsedObjects.push({ type: 'obj', code: acc.code, text: str });
  }

  let validObjs = parsedObjects.filter(o => o.type === 'obj');
  validObjs.sort((a, b) => a.code.localeCompare(b.code));

  let finalArrayContent = "";
  for (const obj of validObjs) {
    finalArrayContent += "  " + obj.text + ",\n";
  }

  content = content.replace(match[0], `export const ORACLE_MIGRATION_ACCOUNTS = [\n${finalArrayContent.trimEnd().replace(/,$/, '')}\n];`);

  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully updated oracleAccounts.ts");
} else {
  console.log("Could not find the array in oracleAccounts.ts");
}
