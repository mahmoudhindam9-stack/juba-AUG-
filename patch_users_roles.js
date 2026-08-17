import fs from "fs";
let content = fs.readFileSync("src/routes/admin/users.tsx", "utf8");

const regexSelect = /<select[\s\S]*?value=\{selectedUserEmail\}[\s\S]*?<\/select>/;

const newSelect = `<select
              className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold text-right shrink-0"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setEditedPermissions(null);
              }}
            >
              {Object.entries(roleLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v} ({k})
                </option>
              ))}
            </select>`;

content = content.replace(regexSelect, newSelect);
content = content.replace(/selectedUserEmail/g, "selectedRole");

fs.writeFileSync("src/routes/admin/users.tsx", content);
