const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/menu.tsx', 'utf-8');

// add additions to initial state
code = code.replace(/badge: "",\n  }\);/g, 'badge: "",\n    additions: [],\n  });');

// add additions to payload
code = code.replace(/badge: itemForm\.badge \|\| null,/g, 'badge: itemForm.badge || null,\n        additions: itemForm.additions || [],');

// add reset for additions
code = code.replace(/badge: "",\n    }\);/g, 'badge: "",\n      additions: [],\n    });');

// find where to inject the additions UI
// Let's put it after the badge input or requires_oven
const targetStr = `                  <div className="flex items-center space-x-2 space-x-reverse pt-2">
                    <Switch
                      id="requires_oven"`;
                      
const additionsUI = `
                  <div className="space-y-1.5 pt-2 border-t mt-4">
                    <Label className={lang === "ar" ? "text-right" : "text-left"}>
                      {lang === "ar" ? "إضافات اختيارية للعميل (Additions)" : "Optional Additions"}
                    </Label>
                    <div className="space-y-2">
                      {(itemForm.additions || []).map((add, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border">
                          <Input
                            placeholder={lang === "ar" ? "اسم الإضافة" : "Name"}
                            value={add.name_ar}
                            onChange={(e) => {
                              const newAdds = [...(itemForm.additions || [])];
                              newAdds[idx].name_ar = e.target.value;
                              setItemForm(s => ({...s, additions: newAdds}));
                            }}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Icon (e.g. 🌶️)"
                            value={add.icon || ""}
                            onChange={(e) => {
                              const newAdds = [...(itemForm.additions || [])];
                              newAdds[idx].icon = e.target.value;
                              setItemForm(s => ({...s, additions: newAdds}));
                            }}
                            className="h-8 text-xs w-20"
                          />
                          <Input
                            type="number"
                            placeholder={lang === "ar" ? "سعر إضافي" : "Extra Price"}
                            value={add.price || 0}
                            onChange={(e) => {
                              const newAdds = [...(itemForm.additions || [])];
                              newAdds[idx].price = Number(e.target.value);
                              setItemForm(s => ({...s, additions: newAdds}));
                            }}
                            className="h-8 text-xs w-24"
                          />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              const newAdds = [...(itemForm.additions || [])];
                              newAdds.splice(idx, 1);
                              setItemForm(s => ({...s, additions: newAdds}));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs border-dashed"
                        onClick={() => {
                          setItemForm(s => ({
                            ...s,
                            additions: [...(s.additions || []), { name_ar: "", icon: "", price: 0 }]
                          }));
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1 ml-1" />
                        {lang === "ar" ? "إضافة خيار جديد" : "Add new option"}
                      </Button>
                    </div>
                  </div>
`;

code = code.replace(targetStr, additionsUI + '\n' + targetStr);

fs.writeFileSync('src/routes/admin/menu.tsx', code);
console.log("Updated admin/menu.tsx");
