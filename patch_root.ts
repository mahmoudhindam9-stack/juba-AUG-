import fs from "fs";
let content = fs.readFileSync("src/routes/__root.tsx", "utf8");

// Remove watermark
const watermarkRegex =
  /<div[^>]*>\s*<span>Developed by<\/span>\s*<span[^>]*>Mahmoud Hindam<\/span>\s*<\/div>/g;
content = content.replace(watermarkRegex, "");

// Save
fs.writeFileSync("src/routes/__root.tsx", content);
