const fs = require('fs');
const path = 'src/shared/data/oracleAccounts.ts';
let content = fs.readFileSync(path, 'utf8');

const newAccounts = [
  // Under 31020
  { code: "31020360", name_ar: "عمولات متنوعة", name_en: "commissions", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020370", name_ar: "مصروفات زراعية", name_en: "agricultural expenses", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020380", name_ar: "مصروفات شحن كهرباء", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020400", name_ar: "خصومات متنوعة", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020410", name_ar: "مصروفات قضائية", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020500", name_ar: "نصيب مساهمة العملاء", type: "expense", level: 4, parent_code: "31020" },

  // Under 320 (مصروفات الاذاعة)
  { code: "32010", name_ar: "مصروفات تشغيل FM", name_en: "Exp FM", type: "expense", level: 3, parent_code: "320" },
  { code: "32020", name_ar: "مصروفات عمومية FM", type: "expense", level: 3, parent_code: "320" },
  { code: "32030", name_ar: "مصروفات سنوات سابقة الاذاعة", type: "expense", level: 3, parent_code: "320" },

  // Under 32010 (مصروفات تشغيل FM)
  { code: "32010100", name_ar: "سولار", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010110", name_ar: "ايجار مبنى الاذاعة", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010120", name_ar: "صيانة وقطع غيار", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010130", name_ar: "امن", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010140", name_ar: "اجور ومرتبات ومكافاءات", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010150", name_ar: "بدل اعاشة امن", name_en: "security living allowance", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010160", name_ar: "ايجار معدات", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010170", name_ar: "زيوت", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010180", name_ar: "مياه", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010190", name_ar: "متنوعة واكراميات", name_en: "miscellaneous AND tips", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010200", name_ar: "عمالة يومية", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010210", name_ar: "ادوات كتابية ومطبوعات", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010220", name_ar: "حاسب الي", type: "expense", level: 4, parent_code: "32010" },
  { code: "32010255", name_ar: "اهلاك اصول ثابتة الاذاعة", type: "expense", level: 4, parent_code: "32010" },

  // Under 32020 (مصروفات عمومية FM)
  { code: "32020150", name_ar: "رسوم وتراخيص", name_en: "Fees and licenses", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020160", name_ar: "ضيافة وبوفيه", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020170", name_ar: "ايجار سيارات", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020180", name_ar: "نقل وانتقال", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020190", name_ar: "تليفون وكروت شحن", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020200", name_ar: "مصروفات سفر", name_en: "travel expenses", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020210", name_ar: "تبرعات", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020220", name_ar: "ايجار معدات", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020230", name_ar: "زيوت", type: "expense", level: 4, parent_code: "32020" },
  { code: "32020240", name_ar: "متنوعة واكراميات", type: "expense", level: 4, parent_code: "32020" }
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
