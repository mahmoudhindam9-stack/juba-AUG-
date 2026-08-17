import fs from "fs";
let content = fs.readFileSync("src/routes/cashier-treasury.tsx", "utf8");

// State for the dialog
content = content.replace(
  "  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);",
  '  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);\n  const [refundOrderDialog, setRefundOrderDialog] = useState<Order | null>(null);\n  const [refundTreasury, setRefundTreasury] = useState<string>("tr-1");\n  const [refundContainer, setRefundContainer] = useState<string>("");',
);

// Refund mutation
content = content.replace(
  '    mutationFn: async (order: Order) => {\n      // 1. Post to ERP automated journal entries and update treasury balances (refund)\n      erpStore.postSalesReturnJournal(\n        order.order_number,\n        Number(order.total),\n        order.payment_method || "cash",\n        erpState.currentBranchId || "BR-001",\n        order.currency || "EGP",\n      );',
  '    mutationFn: async ({ order, treasuryId, containerId }: { order: Order, treasuryId: string, containerId: string }) => {\n      erpStore.postSalesReturnJournal(\n        order.order_number,\n        Number(order.total),\n        order.payment_method || "cash",\n        erpState.currentBranchId || "BR-001",\n        order.currency || "EGP",\n        treasuryId,\n        containerId\n      );',
);

content = content.replace("    onSuccess: (_, order) => {", "    onSuccess: (_, { order }) => {");

// Click handler
content = content.replace(
  `                              onClick={() => {
                                if (confirmRefundId === order.id) {
                                  refundMutation.mutate(order);
                                  setConfirmRefundId(null);
                                } else {
                                  setConfirmRefundId(order.id);
                                }
                              }}`,
  `                              onClick={() => {
                                setRefundOrderDialog(order);
                              }}`,
);

// Loading state
content = content.replace(
  "refundMutation.isPending && refundMutation.variables?.id === order.id;",
  "refundMutation.isPending && refundMutation.variables?.order.id === order.id;",
);

const refundModal = `
      {refundOrderDialog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">استرجاع طلب #{refundOrderDialog.order_number}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              قيمة المرتجع: {refundOrderDialog.total.toLocaleString()} {refundOrderDialog.currency || "EGP"}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold block mb-1">الخزينة (Cashbox)</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={refundTreasury}
                  onChange={e => {
                    setRefundTreasury(e.target.value);
                    setRefundContainer("");
                  }}
                >
                  {erpState.treasuries.filter(t => !t.deleted && t.is_open).map(tr => (
                    <option key={tr.id} value={tr.id}>{tr.name_ar}</option>
                  ))}
                </select>
              </div>
              {erpState.treasuries.find(t => t.id === refundTreasury)?.containers?.length ? (
                <div>
                  <label className="text-xs font-bold block mb-1 text-emerald-500">وعاء العملة (Container)</label>
                  <select
                    className="w-full h-10 rounded-md border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 text-sm"
                    value={refundContainer}
                    onChange={e => setRefundContainer(e.target.value)}
                  >
                    <option value="">-- اختر الوعاء --</option>
                    {erpState.treasuries.find(t => t.id === refundTreasury)?.containers?.map(cnt => (
                      <option key={cnt.id} value={cnt.id}>{cnt.name} ({cnt.currency})</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRefundOrderDialog(null)}>إلغاء</Button>
              <Button 
                variant="destructive" 
                disabled={refundMutation.isPending || (erpState.treasuries.find(t => t.id === refundTreasury)?.containers?.length > 0 && !refundContainer)}
                onClick={() => {
                  refundMutation.mutate({ order: refundOrderDialog, treasuryId: refundTreasury, containerId: refundContainer });
                  setRefundOrderDialog(null);
                }}
              >
                {refundMutation.isPending ? "جاري الاسترجاع..." : "تأكيد المرتجع"}
              </Button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("    </div>\n  );\n}", refundModal + "\n    </div>\n  );\n}");

fs.writeFileSync("src/routes/cashier-treasury.tsx", content);
