const fs = require("fs");
const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

const regex = /\{\/\* Self-Ordering QR Code Generator \*\/\}[\s\S]*?\n\s*\}\n/m;
const match = content.match(regex);
if (match) {
  console.log("Found modal block");
} else {
  console.log("Could not find modal block");
}
