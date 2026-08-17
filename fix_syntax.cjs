const fs = require("fs");
const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

const modalRegex =
  /\{\/\* Self-Ordering QR Code Generator \*\/\}[\s\S]*?(?=\{\/\* \/Self-Ordering QR Code Generator \*\/\}|$)/;
// Actually I will just fix the whole file with a script that generates it properly.
