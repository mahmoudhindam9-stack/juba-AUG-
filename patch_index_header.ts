import fs from "fs";

let content = fs.readFileSync("src/routes/index.tsx", "utf8");

content = content.replace(
  '          <div className="flex items-center gap-3 text-primary-foreground">\n            <div className="w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center">\n              <UtensilsCrossed size={22} />\n            </div>\n            <div>\n              <h1 className="text-xl font-black tracking-tight leading-none">{t.title}</h1>',
  '          <div className="flex items-center gap-3 text-primary-foreground">\n            <RestocashLogo size={32} variant="white" />\n            <div className="mr-2">\n              <h1 className="text-xl font-black tracking-tight leading-none">{t.title}</h1>',
);

fs.writeFileSync("src/routes/index.tsx", content);
