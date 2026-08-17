const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = `
  { code: "11020", name_ar: "اصول ثابتة FM", name_en: "ASSETS FM", type: "asset", level: 3, parent_code: "110" },
  { code: "11020100", name_ar: "الات ومعدات اذاعة", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020110", name_ar: "تجهيزات مبنى الاذاعة", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020120", name_ar: "تجهيزات سكن الاذاعة", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020130", name_ar: "مولدات", name_en: "Generator", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020140", name_ar: "اثاث ومفروشات واجهزة كهربائية", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020150", name_ar: "دراسة جدوى", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020160", name_ar: "اغانى", type: "asset", level: 4, parent_code: "11020" },
  { code: "11020170", name_ar: "حاسب الى", type: "asset", level: 4, parent_code: "11020" },

  { code: "11030", name_ar: "اصول ثابتة سنترال بوب", type: "asset", level: 3, parent_code: "110" },
  { code: "11030100", name_ar: "اجهزة ومعدات السنترال بوب", type: "asset", level: 4, parent_code: "11030" },

  { code: "112", name_ar: "اصول استثمار عقاري", name_en: "real estate investment assets", type: "asset", level: 2, parent_code: "1" },
  
  { code: "11210", name_ar: "اصول استثمار عقارى المول", type: "asset", level: 3, parent_code: "112" },
  { code: "11210100", name_ar: "مبانى وتجهيزات المول - عقارى", type: "asset", level: 4, parent_code: "11210" },
  { code: "11210110", name_ar: "الات ومعدات المول - عقارى", type: "asset", level: 4, parent_code: "11210" },
  { code: "11210200", name_ar: "مجمع اهلاك مبانى وتجهيزات المول - استثمار عق", type: "asset", level: 4, parent_code: "11210" },
  { code: "11210210", name_ar: "مجمع اهلاك الات ومعدات المول - عقارى", type: "asset", level: 4, parent_code: "11210" },

  { code: "11212", name_ar: "اصول استثمار عقارى السنترال", name_en: "Central real estate investment assets", type: "asset", level: 3, parent_code: "112" },
  { code: "11212100", name_ar: "مبانى وتجهيزات السنترال - عقارى", type: "asset", level: 4, parent_code: "11212" },
  { code: "11212110", name_ar: "الات ومعدات السنترال - عقارى", name_en: "Central machinery and equipment - RS", type: "asset", level: 4, parent_code: "11212" },
  { code: "11212120", name_ar: "اعمال زراعة ولاند سكيب السنترال - عقارى", type: "asset", level: 4, parent_code: "11212" },
  { code: "11212200", name_ar: "مجمع اهلاك مبانى وتجهيزات السنترال - استثمار", type: "asset", level: 4, parent_code: "11212" },
  { code: "11212210", name_ar: "مجمع اهلاك الات ومعدات السنترال - عقارى", type: "asset", level: 4, parent_code: "11212" },
  { code: "11212220", name_ar: "مجمع اهلاك اعمال زراعة ولاند سكيب السنترال -", type: "asset", level: 4, parent_code: "11212" }
];`;

code = code.replace("];", newAccounts);

fs.writeFileSync('src/shared/data/oracleAccounts.ts', code);
console.log("Appended accounts successfully.");
