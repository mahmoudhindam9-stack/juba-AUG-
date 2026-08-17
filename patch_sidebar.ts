import fs from "fs";
let content = fs.readFileSync("src/routes/admin.tsx", "utf8");

// Add RefreshCw to lucide imports
if (!content.includes("RefreshCw")) {
  content = content.replace(
    'LogOut,\n} from "lucide-react";',
    'LogOut,\n  RefreshCw,\n} from "lucide-react";',
  );
}

// Add the new nav item before 'المستخدمين' or at the end of the admin section
const navItem = '\n  { to: "/admin/system-update", label: "تحديث السيستم", icon: RefreshCw },';
content = content.replace(
  '  { to: "/admin/users", label: "المستخدمين", icon: Users },',
  '  { to: "/admin/users", label: "المستخدمين", icon: Users },' + navItem,
);

fs.writeFileSync("src/routes/admin.tsx", content);
