const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
  const workbook = xlsx.readFile('2015.xls');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Skip header row
  const rows = data.slice(1).filter(r => r.length > 0 && r[1]); 

  // Excel date serial number to JS Date
  function excelDateToJSDate(serial) {
    if (typeof serial === 'string') return new Date(serial).toISOString();
    if (!serial) return new Date().toISOString();
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString();
  }

  const transactions = rows.map(row => {
    return {
      account_code: String(row[1] || ""),
      account_name: row[2] || "",
      currency: row[4] || "عملة محلية",
      date: excelDateToJSDate(row[5]),
      description: row[6] || "",
      debit: Number(row[7] || 0),
      credit: Number(row[8] || 0),
      document_number: row[11],
      journal_number: row[12],
      period: row[13],
      main_description: row[18] || row[6] || "",
      entry_type: row[21] || "",
      bal_trx: row[22] || "TRX"
    };
  });

  const outputDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'oracle_2015.json'), JSON.stringify(transactions, null, 2), 'utf8');
  console.log(`Successfully processed ${transactions.length} transactions and saved to public/data/oracle_2015.json`);

} catch (e) {
  console.error("Error processing file:", e.message);
}
