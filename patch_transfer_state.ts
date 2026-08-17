import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);`,
  `const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState<boolean>(false);
  const [transferTargetTreasury, setTransferTargetTreasury] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferCurrency, setTransferCurrency] = useState<string>("EGP");
  const [transferPaymentMethod, setTransferPaymentMethod] = useState<string>("cash");`,
);

fs.writeFileSync(path, content, "utf8");
