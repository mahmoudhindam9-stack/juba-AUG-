const fs = require('fs');
const path = 'src/shared/data/oracleAccounts.ts';
let content = fs.readFileSync(path, 'utf8');

const newAccounts = [
  // Under 32020
  { code: "32020250", name_ar: "مصروفات نظافة", name_en: "cleaning exp", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020260", name_ar: "مصروفات سيارة", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020270", name_ar: "مصاريف وعمولات بنكية", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020280", name_ar: "ادوات كتابية ومطبوعات", name_en: "Office supplies", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020290", name_ar: "دعاية واعلان", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020300", name_ar: "انترنت", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020310", name_ar: "حاسب الي", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020320", name_ar: "بريد", type: "expense", level: 4, parent_code: "32020" },

  // Under 32030
  { code: "32030100", name_ar: "مصروفات سنوات سابقة الاذاعة", name_en: "Expenses of previous years fm", type: "expense", level: 4, parent_code: "32030" },

  // Under 33010
  { code: "33010100", name_ar: "بدلات الامن", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010110", name_ar: "صيانة وقطع غيار", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010120", name_ar: "اجور ومرتبات موظفين", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010130", name_ar: "اجور ومرتبات شرطة", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010140", name_ar: "متنوعة واكراميات", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010150", name_ar: "نقل وانتقال", name_en: "transportation", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010160", name_ar: "ايجار معدات", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010170", name_ar: "مصروفات اقامة", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010180", name_ar: "عمالة يومية", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010190", name_ar: "مياه", name_en: "water exp", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010200", name_ar: "سولار وكهرباء", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010210", name_ar: "صرف صحى", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010255", name_ar: "اهلاك اصول ثابتة سنترال بوب", type: "expense", level: 4, parent_code: "33010" },
  { code: "33010355", name_ar: "اهلاك استثمار عقارى سنترال بوب", type: "expense", level: 4, parent_code: "33010" },

  // Under 33020
  { code: "33020150", name_ar: "اتعاب مهنية", name_en: "Admin Exp BOB", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020200", name_ar: "صيانة عامة", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020210", name_ar: "رسوم وتراخيص", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020220", name_ar: "مصروفات تخليص وجمارك", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020300", name_ar: "خصومات متنوعة", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020310", name_ar: "مصروفات سفر سنترال", name_en: "Central travel expenses", type: "expense", level: 4, parent_code: "33020" }
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
