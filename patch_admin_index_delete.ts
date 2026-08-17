import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

// Add state
content = content.replace(
  "  const [editingTreasuryId, setEditingTreasuryId] = useState<string | null>(null);",
  "  const [editingTreasuryId, setEditingTreasuryId] = useState<string | null>(null);\n  const [treasuryToDelete, setTreasuryToDelete] = useState<any | null>(null);",
);

// Update handleDeleteTreasury
content = content.replace(
  `  const handleDeleteTreasury = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزينة؟ سيتم نقلها للأرشيف.")) {
      try {
        erpStore.deleteTreasury(id);
        setErpState(erpStore.getState());
      } catch (error: any) {
        alert(error.message || "فشلت عملية الحذف");
      }
    }
  };`,
  `  const confirmDeleteTreasury = (id: string) => {
    try {
      erpStore.deleteTreasury(id);
      setErpState(erpStore.getState());
      setTreasuryToDelete(null);
    } catch (error: any) {
      alert(error.message || "فشلت عملية الحذف");
    }
  };`,
);

// Update button onClick
content = content.replace(
  "onClick={() => handleDeleteTreasury(tr.id)}",
  "onClick={(e) => { e.stopPropagation(); setTreasuryToDelete(tr); }}",
);

// Add the delete confirmation modal
const modalHTML = `
      {/* TREASURY DELETE CONFIRMATION MODAL */}
      {treasuryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-card border border-border text-card-foreground rounded-2xl w-full max-w-md p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">تأكيد حذف الخزينة</h3>
            <p className="mb-6 text-muted-foreground">
              هل أنت متأكد من رغبتك في حذف الخزينة: <span className="font-bold text-foreground">{treasuryToDelete.name_ar}</span>؟
              <br/><br/>
              إذا كانت الخزينة تحتوي على حركات مالية سابقة، سيتم أرشفتها بأمان بدلاً من حذفها نهائياً حفاظاً على سلامة البيانات المالية.
            </p>
            <div className="flex justify-end gap-3 mt-auto">
              <Button variant="outline" onClick={() => setTreasuryToDelete(null)}>
                إلغاء (Cancel)
              </Button>
              <Button variant="destructive" onClick={() => confirmDeleteTreasury(treasuryToDelete.id)}>
                تأكيد الحذف (Confirm)
              </Button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "      {/* TREASURY DETAILS & EXCEL EXPORT MODAL DIALOG */}",
  modalHTML + "\n      {/* TREASURY DETAILS & EXCEL EXPORT MODAL DIALOG */}",
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
