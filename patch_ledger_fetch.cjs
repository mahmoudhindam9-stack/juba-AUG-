const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const newFunc = `
  const handleImportOracle2015 = async () => {
    try {
      setIsImportingOracle(true);
      const res = await fetch('/data/oracle_2015.json');
      const data = await res.json();
      
      const validData = data.filter((r) => r.debit > 0 || r.credit > 0);
      
      let count = 0;
      let linesCount = 0;

      // Opening Balances
      const openingLines = validData.filter((r) => r.bal_trx === 'BAL');
      if (openingLines.length > 0) {
        erpStore.addJournalEntry(
          'القيد الافتتاحي - أرصدة أول المدة 2015 (أوراكل)',
          openingLines.map((line) => ({
            account_code: line.account_code,
            debit: line.debit,
            credit: line.credit,
            description: line.description,
            currency: line.currency === 'عملة محلية' ? 'EGP' : line.currency === 'جنيه سودانى' ? 'SSP' : line.currency === 'دولار' ? 'USD' : 'EGP',
            rate: 1
          })),
          'OPENING-2015',
          'EGP',
          '2015-01-01T00:00:00.000Z',
          'ORACLE-2015-OPENING'
        );
        count++;
        linesCount += openingLines.length;
      }

      // TRX
      const trxLines = validData.filter((r) => r.bal_trx === 'TRX');
      const groups = {};
      trxLines.forEach(line => {
        const jNum = line.journal_number;
        if (!groups[jNum]) groups[jNum] = [];
        groups[jNum].push(line);
      });

      Object.keys(groups).forEach(jNum => {
        const lines = groups[jNum];
        const firstLine = lines[0];
        erpStore.addJournalEntry(
          firstLine.main_description || \`قيد رقم \${jNum} من أوراكل\`,
          lines.map((line) => ({
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
          \`ORACLE-2015-\${jNum}\`
        );
        count++;
        linesCount += lines.length;
      });

      alert(\`تم استيراد \${count} قيد (بإجمالي \${linesCount} سطر) من أوراكل بنجاح!\`);
      setErpState(erpStore.getState());
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الاستيراد');
    } finally {
      setIsImportingOracle(false);
    }
  };
`;

content = content.replace(/const handleImportOracle2015 = async \(\) => \{[\s\S]*?\} finally \{\s*setIsImportingOracle\(false\);\s*\}\s*\};\s*/, newFunc);

fs.writeFileSync(path, content, 'utf8');
