import fs from "fs";

// Patch src/routes/__root.tsx
let rootContent = fs.readFileSync("src/routes/__root.tsx", "utf8");
rootContent = rootContent.replace(/Juba Restaurant/g, "Restocash");
rootContent = rootContent.replace(/Juba/g, "Restocash");
fs.writeFileSync("src/routes/__root.tsx", rootContent);

// Patch src/routes/admin.tsx
let adminContent = fs.readFileSync("src/routes/admin.tsx", "utf8");
adminContent = adminContent.replace(/Juba Restaurant/g, "Restocash");
adminContent = adminContent.replace(/admin@juba.com/g, "admin@restocash.com");
fs.writeFileSync("src/routes/admin.tsx", adminContent);

// Patch src/routes/index.tsx
let indexContent = fs.readFileSync("src/routes/index.tsx", "utf8");
indexContent = indexContent.replace(/Juba Restaurant/g, "Restocash");
indexContent = indexContent.replace(/نظام مطعم Juba/g, "نظام Restocash");
indexContent = indexContent.replace(/مطعم Juba/g, "Restocash");
indexContent = indexContent.replace(/juba-orders-/g, "restocash-orders-");
fs.writeFileSync("src/routes/index.tsx", indexContent);

// Patch src/routes/login.tsx
let loginContent = fs.readFileSync("src/routes/login.tsx", "utf8");
loginContent = loginContent.replace(/Juba Restaurant/g, "Restocash");
fs.writeFileSync("src/routes/login.tsx", loginContent);
