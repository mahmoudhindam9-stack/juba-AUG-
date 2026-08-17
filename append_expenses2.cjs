const fs = require('fs');
const path = 'src/shared/data/oracleAccounts.ts';
let content = fs.readFileSync(path, 'utf8');

const newAccounts = [
  // Image 10 - Under 31020 (مصروفات عمومية المول)
  { code: "31020310", name_ar: "دعاية واعلان", name_en: "Advertising", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020320", name_ar: "انترنت", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020330", name_ar: "تامين", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020340", name_ar: "حاسب الي", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020350", name_ar: "بريد", type: "expense", level: 4, parent_code: "31020" },

  // Image 12 - Under 31020
  { code: "31020100", name_ar: "تذاكر طيران", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020110", name_ar: "بدلات سفر", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020120", name_ar: "صيانة وقطع غيار", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020130", name_ar: "اقامات فنادق", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020140", name_ar: "اجور ومرتبات ومكافاءات", type: "expense", level: 4, parent_code: "31020" },

  // Image 7 - Under 31020
  { code: "31020141", name_ar: "مكافأة نهاية خدمة", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020150", name_ar: "رسوم وتراخيص", name_en: "Fees and licenses", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020160", name_ar: "ضيافة وبوفيه", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020170", name_ar: "بدل اعاشة اداريين", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020180", name_ar: "مصروفات علاج", type: "expense", level: 4, parent_code: "31020" },

  // Image 8 - Under 31020
  { code: "31020190", name_ar: "ايجار سيارات", name_en: "Rent car", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020200", name_ar: "اتعاب مراقب الحسابات", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020205", name_ar: "اتعاب مهنية", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020210", name_ar: "نقل وانتقال", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020220", name_ar: "تليفون وكروت شحن", type: "expense", level: 4, parent_code: "31020" },

  // Image 9 - Under 31020
  { code: "31020230", name_ar: "مصروفات سفر", name_en: "travel expenses", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020240", name_ar: "زيوت", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020250", name_ar: "مياه", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020260", name_ar: "متنوعة واكراميات", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020270", name_ar: "مصروفات سيارة", type: "expense", level: 4, parent_code: "31020" },

  // Image 11 - Under 31020
  { code: "31020275", name_ar: "مصروفات سيارة الادارة", name_en: "Car expenses GM", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020280", name_ar: "مصاريف وعمولات بنكية", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020285", name_ar: "فروق عملة", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020290", name_ar: "هدايا", type: "expense", level: 4, parent_code: "31020" },
  { code: "31020300", name_ar: "ادوات كتابية ومطبوعات", type: "expense", level: 4, parent_code: "31020" },
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
