const fs = require("fs");
const path = "src/routes/__root.tsx";
let content = fs.readFileSync(path, "utf8");

if (!content.includes('import { Toaster } from "@/components/ui/sonner"')) {
  content = content.replace(
    'import { useEffect, type ReactNode } from "react";',
    'import { useEffect, type ReactNode } from "react";\nimport { Toaster } from "@/components/ui/sonner";',
  );
}

if (!content.includes("<Toaster />")) {
  content = content.replace("<Outlet />", "<Outlet />\n          <Toaster />");
}

fs.writeFileSync(path, content, "utf8");
