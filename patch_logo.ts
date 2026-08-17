import fs from "fs";

// Patch login.tsx
let loginContent = fs.readFileSync("src/routes/login.tsx", "utf8");
if (!loginContent.includes("RestocashLogo")) {
  loginContent = loginContent.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { RestocashLogo } from "@/components/RestocashLogo";',
  );
  loginContent = loginContent.replace(
    '<h1 className="text-2xl font-black text-center">Restocash</h1>',
    '<div className="flex justify-center mb-2"><RestocashLogo size={32} /></div>',
  );
  fs.writeFileSync("src/routes/login.tsx", loginContent);
}

// Patch admin.tsx
let adminContent = fs.readFileSync("src/routes/admin.tsx", "utf8");
if (!adminContent.includes("RestocashLogo")) {
  adminContent = adminContent.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { RestocashLogo } from "@/components/RestocashLogo";',
  );
  adminContent = adminContent.replace(
    '<h1 className="text-lg font-black">Restocash</h1>\n          <p className="text-xs text-muted-foreground">نظام إدارة المطعم</p>',
    '<RestocashLogo size={20} />\n          <p className="text-[10px] text-muted-foreground mt-1">نظام الإدارة المتكامل</p>',
  );
  fs.writeFileSync("src/routes/admin.tsx", adminContent);
}

// Patch index.tsx
let indexContent = fs.readFileSync("src/routes/index.tsx", "utf8");
if (!indexContent.includes("RestocashLogo")) {
  indexContent = indexContent.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { RestocashLogo } from "@/components/RestocashLogo";',
  );
  indexContent = indexContent.replace(
    '<h3 className="text-2xl font-black">مرحباً بك في نظام Restocash 🍽️</h3>',
    '<div className="flex justify-center mb-4"><RestocashLogo size={40} /></div>\n                <h3 className="text-2xl font-black">مرحباً بك في نظام نقاط البيع</h3>',
  );
  fs.writeFileSync("src/routes/index.tsx", indexContent);
}
