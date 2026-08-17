const fs = require('fs');
let code = fs.readFileSync('src/shared/data/oracleAccounts.ts', 'utf-8');

const newAccounts = [
  { code: "150", name_ar: "عهد وسلف", name_en: "Employee Debit", type: "asset", level: 2, parent_code: "1" },
  { code: "15010", name_ar: "عهد وسلف", type: "asset", level: 3, parent_code: "150" },
  { code: "15010100", name_ar: "محمد الشريف", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010102", name_ar: "عهدة محمد الشريف 2", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010103", name_ar: "تحويلات مصري - شريف", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010105", name_ar: "محمد شريف - مصري", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010110", name_ar: "احمد الشويخ", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010112", name_ar: "معتز - عهدة", name_en: "Moataz - custody", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010113", name_ar: "عبد الحفيظ", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010115", name_ar: "عماد سليمان", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010120", name_ar: "كون كول", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010130", name_ar: "احمد الدقرى", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010140", name_ar: "عاطف راشد", name_en: "Mr. Atif Rashed", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010150", name_ar: "احمد حسام", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010160", name_ar: "سالي عاطف", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010170", name_ar: "محمد عزت", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010180", name_ar: "وائل اسماعيل", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010190", name_ar: "ممدوح", name_en: "Mamdouh", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010200", name_ar: "علي الصوري", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010210", name_ar: "اميرو", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010220", name_ar: "ايمن عباس", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010230", name_ar: "ايهاب راشد", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010235", name_ar: "عهدة جمال عطا الله", name_en: "Gamal Ata Allah", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010240", name_ar: "سلف عاملين اجمالى", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010250", name_ar: "عمر بهجت", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010260", name_ar: "كيندى", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010270", name_ar: "محمد عباس", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010280", name_ar: "محمد فايز", name_en: "Mohamed fayez", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010290", name_ar: "محمود المساح", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010300", name_ar: "جوليا عامله", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010310", name_ar: "نتالينا عاملة", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010320", name_ar: "خالد ثابت", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010330", name_ar: "رمزى ابراهيم", name_en: "Ramzy ibrahim", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010340", name_ar: "جون رومان", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010350", name_ar: "مبيوتى", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010360", name_ar: "أ/دينق المحامى", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010365", name_ar: "وليد احمد مسئول الصيانة", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010370", name_ar: "مارتن جمعة", name_en: "Martin Gomaa", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010380", name_ar: "ديفيد فيليب", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010390", name_ar: "احمد بهنسى", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010400", name_ar: "فلبرتو لوكت", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010410", name_ar: "دمونيك", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010411", name_ar: "شيماء عاملة", name_en: "shimaa hous", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010420", name_ar: "وليد - مصر", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010421", name_ar: "امين عمر", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010422", name_ar: "هشام نور", name_en: "Hesham nor", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010423", name_ar: "محمد سعيد", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010424", name_ar: "ملك بوفيه", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010425", name_ar: "سفيان السائق", type: "asset", level: 4, parent_code: "15010" },
  { code: "15010426", name_ar: "فيكتور عامل جديد بالامن", type: "asset", level: 4, parent_code: "15010" },

  { code: "15020", name_ar: "عهد عاملين FM", name_en: "Employee Debit FM", type: "asset", level: 3, parent_code: "150" },
  { code: "15020100", name_ar: "سالى عاطف FM", type: "asset", level: 4, parent_code: "15020" },

  { code: "160", name_ar: "مدينون", name_en: "Debtors", type: "asset", level: 2, parent_code: "1" },
  { code: "16010", name_ar: "مدينون", type: "asset", level: 3, parent_code: "160" },
  { code: "16010100", name_ar: "مدينون متنوعون", name_en: "Various debtors", type: "asset", level: 4, parent_code: "16010" }
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
