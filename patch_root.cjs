const fs = require("fs");
const path = "src/routes/__root.tsx";
let content = fs.readFileSync(path, "utf8");

if (!content.includes('import { Toaster } from "@/components/ui/sonner"')) {
  content = content.replace(
    'import { Outlet } from "@tanstack/react-router";',
    'import { Outlet } from "@tanstack/react-router";\nimport { Toaster } from "@/components/ui/sonner";',
  );
}

if (!content.includes("<Toaster />")) {
  content = content.replace("</TooltipProvider>", "</TooltipProvider>\n      <Toaster />");
}

fs.writeFileSync(path, content, "utf8");
