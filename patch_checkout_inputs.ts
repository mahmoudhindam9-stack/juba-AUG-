import fs from "fs";
let content = fs.readFileSync("src/routes/index.tsx", "utf8");

// We need to add state for authNumber and mobileNumber
content = content.replace(
  '  const [selectedTreasury, setSelectedTreasury] = useState<string>("tr-1");',
  '  const [selectedTreasury, setSelectedTreasury] = useState<string>("tr-1");\n  const [authNumber, setAuthNumber] = useState("");\n  const [mobileNumber, setMobileNumber] = useState("");',
);

// We need to append authNumber and mobileNumber to the combinedNotes or order payload.
// The payload has `notes`. Let's just append it to `combinedNotes`.
const notesReplacement = `
      let finalNotes = combinedNotes || "";
      if (payment === "card" && authNumber) finalNotes += (finalNotes ? " | " : "") + "AUTH#: " + authNumber;
      if (payment === "wallet" && mobileNumber) finalNotes += (finalNotes ? " | " : "") + "رقم الموبايل: " + mobileNumber;

      const payload = {
        subtotal: Number(subTotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        payment_method: payment,
        order_type: orderType,
        table_id: orderType === "dine_in" ? selectedTable || null : null,
        status: "pending",
        notes: finalNotes || null,
`;

content = content.replace(
  `      const payload = {
        subtotal: Number(subTotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        payment_method: payment,
        order_type: orderType,
        table_id: orderType === "dine_in" ? selectedTable || null : null,
        status: "pending",
        notes: combinedNotes || null,`,
  notesReplacement,
);

// We need to replace the Treasury & Container section with Currency selector + Auth/Mobile inputs
const newSection = `
            {/* Currency & Extra Details */}
            <div className="mb-4 space-y-3">
              <div>
                <Label className="text-sm font-bold block mb-1.5">{lang === "ar" ? "عملة الدفع" : "Payment Currency"}</Label>
                <select
                  value={currency}
                  onChange={(e) => changeCurrency(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-bold focus:outline-none"
                >
                  <option value="EGP">{lang === "ar" ? "جنيه مصري (EGP)" : "EGP"}</option>
                  <option value="USD">{lang === "ar" ? "دولار أمريكي (USD)" : "USD"}</option>
                  <option value="SSP">{lang === "ar" ? "جنيه ج.س (SSP)" : "SSP"}</option>
                </select>
              </div>

              {payment === "card" && (
                <div>
                  <Label className="text-sm font-bold block mb-1.5">AUTH#</Label>
                  <input
                    type="text"
                    value={authNumber}
                    onChange={(e) => setAuthNumber(e.target.value)}
                    placeholder="Enter AUTH Number"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              {payment === "wallet" && (
                <div>
                  <Label className="text-sm font-bold block mb-1.5">رقم الموبايل</Label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter Mobile Number"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
`;

// Find the Treasury & Container block and replace it
content = content.replace(
  /\{\/\* Treasury & Container Selection \*\/\}.*?(?=\{\/\* Table Selection \*\/)/s,
  newSection,
);

fs.writeFileSync("src/routes/index.tsx", content);
