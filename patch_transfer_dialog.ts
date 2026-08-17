import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `{/* Export Report & Date Filter Dialog */}`,
  `{/* Transfer / End Shift Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent
          className="max-w-lg w-full bg-white text-slate-900 border-slate-200 rounded-2xl p-6"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <DialogHeader className={lang === "ar" ? "text-right" : "text-left"}>
            <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ArrowLeftRight className="text-purple-600" />
              {lang === "ar" ? "تحويل نقدية / إنهاء الشيفت" : "Transfer Money / End Shift"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-semibold text-sm">
              {lang === "ar" 
                ? "قم بتحديد الخزينة المستهدفة والمبلغ لتحويل العهدة وإقفال الشيفت."
                : "Select target treasury and amount to transfer funds and end shift."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-bold block mb-1 text-slate-700">
                {lang === "ar" ? "الخزينة المستهدفة (محول إليها)" : "Target Treasury"}
              </label>
              <select
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={transferTargetTreasury}
                onChange={(e) => setTransferTargetTreasury(e.target.value)}
              >
                <option value="">{lang === "ar" ? "-- اختر الخزينة --" : "-- Select Treasury --"}</option>
                {erpState.treasuries
                  .filter((t) => !t.deleted && t.id !== cashierTreasuryId)
                  .map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name_ar} (الرصيد: {tr.balance.toLocaleString()} {tr.currency})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-700">
                  {lang === "ar" ? "المبلغ" : "Amount"}
                </label>
                <Input 
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full h-10 rounded-xl font-bold"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-700">
                  {lang === "ar" ? "العملة" : "Currency"}
                </label>
                <select 
                  value={transferCurrency}
                  onChange={(e) => setTransferCurrency(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="SSP">جنيه ج.س (SSP)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1 text-slate-700">
                {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
              </label>
              <select 
                value={transferPaymentMethod}
                onChange={(e) => setTransferPaymentMethod(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="cash">كاش (نقدي)</option>
                <option value="card">بطاقة بنكية (فيزا)</option>
                <option value="wallet">محفظة إلكترونية</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
              className="rounded-xl font-bold border-slate-300 text-slate-700 px-5"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white px-5 shadow-xs"
              onClick={handleTransferMoney}
            >
              {lang === "ar" ? "تأكيد التحويل" : "Confirm Transfer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Report & Date Filter Dialog */}`,
);

fs.writeFileSync(path, content, "utf8");
