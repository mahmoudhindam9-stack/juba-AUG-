import fs from "fs";

const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

if (!content.includes("QRCodeSVG")) {
  content = content.replace(
    'import { OrderTimer } from "@/components/OrderTimer";',
    'import { OrderTimer } from "@/components/OrderTimer";\nimport { QRCodeSVG } from "qrcode.react";\nimport { QrCode, Printer } from "lucide-react";',
  );
}

fs.writeFileSync(path, content, "utf8");
