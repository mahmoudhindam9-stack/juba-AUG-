const fs = require('fs');
let code = fs.readFileSync('src/routes/menu.tsx', 'utf-8');

const target = `            <div className="space-y-2">
              <label className="font-bold text-sm text-slate-700">ملاحظات إضافية:</label>`;

// Wait, the upsell should be inside the Cart Modal, not the Customization Modal.
// The Cart Modal has this at the bottom:
const cartBottomTarget = `            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between font-black text-slate-800 text-lg">
                <span>المجموع الإجمالي</span>`;

const upsellCode = `            {/* Upsell Section */}
            {availableItems.filter(i => i.badge && !cart.some(c => c.item.id === i.id)).length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <h3 className="font-black text-sm text-indigo-700 flex items-center gap-1.5">
                  ✨ {lang === "ar" ? "نقترح لك أيضاً إضافة:" : "We also suggest:"}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {availableItems
                    .filter(i => i.badge && !cart.some(c => c.item.id === i.id))
                    .slice(0, 3)
                    .map(item => (
                      <div key={item.id} className="min-w-[140px] bg-slate-50 border border-slate-200 rounded-2xl p-2 snap-start flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-indigo-600 mb-1">{item.badge}</div>
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name_ar}</h4>
                          <span className="text-xs font-black text-slate-600 block mt-1">{item.price} ج.م</span>
                        </div>
                        <button
                          onClick={() => handleItemClick(item)}
                          className="w-full mt-2 bg-white border border-slate-300 text-slate-700 rounded-lg py-1.5 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1"
                        >
                          <Plus size={12} />
                          {lang === "ar" ? "إضافة" : "Add"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
`;

code = code.replace(cartBottomTarget, upsellCode + cartBottomTarget);

fs.writeFileSync('src/routes/menu.tsx', code);
console.log("Updated menu.tsx with upsell");
