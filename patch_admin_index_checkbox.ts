import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

const checkboxUI = `
                      <div className="sm:col-span-5 flex items-center justify-end gap-2 mt-2 bg-muted/40 p-3 rounded-md border border-border">
                        <label htmlFor="linked_to_restaurant" className="text-xs font-bold cursor-pointer">
                          ربط الخزينة بمبيعات ومرتجعات المطعم
                        </label>
                        <input
                          type="checkbox"
                          id="linked_to_restaurant"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={newTreasuryForm.linked_to_restaurant}
                          onChange={(e) => setNewTreasuryForm(s => ({ ...s, linked_to_restaurant: e.target.checked }))}
                        />
                      </div>
`;

content = content.replace(
  '                        ))}                      </div>\n                      <div className="flex gap-2 sm:col-span-5">',
  "                        ))}                      </div>" +
    checkboxUI +
    '                      <div className="flex gap-2 sm:col-span-5">',
);
// In case the whitespace is weird
content = content.replace(
  '                        ))}\n                      </div>\n                      <div className="flex gap-2 sm:col-span-5">',
  "                        ))}\n                      </div>\n" +
    checkboxUI +
    '                      <div className="flex gap-2 sm:col-span-5">',
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
