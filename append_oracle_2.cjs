const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  { code: "115", name_ar: "مصروفات ما قبل النشاط", name_en: "Pre-activity expenses", type: "asset", level: 2, parent_code: "1" },
  
  { code: "11510", name_ar: "مصروفات ما قبل النشاط", type: "asset", level: 3, parent_code: "115" },
  { code: "11510135", name_ar: "سولار", name_en: "solar", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510140", name_ar: "رسوم قانونية", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510145", name_ar: "صيانة وقطع غيار", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510150", name_ar: "مصروفات وفد السودان", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510160", name_ar: "رسوم وتراخيص", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510170", name_ar: "ضيافة وبوفيه", name_en: "Hospitality and buffet", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510180", name_ar: "مصروفات علاج", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510190", name_ar: "ايجار سيارات", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510200", name_ar: "بدل اعاشة امن", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510210", name_ar: "اتعاب مراقب الحسابات", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510220", name_ar: "نقل وانتقال", name_en: "transportation", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510230", name_ar: "تليفون وكروت شحن", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510240", name_ar: "مصروفات سفر", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510250", name_ar: "اعمال اعتيادية - مواد وخامات بناء", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510260", name_ar: "متنوعة واكراميات", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510270", name_ar: "صيانة عامة", name_en: "Maintenance", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510280", name_ar: "مصروفات سيارة", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510290", name_ar: "اعمال اعتيادية - عمالة يومية", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510300", name_ar: "هدايا", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510310", name_ar: "ادوات كتابية ومطبوعات", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510320", name_ar: "دعاية واعلان", name_en: "Advertising", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510330", name_ar: "حاسب الى", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510340", name_ar: "انترنت", name_en: "internet", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510350", name_ar: "ايجار معدات", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510360", name_ar: "مصاريف وعمولات بنكية", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510380", name_ar: "مصروفات نظافة", type: "asset", level: 4, parent_code: "11510" },
  { code: "11510390", name_ar: "مياه", type: "asset", level: 4, parent_code: "11510" },

  { code: "11520", name_ar: "مصروفات ما قبل النشاط FM", name_en: "Establishment expenses FM", type: "asset", level: 3, parent_code: "115" },
  { code: "11520100", name_ar: "تذاكر طيران", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520110", name_ar: "رسوم تردد اذاعى وتراخيص", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520120", name_ar: "بدلات سفر", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520125", name_ar: "اجور ومرتبات ومكافاءات", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520130", name_ar: "اقامات فنادق", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520135", name_ar: "سولار", name_en: "solar", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520140", name_ar: "رسوم قانونية", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520145", name_ar: "صيانة وقطع غيار", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520150", name_ar: "ايجار مبنى الاذاعة", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520160", name_ar: "رسوم وتراخيص", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520170", name_ar: "ضيافة وبوفيه", name_en: "Hospitality and buffet", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520180", name_ar: "مصروفات علاج", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520190", name_ar: "ايجار سيارات", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520200", name_ar: "بدل اعاشة امن", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520210", name_ar: "اتعاب مراقب الحسابات", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520220", name_ar: "نقل وانتقال", name_en: "transportation", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520230", name_ar: "تليفون وكروت شحن", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520240", name_ar: "مصروفات سفر", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520250", name_ar: "اعمال اعتيادية - مواد وخامات بناء", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520260", name_ar: "متنوعة واكراميات", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520270", name_ar: "صيانة عامة", name_en: "Maintenance", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520280", name_ar: "مصروفات سيارة", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520290", name_ar: "اعمال اعتيادية - عمالة يومية", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520300", name_ar: "هدايا", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520310", name_ar: "ادوات كتابية ومطبوعات", name_en: "Office supplies", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520320", name_ar: "دعاية واعلان وحفل الافتتاح", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520330", name_ar: "حاسب الى", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520340", name_ar: "انترنت", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520350", name_ar: "ايجار معدات", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520360", name_ar: "مصاريف وعمولات بنكية", name_en: "Bank fees and commissions", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520380", name_ar: "مصروفات نظافة", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520390", name_ar: "مياه", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520400", name_ar: "اختبار تربة اف ام", type: "asset", level: 4, parent_code: "11520" },
  { code: "11520500", name_ar: "اعمال ما قبل النشاط اذاعة", type: "asset", level: 4, parent_code: "11520" }
];

let replaced = false;
let toReplace = code.trim();
if (toReplace.endsWith("];")) {
  let innerStr = newAccounts.map(a => JSON.stringify(a)).join(',\n  ');
  // the original string ends with `];`
  let fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + innerStr + "\n];\n";
  // cleanup some JSON quotes on keys so it matches TS file style if needed, but JSON.stringify is valid TS.
  // better yet, just write it exactly like the others.
  
  // Just to be perfectly matching:
  let customStr = newAccounts.map(a => {
    return `{ code: "${a.code}", name_ar: "${a.name_ar}"${a.name_en ? `, name_en: "${a.name_en}"` : ''}, type: "${a.type}", level: ${a.level}, parent_code: "${a.parent_code}" }`;
  }).join(',\n  ');
  
  fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + customStr + "\n];\n";

  fs.writeFileSync('src/shared/data/oracleAccounts.ts', fixedCode);
  console.log("Appended new assets accounts successfully.");
} else {
  console.log("Could not find the array ending to append.");
}
