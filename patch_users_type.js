import fs from "fs";
let content = fs.readFileSync("src/routes/admin/users.tsx.new", "utf8");

// replace type Profile with import SystemUser
content = content.replace(/type Profile = \{[\s\S]*?\};\n/, "");
content = content.replace(
  /import \{ erpStore, UserPermission \} from "@\/shared\/services\/erpStore";/,
  'import { erpStore, UserPermission, SystemUser } from "@/shared/services/erpStore";',
);
content = content.replace(/useState<Profile \| null>/g, "useState<SystemUser | null>");
content = content.replace(/startEdit = \(p: Profile\)/g, "startEdit = (p: SystemUser)");
content = content.replace(/\(usersQuery\.data \?\? \[\]\)/g, "localUsers");
content = content.replace(/deleteUser\.isPending/g, "false");
content = content.replace(/upsert\.isPending/g, "false");
content = content.replace(/deleteUser\.mutate\(\)/g, "deleteUser.mutate()"); // This is fine
// The usersQuery might still have imports from react-query
// It's ok to leave unused imports, but we should ensure the component compiles.

fs.writeFileSync("src/routes/admin/users.tsx", content);
