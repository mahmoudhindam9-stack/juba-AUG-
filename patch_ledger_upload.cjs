const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const newFunc = `
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImportingOracle(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // skip header
          const dataRows = rows.slice(1).filter(r => r.length > 0 && r[1]);

          function excelDateToJSDate(serial) {
            if (typeof serial === 'string') return new Date(serial).toISOString();
            if (!serial) return new Date().toISOString();
            const utc_days  = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            return date_info.toISOString();
          }

          const validData = dataRows.map(row => {
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
          }).filter(r => r.debit > 0 || r.credit > 0);

          let count = 0;
          let linesCount = 0;

          // Opening Balances
          const openingLines = validData.filter(r => r.bal_trx === 'BAL');
          if (openingLines.length > 0) {
            erpStore.addJournalEntry(
              \`القيد الافتتاحي - أرصدة أول المدة (\${file.name})\`,
              openingLines.map(line => ({
                account_code: line.account_code,
                debit: line.debit,
                credit: line.credit,
                description: line.description,
                currency: line.currency === 'عملة محلية' ? 'EGP' : line.currency === 'جنيه سودانى' ? 'SSP' : line.currency === 'دولار' ? 'USD' : 'EGP',
                rate: 1
              })),
              \`OPENING-\${Date.now()}\`,
              'EGP',
              '2015-01-01T00:00:00.000Z',
              \`ORACLE-OPENING-\${Date.now()}\`
            );
            count++;
            linesCount += openingLines.length;
          }

          // TRX
          const trxLines = validData.filter(r => r.bal_trx === 'TRX');
          const groups = {};
          trxLines.forEach(line => {
            const jNum = line.journal_number || 'UNKNOWN';
            if (!groups[jNum]) groups[jNum] = [];
            groups[jNum].push(line);
          });

          Object.keys(groups).forEach(jNum => {
            const lines = groups[jNum];
            const firstLine = lines[0];
            erpStore.addJournalEntry(
              firstLine.main_description || \`قيد رقم \${jNum} من أوراكل\`,
              lines.map(line => ({
                account_code: line.account_code,
                debit: line.debit,
                credit: line.credit,
                description: line.description,
                currency: line.currency === 'عملة محلية' ? 'EGP' : line.currency === 'جنيه سودانى' ? 'SSP' : line.currency === 'دولار' ? 'USD' : 'EGP',
                rate: 1
              })),
              \`ORACLE-\${jNum}\`,
              'EGP',
              firstLine.date,
              \`ORACLE-TRX-\${jNum}-\${Date.now()}\`
            );
            count++;
            linesCount += lines.length;
          });

          alert(\`تم استيراد \${count} قيد (بإجمالي \${linesCount} سطر) من الملف \${file.name} بنجاح!\`);
          setErpState(erpStore.getState());
        } catch(err) {
          console.error(err);
          alert("حدث خطأ أثناء معالجة الملف. تأكد من أن الملف بنفس صيغة أوراكل.");
        } finally {
          setIsImportingOracle(false);
          if (e.target) e.target.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاستيراد');
      setIsImportingOracle(false);
      if (e.target) e.target.value = '';
    }
  };
`;

content = content.replace(/const handleImportOracle2015 = async \(\) => \{[\s\S]*?\} finally \{\s*setIsImportingOracle\(false\);\s*\}\s*\};\s*/, newFunc);

const buttonHtml = `
                <div className="relative inline-block">
                  <input
                    type="file"
                    accept=".xls,.xlsx,.csv"
                    onChange={handleFileUpload}
                    disabled={isImportingOracle}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    title="اختر ملف إكسيل لرفعه"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    disabled={isImportingOracle}
                    className="gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white w-full pointer-events-none"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {isImportingOracle ? "جاري الاستيراد..." : "رفع ملف قيود أوراكل Excel"}
                  </Button>
                </div>
`;

content = content.replace(/<Button\s*variant="default"\s*size="sm"\s*onClick=\{handleImportOracle2015\}[\s\S]*?<\/Button>/, buttonHtml);

fs.writeFileSync(path, content, 'utf8');
