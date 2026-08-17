const fs = require('fs');
const path = 'src/shared/data/oracleAccounts.ts';
let content = fs.readFileSync(path, 'utf8');

const newAccounts = [
  { code: "3", name_ar: "المصروفات", name_en: "Exp", type: "expense", level: 1 },
  
  // Level 2
  { code: "310", name_ar: "مصروفات المول", type: "expense", level: 2, parent_code: "3" },
  { code: "320", name_ar: "مصروفات الاذاعة", type: "expense", level: 2, parent_code: "3" },
  { code: "330", name_ar: "مصروفات السنترال بوب", type: "expense", level: 2, parent_code: "3" },

  // Level 3
  { code: "31010", name_ar: "مصروفات تشغيل المول", type: "expense", level: 3, parent_code: "310" },
  { code: "31020", name_ar: "مصروفات عمومية المول", type: "expense", level: 3, parent_code: "310" },
  
  { code: "33010", name_ar: "مصروفات تشغيل السنترال بوب", type: "expense", level: 3, parent_code: "330" },
  { code: "33020", name_ar: "مصروفات عمومية السنترال بوب", type: "expense", level: 3, parent_code: "330" },

  // Level 4 - Under 31010
  { code: "31010100", name_ar: "سولار", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010105", name_ar: "بنزين سيارات", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010110", name_ar: "اجور ومرتبات ومكافاءات", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010120", name_ar: "بدل اعاشة امن", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010130", name_ar: "نقل وانتقال", type: "expense", level: 4, parent_code: "31010" },
  
  { code: "31010140", name_ar: "ايجار معدات", name_en: "rent equipments", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010145", name_ar: "مصروفات شحن كهرباء", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010150", name_ar: "مياه", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010155", name_ar: "غاز", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010160", name_ar: "متنوعة واكراميات", type: "expense", level: 4, parent_code: "31010" },

  { code: "31010170", name_ar: "صيانة عامة", name_en: "Maintenance", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010180", name_ar: "صيانة صرف صحى", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010190", name_ar: "مصروفات نظافة", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010200", name_ar: "مصروفات سيارة", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010210", name_ar: "عمالة يومية", type: "expense", level: 4, parent_code: "31010" },

  { code: "31010212", name_ar: "ضرائب مسددة", name_en: "paid taxes", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010220", name_ar: "اتعاب مهنية", name_en: "Professional fee", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010225", name_ar: "رسوم وتراخيص", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010230", name_ar: "مصروفات قضائية", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010255", name_ar: "اهلاك اصول ثابتة مول", type: "expense", level: 4, parent_code: "31010" },
  { code: "31010355", name_ar: "اهلاك استثمار عقارى مول", type: "expense", level: 4, parent_code: "31010" },

  // Level 4 - Under 33020
  { code: "33020315", name_ar: "بدلات سفر السنترال", name_en: "travel allowance", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020320", name_ar: "ضيافة وبوفيه سنترال", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020330", name_ar: "دعاية واعلان", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020335", name_ar: "مصروفات قضائية", type: "expense", level: 4, parent_code: "33020" },
  { code: "33020340", name_ar: "ديون معدومة", type: "expense", level: 4, parent_code: "33020" }
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
