const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

// Clean up old incorrect 16010100 if present
code = code.replace(/\{\s*code:\s*"16010100",\s*name_ar:\s*"مدينون متنوعون"[^\}]+\},?\s*/g, '');

const newAccounts = [
  // 160
  { code: "16010100", name_ar: "ممدوح حكمت", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010110", name_ar: "صالح اسماعيل حافظ", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010112", name_ar: "دكتور احمد بهجت نصيب فى راس المال", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010114", name_ar: "محمد حفني - نصيب راس المال", name_en: "Mohamed Hefny - share of the capital", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010116", name_ar: "احمد حسام - نصيب فى راس المال", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010120", name_ar: "محمد عصام الدين حافظ دريم لاند", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010121", name_ar: "محمد عصام الدين حافظ تصميمات دريم بارك", type: "asset", level: 4, parent_code: "16010" },
  { code: "16010122", name_ar: "الشركة الصينية", type: "asset", level: 4, parent_code: "16010" },
  
  { code: "16012", name_ar: "اطراف ذات علاقة مدينة", name_en: "Related parties", type: "asset", level: 3, parent_code: "160" },
  { code: "16012100", name_ar: "دكتور احمد بهجت", type: "asset", level: 4, parent_code: "16012" },
  { code: "16012102", name_ar: "مشروع شمال السودان", type: "asset", level: 4, parent_code: "16012" },
  
  // 170
  { code: "17010", name_ar: "ارصدة مدينة اخرى", name_en: "Other debitors", type: "asset", level: 3, parent_code: "170" },
  { code: "17010100", name_ar: "حساب تسويات", type: "asset", level: 4, parent_code: "17010" },
  
  { code: "17012", name_ar: "تسويات", name_en: "Adjustments", type: "asset", level: 3, parent_code: "170" },
  { code: "17012100", name_ar: "تسويات الشويخ", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012110", name_ar: "تسويات عاطف راشد", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012120", name_ar: "تسويات عماد سليمان", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012130", name_ar: "تسويات على الصورى", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012140", name_ar: "تسويات كيندى", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012150", name_ar: "تسويات احمد حسام", name_en: "Ahmed Hossam\\'s settlements", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012152", name_ar: "تسويات كانان", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012160", name_ar: "تسويات محمد شريف", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012170", name_ar: "تسويات الاتحاد العربى", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012180", name_ar: "تسويات وينر", name_en: "Winner Adjustments", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012185", name_ar: "تسويات هارفارد - ممدوح", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012200", name_ar: "تسويات خزينة سودانى", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012205", name_ar: "تسويات خزينة دولار", type: "asset", level: 4, parent_code: "17012" },
  { code: "17012210", name_ar: "تسويات بنوك", type: "asset", level: 4, parent_code: "17012" },

  // 180
  { code: "18010", name_ar: "مقابل حق انتفاع", type: "asset", level: 3, parent_code: "180" },
  { code: "18010100", name_ar: "مقابل حق انتفاع ارض المول", type: "asset", level: 4, parent_code: "18010" },
  { code: "18010110", name_ar: "مقابل حق انتفاع ارض السنترال بوب", type: "asset", level: 4, parent_code: "18010" },
];

let toReplace = code.trim();
if (toReplace.endsWith("];")) {
  let customStr = newAccounts.map(a => {
    return `{ code: "${a.code}", name_ar: "${a.name_ar}"${a.name_en ? `, name_en: "${a.name_en}"` : ''}, type: "${a.type}", level: ${a.level}, parent_code: "${a.parent_code}" }`;
  }).join(',\n  ');
  
  let fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + customStr + "\n];\n";

  fs.writeFileSync('src/shared/data/oracleAccounts.ts', fixedCode);
  console.log("Appended remaining assets accounts successfully.");
} else {
  console.log("Could not find the array ending to append.");
}
