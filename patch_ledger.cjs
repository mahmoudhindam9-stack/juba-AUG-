const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const importFunction = `
  const [isImportingOracle, setIsImportingOracle] = useState(false);
  const handleImportOracle2015 = async () => {
    try {
      setIsImportingOracle(true);
      const module = await import('@/shared/data/oracle2015Seed');
      const journals = module.ORACLE_2015_JOURNALS;
      if (journals && journals.length > 0) {
        journals.forEach(je => {
          // Add to store
          erpStore.addJournalEntry(je);
        });
        alert(\`تم استيراد \${journals.length} قيد (بإجمالي \${journals.reduce((acc, j) => acc + j.lines.length, 0)} سطر) من أوراكل بنجاح!\`);
        // Force re-render
        setErpState(erpStore.getState());
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الاستيراد');
    } finally {
      setIsImportingOracle(false);
    }
  };
`;

// Insert the state and function near the top of LedgerPage, say around line 91 (after const [selectedTab...])
content = content.replace(/const \[selectedTab, setSelectedTab\] = useState\("ledger"\);/, "const [selectedTab, setSelectedTab] = useState(\"ledger\");\n" + importFunction);

// Insert the button
const buttonHTML = `
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleImportOracle2015}
                  disabled={isImportingOracle}
                  className="gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {isImportingOracle ? "جاري الاستيراد..." : "استيراد قيود أوراكل 2015"}
                </Button>
`;
content = content.replace(/<FileSpreadsheet className="h-4 w-4" \/>\s*تصدير دفتر اليومية بصيغة Excel\s*<\/Button>/, '<FileSpreadsheet className="h-4 w-4" />\n                  تصدير دفتر اليومية بصيغة Excel\n                </Button>\n' + buttonHTML);

fs.writeFileSync(path, content, 'utf8');
