const fs = require('fs');
let code = fs.readFileSync('src/components/TableOrderModal.tsx', 'utf-8');

// Replace the cart item display
const targetDisplay = `                      <span className="text-[11px] font-bold text-indigo-600 block mt-0.5">
                        {formatPrice(line.item.price * line.quantity)}
                      </span>
                    </div>`;

const newDisplay = `                      <span className="text-[11px] font-bold text-indigo-600 block mt-0.5">
                        {formatPrice((line.item.price + (line.selectedAdditions?.reduce((s, a) => s + (a.price||0), 0) || 0)) * line.quantity)}
                      </span>
                      {((line.selectedAdditions && line.selectedAdditions.length > 0) || line.notes) && (
                        <div className="text-[10px] text-slate-500 mt-1 space-y-0.5 leading-tight">
                          {line.selectedAdditions && line.selectedAdditions.length > 0 && (
                            <div>
                              <span className="font-bold mr-1">إضافات:</span>
                              {line.selectedAdditions.map(a => \`\${a.icon||""} \${a.name_ar}\`).join("، ")}
                            </div>
                          )}
                          {line.notes && (
                            <div>
                              <span className="font-bold mr-1">ملاحظات:</span>
                              {line.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>`;

code = code.replace(targetDisplay, newDisplay);

// And also replace it in the read-only view (if any)
const targetDisplayReadOnly = `                    <span className="text-[11px] font-bold text-indigo-600 block mt-0.5">
                      {formatPrice(line.item.price * line.quantity)}
                    </span>
                  </div>`;
                  
code = code.replace(targetDisplayReadOnly, newDisplay);

fs.writeFileSync('src/components/TableOrderModal.tsx', code);
console.log("Updated TableOrderModal display");
