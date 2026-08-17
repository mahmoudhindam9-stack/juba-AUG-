import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

// Add state for selected treasury and container
content = content.replace(
  '  const [tableId, setTableId] = useState<string>("");',
  '  const [tableId, setTableId] = useState<string>("");\n  const [selectedTreasury, setSelectedTreasury] = useState<string>("tr-1");\n  const [selectedContainer, setSelectedContainer] = useState<string>("");',
);

// Add the UI for it
const selectorUI = `
            {/* Treasury & Container Selection */}
            <div className="mb-4">
              <Label className="text-sm font-bold block mb-1.5">الخزينة المستلمة (Treasury)</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-bold focus:outline-none mb-3"
                value={selectedTreasury}
                onChange={(e) => {
                  setSelectedTreasury(e.target.value);
                  setSelectedContainer(""); // reset container
                }}
              >
                {erpStore.getState().treasuries.filter(t => !t.deleted && t.is_open).map(tr => (
                  <option key={tr.id} value={tr.id}>{tr.name_ar} ({tr.currency})</option>
                ))}
              </select>
              
              {erpStore.getState().treasuries.find(t => t.id === selectedTreasury)?.containers?.length ? (
                <>
                  <Label className="text-sm font-bold block mb-1.5 text-emerald-600 dark:text-emerald-400">وعاء العملة (Currency Container)</Label>
                  <select
                    className="w-full h-10 rounded-md border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 text-sm font-bold focus:outline-none"
                    value={selectedContainer}
                    onChange={(e) => setSelectedContainer(e.target.value)}
                  >
                    <option value="">-- اختر الوعاء --</option>
                    {erpStore.getState().treasuries.find(t => t.id === selectedTreasury)?.containers?.map(cnt => (
                      <option key={cnt.id} value={cnt.id}>{cnt.name} ({cnt.currency})</option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>
`;

content = content.replace(
  "            {/* Table Selection */}",
  selectorUI + "\n            {/* Table Selection */}",
);

content = content.replace(
  "          data.payment_method,\n          erpStore.getState().currentBranchId,\n          currency,\n        );",
  "          data.payment_method,\n          erpStore.getState().currentBranchId,\n          currency,\n          selectedTreasury,\n          selectedContainer\n        );",
);

fs.writeFileSync("src/routes/index.tsx", content);
