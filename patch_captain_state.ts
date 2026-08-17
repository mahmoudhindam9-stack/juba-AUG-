import fs from "fs";

const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  "  const [manageTableOpen, setManageTableOpen] = useState(false);",
  `  const [manageTableOpen, setManageTableOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTableNumber, setQrTableNumber] = useState("");
  const [qrWelcomeMessage, setQrWelcomeMessage] = useState("أهلاً بك! يمكنك الطلب الآن.");`,
);

fs.writeFileSync(path, content, "utf8");
