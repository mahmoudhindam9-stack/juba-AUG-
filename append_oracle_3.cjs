const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  { code: "120", name_ar: "مشروعات تحت التنفيذ", name_en: "Projects under construction", type: "asset", level: 2, parent_code: "1" },
  { code: "12010", name_ar: "مشروعات تحت التنفيذ المول", type: "asset", level: 3, parent_code: "120" },
  { code: "12010130", name_ar: "الاتحاد العربي اعمال اعتيادية", name_en: "ElEtehd El Araby - Building", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010140", name_ar: "نقل وانتقال", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010150", name_ar: "اعمال اعتيادية - عمالة يومية", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010160", name_ar: "تجهيزات كهربائية", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010170", name_ar: "ايجار معدات", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010180", name_ar: "صيانة معدات - نيوانترناشيونال", name_en: "New International -MENTENANCE", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010190", name_ar: "اعمال كهرباء - وينر", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010195", name_ar: "اعمال كرنفال وينر", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010200", name_ar: "اختبار تربة", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010210", name_ar: "تجهيزات زراعية", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010220", name_ar: "لافتات", name_en: "Banars", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010230", name_ar: "شحنة زجاج", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010240", name_ar: "تشطيبات - ابواب", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010250", name_ar: "عدد وادوات", type: "asset", level: 4, parent_code: "12010" },
  { code: "12010260", name_ar: "اعمال مباني سكنية", type: "asset", level: 4, parent_code: "12010" },

  { code: "12020", name_ar: "مشروعات سنتر بوب", name_en: "Work on Process -Central bob", type: "asset", level: 3, parent_code: "120" },
  { code: "12020120", name_ar: "ايجار معدات", name_en: "rent equipments", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020130", name_ar: "خامات بناء", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020140", name_ar: "متنوعة واكراميات", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020145", name_ar: "دعاية واعلان", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020150", name_ar: "اعمال اعتيادية - عمالة يومية", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020156", name_ar: "اعمال كهرباء سنترال بوب", name_en: "Central Bob electrical works", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020160", name_ar: "مشروعات تصميمات سنتر بوب - حافظ", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020170", name_ar: "ايجار معدات سنترال بوب", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020190", name_ar: "اراضي المطاطية الحديقة", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020200", name_ar: "شبكة ري السنترال بوب", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020210", name_ar: "اعمال زراعة سنترال بوب", name_en: "Central Pop planting works", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020220", name_ar: "جمارك مستلزمات وخامات", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020230", name_ar: "عدد وادوات سنترال بوب", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020235", name_ar: "تجهيزات السنترال بوب", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020240", name_ar: "مباني انشاءات السنترال", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020241", name_ar: "العاب اطفال السنترال بوب", name_en: "games children central", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020245", name_ar: "اجهزة ومعدات سنترال", name_en: "Machinary_Equipment -R S Central", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020246", name_ar: "اعمال رخام السنترال بوب", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020300", name_ar: "اعمال مباني المرحلة الـ 3 (١٢ - ٢٦) هارفارد", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020302", name_ar: "اعمال سنترال بوب هارفارد مطعم", type: "asset", level: 4, parent_code: "12020" },
  { code: "12020303", name_ar: "اعمال سنترال بوب هارفارد الحديقة", type: "asset", level: 4, parent_code: "12020" },

  { code: "12030", name_ar: "مشروعات دريم بارك جوبا", name_en: "Projects - Dream Park, Juba", type: "asset", level: 3, parent_code: "120" },
  { code: "12030100", name_ar: "تصميمات - دريم بارك - حافظ", type: "asset", level: 4, parent_code: "12030" }
];

let replaced = false;
let toReplace = code.trim();
if (toReplace.endsWith("];")) {
  let customStr = newAccounts.map(a => {
    return `{ code: "${a.code}", name_ar: "${a.name_ar}"${a.name_en ? `, name_en: "${a.name_en}"` : ''}, type: "${a.type}", level: ${a.level}, parent_code: "${a.parent_code}" }`;
  }).join(',\n  ');
  
  let fixedCode = toReplace.substring(0, toReplace.length - 2) + ",\n  " + customStr + "\n];\n";

  fs.writeFileSync('src/shared/data/oracleAccounts.ts', fixedCode);
  console.log("Appended new assets accounts successfully.");
} else {
  console.log("Could not find the array ending to append.");
}
