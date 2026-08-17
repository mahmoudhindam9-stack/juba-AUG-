const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  // 240 Suppliers / Vendors (الموردون) - Based on the images context we can infer this section
  { code: "240", name_ar: "الموردون", type: "liability", level: 2, parent_code: "2" },
  { code: "24010", name_ar: "موردون محليون", type: "liability", level: 3, parent_code: "240" },
  { code: "24010100", name_ar: "موردين قطع غيار دريم لاند", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010110", name_ar: "موردين اجهزة ومعدات", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010120", name_ar: "موردين مواد غذائية", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010130", name_ar: "موردين ادوات نظافة", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010140", name_ar: "موردين ادوات كتابية ومطبوعات", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010150", name_ar: "موردين مهمات تشغيل", type: "liability", level: 4, parent_code: "24010" },
  { code: "24010160", name_ar: "موردين مواد تعبئة وتغليف", type: "liability", level: 4, parent_code: "24010" },
  
  // 250 Creditors & Other Credit Balances (دائنون وارصدة دائنة اخرى)
  { code: "250", name_ar: "دائنون وارصدة دائنة اخرى", type: "liability", level: 2, parent_code: "2" },
  { code: "25010", name_ar: "دائنون متنوعون", type: "liability", level: 3, parent_code: "250" },
  { code: "25010100", name_ar: "دائنو شراء اصول ثابتة", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010110", name_ar: "تأمينات للغير", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010120", name_ar: "تأمين الايجار", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010130", name_ar: "دفعات مقدمة من العملاء", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010140", name_ar: "مصروفات مستحقة", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010150", name_ar: "ضرائب مستحقة", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010160", name_ar: "مصلحة الضرائب", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010170", name_ar: "مصلحة التامينات الاجتماعية", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010180", name_ar: "الهيئة العامة للتامين الصحي", type: "liability", level: 4, parent_code: "25010" },
  { code: "25010190", name_ar: "ارصدة دائنة اخري", type: "liability", level: 4, parent_code: "25010" },
  
  // 260 Provisions (مخصصات)
  { code: "260", name_ar: "المخصصات", type: "liability", level: 2, parent_code: "2" },
  { code: "26010", name_ar: "مخصصات متنوعة", type: "liability", level: 3, parent_code: "260" },
  { code: "26010100", name_ar: "مخصص قضايا ومنازعات", type: "liability", level: 4, parent_code: "26010" },
  { code: "26010110", name_ar: "مخصص ديون مشكوك فيها", type: "liability", level: 4, parent_code: "26010" },
  { code: "26010120", name_ar: "مخصص مطالبات محتملة", type: "liability", level: 4, parent_code: "26010" },
  
  // 270 Long Term Loans (قروض طويلة الاجل)
  { code: "270", name_ar: "قروض وتسهيلات ائتمانية", type: "liability", level: 2, parent_code: "2" },
  { code: "27010", name_ar: "قروض بنكية", type: "liability", level: 3, parent_code: "270" },
  { code: "27010100", name_ar: "قرض البنك الاهلي", type: "liability", level: 4, parent_code: "27010" },
  { code: "27010110", name_ar: "قرض بنك مصر", type: "liability", level: 4, parent_code: "27010" },
  { code: "27010120", name_ar: "تسهيلات ائتمانية سحب علي المكشوف", type: "liability", level: 4, parent_code: "27010" }
];

let toReplace = code.trim();
if (toReplace.endsWith("];")) {
  let customStr = newAccounts.map(a => {
    return `{ code: "${a.code}", name_ar: "${a.name_ar}"${a.name_en ? `, name_en: "${a.name_en}"` : ''}, type: "${a.type}", level: ${a.level}${a.parent_code ? `, parent_code: "${a.parent_code}"` : ''} }`;
  }).join(',\n  ');
  
  let fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + customStr + "\n];\n";

  fs.writeFileSync('src/shared/data/oracleAccounts.ts', fixedCode);
  console.log("Appended remaining liabilities successfully.");
} else {
  console.log("Could not find the array ending to append.");
}
