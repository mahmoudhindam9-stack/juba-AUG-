import fs from "fs";

let adminContent = fs.readFileSync("src/routes/admin.tsx", "utf8");
adminContent = adminContent.replace(/const \[loading, setLoading\] = useState\(false\);\n/, "");
fs.writeFileSync("src/routes/admin.tsx", adminContent);
