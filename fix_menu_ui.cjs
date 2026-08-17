const fs = require('fs');
let code = fs.readFileSync('src/routes/menu.tsx', 'utf-8');

// replace the cart map
const cartMapStart = `              {cart.map((c) => (`
const cartMapReplacement = `              {cart.map((c, i) => (
                <div
                  key={i}
                  className="pt-3 first:pt-0 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{c.item.name_ar}</h4>
                      <span className="text-xs text-emerald-600 font-black">
                        {((c.item.price + (c.selectedAdditions?.reduce((s, a) => s + (a.price||0), 0) || 0)) * c.quantity).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ج.م
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(i, -1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{c.quantity}</span>
                      <button
                        onClick={() => updateQuantity(i, 1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(i)}
                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {(c.selectedAdditions && c.selectedAdditions.length > 0) || c.notes ? (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed">
                      {c.selectedAdditions && c.selectedAdditions.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 mr-1">إضافات:</span>
                          {c.selectedAdditions.map(a => \`\${a.icon||""} \${a.name_ar}\`).join("، ")}
                        </div>
                      )}
                      {c.notes && (
                        <div>
                          <span className="font-bold text-slate-700 mr-1">ملاحظات:</span>
                          {c.notes}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
`;

let parts = code.split('              {cart.map((c) => (\n');
if (parts.length === 2) {
    let endIdx = parts[1].indexOf('              </div>\n            </div>\n          );\n        })}\n      </main>');
    if (endIdx === -1) {
       endIdx = parts[1].indexOf('              </div>\n            </div>\n\n            <div className="pt-4 border-t space-y-3">');
    }
    
    if (endIdx !== -1) {
        code = parts[0] + cartMapReplacement + parts[1].substring(endIdx);
    }
}

// add Customization Modal
const modalStr = `      {/* Floating Cart Button */}`;
const customizationModal = `
      {customizingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="font-black text-lg text-slate-900">{customizingItem.name_ar}</h2>
              <button
                onClick={() => setCustomizingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                إلغاء
              </button>
            </div>
            
            {customizingItem.additions && customizingItem.additions.length > 0 && (
              <div className="space-y-2">
                <label className="font-bold text-sm text-slate-700">إضافات اختيارية:</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizingItem.additions.map((add, idx) => {
                    const isSelected = selectedAdditions.some(a => a.name_ar === add.name_ar);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAdditions(prev => prev.filter(a => a.name_ar !== add.name_ar));
                          } else {
                            setSelectedAdditions(prev => [...prev, add]);
                          }
                        }}
                        className={\`flex items-center justify-between p-3 rounded-xl border text-sm transition \${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}\`}
                      >
                        <div className="flex items-center gap-1.5">
                          {add.icon && <span>{add.icon}</span>}
                          <span>{add.name_ar}</span>
                        </div>
                        {add.price ? <span className="text-xs font-black text-emerald-600">+{add.price}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-bold text-sm text-slate-700">ملاحظات إضافية:</label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="مثال: بدون شطة، بصل زيادة..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              />
            </div>

            <button
              onClick={confirmAddToCart}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              أضف للطلب
            </button>
          </div>
        </div>
      )}
`;
code = code.replace(modalStr, customizationModal + '\n' + modalStr);

fs.writeFileSync('src/routes/menu.tsx', code);
console.log("Updated menu.tsx UI");
