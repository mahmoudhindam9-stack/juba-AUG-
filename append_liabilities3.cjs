const fs = require('fs');

const path = 'src/shared/data/oracleAccounts.ts';
let content = fs.readFileSync(path, 'utf8');

// The new accounts to add based on the images
const newAccounts = [
  // Image 11, 12, 13, 14, 15, 16 - Parent 24010, Level 4
  { code: "24010", name_ar: "الموردون", type: "liability", level: 3, parent_code: "240" },
  { code: "24020", name_ar: "موردون FM", type: "liability", level: 3, parent_code: "240" },
  { code: "24030", name_ar: "موردون السنترال بوب", type: "liability", level: 3, parent_code: "240" },
  { code: "24010100", name_ar: "اباظة للاستشارات الهندسية", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010110", name_ar: "ارنست اند يونج - جدوى", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010120", name_ar: "مورد المولد", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010130", name_ar: "نيو انترناشيونال", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010140", name_ar: "سيد عبد الرازق - كارفان", type: "liability", level: 4, parent_code: "24010" },
  
  { code: "24010170", name_ar: "بلو سكاى", name_en: "Blue Sky travel", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010190", name_ar: "محمد محروس - مورد المولد 1 ميجا", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010210", name_ar: "مورد المولد - صيانة", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010220", name_ar: "ناصر عبد الوهاب - صحي", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010230", name_ar: "اي ام جي", type: "liability", level: 4, parent_code: "24010" },

  { code: "24010240", name_ar: "الكهوا - مولد 60", name_en: "Kahwa - Generator 60", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010250", name_ar: "متراك", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010260", name_ar: "سالم حكمت سالم", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010270", name_ar: "اشرف عبد العزيز", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010280", name_ar: "المحروسة", type: "liability", level: 4, parent_code: "24010" },

  { code: "24010290", name_ar: "ام سي ترافل", name_en: "MC travel", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010300", name_ar: "امير ميخائيل", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010310", name_ar: "بيفرلى هيلز", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010320", name_ar: "المستشار القانوني", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010330", name_ar: "بينجامين ميخائيل - باب الوميتال", type: "liability", level: 4, parent_code: "24010" },

  { code: "24010340", name_ar: "توفى ترافل", name_en: "Tufy travel", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010350", name_ar: "محمد ماجد", name_en: "Mohamed Maged", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010360", name_ar: "هلال للتصميمات والاستشارات الانشائية", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010370", name_ar: "شركة اعمار", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010380", name_ar: "شركة ليليكو الهندسية", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010390", name_ar: "موردون سيارة الادارة", type: "liability", level: 4, parent_code: "24010" },

  // Image 17
  { code: "25010", name_ar: "الدائنون", type: "liability", level: 3, parent_code: "250" },
  { code: "25020", name_ar: "دائنون FM", type: "liability", level: 3, parent_code: "250" },
  { code: "25030", name_ar: "دائنون متنوعة", type: "liability", level: 3, parent_code: "250" },
  
  { code: "25010100", name_ar: "د/ احمد بهجت", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010110", name_ar: "ضرائب", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010120", name_ar: "جاري الشريك 16%", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010130", name_ar: "جاري الشريك - الحكومة السودانية", type: "liability", level: 4, parent_code: "25010" },

  // Image 18
  { code: "25020100", name_ar: "دائنون FM", name_en: "Cerditors FM", type: "liability", level: 4, parent_code: "25020" },

  // Image 19, 20, 21
  { code: "25030100", name_ar: "مشاركة فى مصروفات المول - ايجل G8", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030110", name_ar: "مشاركة فى مصروفات المول - بنك ايدين B4&B5", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030120", name_ar: "مشاركة فى مصروفات المول - الماركت الصيني 6", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030130", name_ar: "مشاركة فى مصروفات المول - اب تاون", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030140", name_ar: "مشاركة فى مصروفات المول - شركة كادما F4", type: "liability", level: 4, parent_code: "25030" },
  
  { code: "25030150", name_ar: "مشاركة فى مصروفات المول - حريت جيمي F2", name_en: "part of exp of mall - Hurriyet Jimmy F2", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030160", name_ar: "مشاركة فى مصروفات المول - 360 تكنولوجي 5", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030170", name_ar: "مشاركة فى مصروفات المول - شركة ايمدج G2", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030180", name_ar: "مشاركة فى مصروفات المول - ريبيكا G7", name_en: "Share in mall expenses - Rebecca G7", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030190", name_ar: "مشاركة فى مصروفات المول - شركة ليلكو F3", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030200", name_ar: "مشاركة فى مصروفات المول - شركة ليلكو B2", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030210", name_ar: "مشاركة فى مصروفات المول - ترست كلاس B10", type: "liability", level: 4, parent_code: "25030" },
  { code: "25030260", name_ar: "مشاركات متنوعة في مصروفات المول", type: "liability", level: 4, parent_code: "25030" }
];

let match = content.match(/export const (ORACLE_MIGRATION_ACCOUNTS|oracleAccounts).*?\[\s*([\s\S]*?)\s*\];/);

if (match) {
  let inner = match[2];
  
  // Split into individual objects
  let objectsStr = inner.split(/,\s*\n\s*\{/g);
  let parsedObjects = [];
  
  for (let i = 0; i < objectsStr.length; i++) {
    let str = objectsStr[i];
    if (i > 0) str = "{" + str; // re-add brace for all but first
    // Some lines are commented out, let's just keep them as text.
    if (str.trim().startsWith("//")) {
       parsedObjects.push({ type: 'comment', text: str });
       continue;
    }
    
    // basic parse
    let codeMatch = str.match(/code:\s*"([^"]+)"/);
    if (codeMatch) {
       parsedObjects.push({ type: 'obj', code: codeMatch[1], text: str.trim() });
    } else {
       parsedObjects.push({ type: 'text', text: str });
    }
  }

  // Remove conflicting objects
  const newCodes = newAccounts.map(a => a.code);
  parsedObjects = parsedObjects.filter(obj => {
    if (obj.type === 'obj' && newCodes.includes(obj.code)) {
      return false; // remove old ones
    }
    return true;
  });

  // Convert new objects to string format
  for (const acc of newAccounts) {
     let enProp = acc.name_en ? `, name_en: "${acc.name_en}"` : "";
     let str = `{ code: "${acc.code}", name_ar: "${acc.name_ar}"${enProp}, type: "${acc.type}", level: ${acc.level}, parent_code: "${acc.parent_code}" }`;
     parsedObjects.push({ type: 'obj', code: acc.code, text: str });
  }

  // Sort objects? It's better to sort by code so the array is neat.
  let commentsAndText = parsedObjects.filter(o => o.type !== 'obj');
  let validObjs = parsedObjects.filter(o => o.type === 'obj');
  
  validObjs.sort((a, b) => a.code.localeCompare(b.code));

  let finalArrayContent = "";
  for (const obj of validObjs) {
    finalArrayContent += "  " + obj.text + ",\n";
  }

  // Replace back in file
  content = content.replace(match[0], `export const ORACLE_MIGRATION_ACCOUNTS = [\n${finalArrayContent.trimEnd().replace(/,$/, '')}\n];`);

  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully updated oracleAccounts.ts");
} else {
  console.log("Could not find the array in oracleAccounts.ts");
}
