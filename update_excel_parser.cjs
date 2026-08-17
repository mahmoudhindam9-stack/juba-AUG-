const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const validData = dataRows\.map\(row => \{[\s\S]*?\}\)\.filter\(r => r\.debit > 0 \|\| r\.credit > 0\);/m;

const newParser = `
          const validData = dataRows.map(row => {
            // Mapping based on the exact image column layout:
            // row[0]: م
            // row[1]: كود الحساب (account_code)
            // row[2]: اسم الحساب (account_name)
            // row[3]: قيمة مدين (debit) -> Base Currency
            // row[4]: قيمة دائن (credit) -> Base Currency
            // row[5]: بيان الحساب (description)
            // row[6]: تاريخ القيد (date)
            // ...
            // row[12]: رقم القيد (journal_number)
            // ...
            // row[18]: بيان رئيسي للقيد (main_description)
            // ...
            // row[20]: العملة (currency_name)
            // row[21]: المعامل (exchange_rate)
            // row[22]: مدين عملة (debit_currency)
            // row[23]: دائن عملة (credit_currency)

            let debit = Number(row[3]) || 0;
            let credit = Number(row[4]) || 0;
            
            // In case the structure shifts slightly and amounts are empty, fallback to local currency cols if possible
            if (debit === 0 && credit === 0) {
               debit = Number(row[22]) || 0;
               credit = Number(row[23]) || 0;
            }

            const rawCurrency = String(row[20] || "EGP").toLowerCase();
            let currency = 'EGP';
            if (rawCurrency.includes('دولار') || rawCurrency.includes('usd')) currency = 'USD';
            else if (rawCurrency.includes('سودان') || rawCurrency.includes('ssp')) currency = 'SSP';

            return {
              account_code: String(row[1] || ""),
              account_name: row[2] || "",
              currency: currency,
              date: excelDateToJSDate(row[6] || row[5]), // Check col 6 first, fallback col 5
              description: row[5] || "",
              debit: debit,
              credit: credit,
              journal_number: row[12] || row[11] || "0",
              main_description: row[18] || row[17] || row[5] || "",
              bal_trx: "TRX" // By default mark all as TRX based on this sheet format
            };
          }).filter(r => r.debit > 0 || r.credit > 0);
`;

content = content.replace(regex, newParser.trim());
fs.writeFileSync(path, content, 'utf8');
