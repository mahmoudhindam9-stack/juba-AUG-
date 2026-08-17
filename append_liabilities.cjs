const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  // Level 1
  { code: "2", name_ar: "الخصوم", name_en: "Liabilities", type: "liability", level: 1 },
  
  // 210 Equity
  { code: "210", name_ar: "حقوق الملكية", name_en: "Equity", type: "equity", level: 2, parent_code: "2" },
  { code: "21010", name_ar: "حقوق ملكية مول", type: "equity", level: 3, parent_code: "210" },
  { code: "21010100", name_ar: "المصرى BICL", type: "equity", level: 4, parent_code: "21010" },
  { code: "21010110", name_ar: "السودانى CES", type: "equity", level: 4, parent_code: "21010" },
  { code: "21020", name_ar: "FM حقوق ملكية", type: "equity", level: 3, parent_code: "210" },
  { code: "21030", name_ar: "ارباح وخسائر مرحلة", type: "equity", level: 3, parent_code: "210" },

  // 215 Accumulated Depreciation
  { code: "215", name_ar: "مجمع اهلاك الاصول الثابتة", type: "liability", level: 2, parent_code: "2" },
  { code: "21510", name_ar: "مجمع اهلاك المول", type: "liability", level: 3, parent_code: "215" },
  { code: "21510100", name_ar: "مجمع اهلاك الاصول الثابتة مول", name_en: "Fixed Assets Depreciation", type: "liability", level: 4, parent_code: "21510" },
  { code: "21520", name_ar: "مجمع اهلاك الاذاعة", type: "liability", level: 3, parent_code: "215" },
  { code: "21530", name_ar: "مجمع اهلاك سنترال بوب", type: "liability", level: 3, parent_code: "215" },

  // 217 Accumulated Depreciation Real Estate
  { code: "217", name_ar: "مجمع اهلاك اصل الاستثمار العقاري", name_en: "Depreciation Real Estate Investment", type: "liability", level: 2, parent_code: "2" },
  { code: "21710", name_ar: "مجمع اهلاك استثمار عقاري المول", type: "liability", level: 3, parent_code: "217" },
  { code: "21710100", name_ar: "مجمع اهلاك استثمار عقاري المول مبانى", type: "liability", level: 4, parent_code: "21710" },
  { code: "21710200", name_ar: "مجمع اهلاك استثمار عقاري المول الات ومعدات", type: "liability", level: 4, parent_code: "21710" },
  { code: "21720", name_ar: "مجمع اهلاك استثمار عقاري السنترال بوب", type: "liability", level: 3, parent_code: "217" },

  // 220 Related Parties
  { code: "220", name_ar: "اطراف ذات علاقة", type: "liability", level: 2, parent_code: "2" },
  { code: "22010", name_ar: "اطراف ذات علاقة", name_en: "Related companies", type: "liability", level: 3, parent_code: "220" },
  { code: "22010100", name_ar: "دريم بارك", type: "liability", level: 4, parent_code: "22010" },
  { code: "22010110", name_ar: "دريم لاند", name_en: "Dream Land", type: "liability", level: 4, parent_code: "22010" },
  { code: "22010120", name_ar: "دريم انترناشيونال", type: "liability", level: 4, parent_code: "22010" },
  { code: "22010130", name_ar: "شمال السودان", type: "liability", level: 4, parent_code: "22010" },
  { code: "22010140", name_ar: "تونس", type: "liability", level: 4, parent_code: "22010" },
  { code: "22010150", name_ar: "الشركة المصرية", type: "liability", level: 4, parent_code: "22010" },

  // 230 Contractors
  { code: "230", name_ar: "المقاولون", type: "liability", level: 2, parent_code: "2" },
  { code: "23010", name_ar: "المقاولون", type: "liability", level: 3, parent_code: "230" },
  { code: "23010150", name_ar: "وينر", name_en: "Winner Company", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010160", name_ar: "دوكلا", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010170", name_ar: "طارق حسن", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010180", name_ar: "امان ولدر", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010190", name_ar: "مقاول بروك فيلد", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010200", name_ar: "شبكات الرى السنترال م/نبيل مبروك", name_en: "Nabil Mabrouk - Central irrigation network", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010205", name_ar: "الارضيات المطاطية -خالد فرحات", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010210", name_ar: "اعمال كهرباء - محمد سعد", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010215", name_ar: "مقاول ابواب خارجية سنترال", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010220", name_ar: "مقاول شبكة السوفت سكيب", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010225", name_ar: "مقاول تسالى سور سلك السنترال", name_en: "Tsali -- Central Wire Wall", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010230", name_ar: "مقاول اعمال زراعة سنترال - شفيق", name_en: "Shafiq - Central Agriculture Works", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010240", name_ar: "مقاول رخام د/وليد الدويك - مصنعيات", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010250", name_ar: "مقاول معدات - شركة رواد", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010260", name_ar: "مقاول شريف", type: "liability", level: 4, parent_code: "23010" },
  { code: "23010265", name_ar: "مقاول المقدم للالومنيوم", type: "liability", level: 4, parent_code: "23010" }
];

let toReplace = code.trim();
if (toReplace.endsWith("];")) {
  let customStr = newAccounts.map(a => {
    return `{ code: "${a.code}", name_ar: "${a.name_ar}"${a.name_en ? `, name_en: "${a.name_en}"` : ''}, type: "${a.type}", level: ${a.level}${a.parent_code ? `, parent_code: "${a.parent_code}"` : ''} }`;
  }).join(',\n  ');
  
  let fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + customStr + "\n];\n";

  fs.writeFileSync('src/shared/data/oracleAccounts.ts', fixedCode);
  console.log("Appended liabilities successfully.");
} else {
  console.log("Could not find the array ending to append.");
}
