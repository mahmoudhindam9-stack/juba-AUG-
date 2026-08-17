import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `              {/* Refund Form Inputs */}`,
  `              {/* Refund Form Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1 text-slate-700">المبلغ</label>
                  <Input 
                    type="number"
                    value={customRefundAmount}
                    onChange={(e) => setCustomRefundAmount(Number(e.target.value))}
                    className="w-full h-10 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-slate-700">العملة</label>
                  <select 
                    value={customRefundCurrency}
                    onChange={(e) => setCustomRefundCurrency(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SSP">جنيه ج.س (SSP)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-700">طريقة الدفع</label>
                <select 
                  value={customRefundPaymentMethod}
                  onChange={(e) => setCustomRefundPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">كاش (نقدي)</option>
                  <option value="card">بطاقة بنكية (فيزا)</option>
                  <option value="wallet">محفظة إلكترونية</option>
                </select>
              </div>`,
);

fs.writeFileSync(path, content, "utf8");
