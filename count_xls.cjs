const xlsx = require('xlsx');
try {
  const workbook = xlsx.readFile('2015.xls');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log("Total Rows:", data.length);
} catch (e) {
  console.error("Error reading file:", e.message);
}
