const fs = require("fs");
const path = "src/routes/captain.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `  const [qrTableNumber, setQrTableNumber] = useState("");`,
  `  const [qrTableId, setQrTableId] = useState("");`,
);

content = content.replace(
  `                onClick={() => {
                  setQrTableNumber(t.number.toString());
                  setIsQrModalOpen(true);
                }}`,
  `                onClick={() => {
                  setQrTableId(t.id);
                  setIsQrModalOpen(true);
                }}`,
);

const oldModal = `      {/* Self-Ordering QR Code Generator */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"} className="sm:max-w-md bg-white">
          <DialogHeader className={lang === "ar" ? "text-right" : "text-left"}>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="text-indigo-600" />
              {lang === "ar" ? "باركود الطلب الذاتي" : "Self-Ordering QR Code"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 print:hidden">
            <div className="space-y-2">
              <Label className={lang === "ar" ? "text-right block" : "text-left block"}>
                {lang === "ar" ? "رقم الطاولة (اختياري)" : "Table Number (Optional)"}
              </Label>
              <Input
                value={qrTableNumber}
                onChange={(e) => setQrTableNumber(e.target.value)}
                placeholder={lang === "ar" ? "مثال: 5" : "e.g. 5"}
                className={lang === "ar" ? "text-right" : "text-left"}
              />
            </div>
            <div className="space-y-2">
              <Label className={lang === "ar" ? "text-right block" : "text-left block"}>
                {lang === "ar" ? "رسالة الترحيب" : "Welcome Message"}
              </Label>
              <Input
                value={qrWelcomeMessage}
                onChange={(e) => setQrWelcomeMessage(e.target.value)}
                className={lang === "ar" ? "text-right" : "text-left"}
              />
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100"
            id="print-qr-area"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1">
              {qrWelcomeMessage || (lang === "ar" ? "أهلاً بك!" : "Welcome!")}
            </h3>
            {qrTableNumber && (
              <p className="text-sm font-bold text-slate-500 mb-4">
                {lang === "ar" ? \`طاولة رقم \${qrTableNumber}\` : \`Table #\${qrTableNumber}\`}
              </p>
            )}
            {!qrTableNumber && <div className="mb-4" />}

            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
              <QRCodeSVG
                value={\`\${window.location.origin}/menu\${qrTableNumber ? \`?table=\${qrTableNumber}\` : ""}\`}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              {lang === "ar" ? "قم بمسح الباركود للطلب المباشر" : "Scan QR code to order directly"}
            </p>
          </div>

          <DialogFooter className="sm:justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setIsQrModalOpen(false)}
              className="print:hidden"
            >
              {lang === "ar" ? "إغلاق" : "Close"}
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 print:hidden"
              onClick={() => {
                const printContent = document.getElementById("print-qr-area");
                if (printContent) {
                  const originalContents = document.body.innerHTML;
                  document.body.innerHTML = \`<div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:sans-serif;">\${printContent.innerHTML}</div>\`;
                  window.print();
                  document.body.innerHTML = originalContents;
                  window.location.reload();
                }
              }}
            >
              <Printer size={16} />
              {lang === "ar" ? "طباعة الباركود" : "Print QR Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>`;

const newModal = `      {/* Self-Ordering QR Code Generator */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"} className="sm:max-w-md bg-white p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
          <DialogHeader className={lang === "ar" ? "text-right" : "text-left"}>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <QrCode className="text-indigo-600" />
              {lang === "ar" ? "باركود الطلب الذاتي" : "Self-Ordering QR Code"}
            </DialogTitle>
          </DialogHeader>

          {(() => {
             const tablesList = tablesQuery.data || getLocalTables() || [];
             const selectedT = tablesList.find(t => t.id === qrTableId);
             const displayedTableNumber = selectedT ? selectedT.number : "";
             const qrUrl = \`\${window.location.origin}/menu\${qrTableId ? \`?table_id=\${qrTableId}&table=\${displayedTableNumber}\` : ""}\`;

             return (
               <>
                  <div className="space-y-3 py-1 print:hidden">
                    <div className="space-y-1.5">
                      <Label className={lang === "ar" ? "text-right block text-xs font-bold text-slate-700" : "text-left block text-xs font-bold text-slate-700"}>
                        {lang === "ar" ? "رقم الطاولة (اختياري)" : "Table Number (Optional)"}
                      </Label>
                      <select
                        value={qrTableId}
                        onChange={(e) => setQrTableId(e.target.value)}
                        className={\`w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 \${lang === "ar" ? "text-right" : "text-left"}\`}
                      >
                        <option value="">{lang === "ar" ? "-- بدون طاولة محددة (عام) --" : "-- No specific table (General) --"}</option>
                        {tablesList.map(t => (
                          <option key={t.id} value={t.id}>{t.name || \`طاولة \${t.number}\`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className={lang === "ar" ? "text-right block text-xs font-bold text-slate-700" : "text-left block text-xs font-bold text-slate-700"}>
                        {lang === "ar" ? "رسالة الترحيب" : "Welcome Message"}
                      </Label>
                      <Input
                        value={qrWelcomeMessage}
                        onChange={(e) => setQrWelcomeMessage(e.target.value)}
                        className={\`h-10 text-sm \${lang === "ar" ? "text-right" : "text-left"}\`}
                      />
                    </div>
                  </div>

                  <div
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 my-1"
                    id="print-qr-area"
                  >
                    <h3 className="text-base font-black text-slate-800 mb-1">
                      {qrWelcomeMessage || (lang === "ar" ? "أهلاً بك!" : "Welcome!")}
                    </h3>
                    {displayedTableNumber && (
                      <p className="text-sm font-bold text-slate-500 mb-3">
                        {lang === "ar" ? \`طاولة رقم \${displayedTableNumber}\` : \`Table #\${displayedTableNumber}\`}
                      </p>
                    )}
                    {!displayedTableNumber && <div className="mb-3" />}

                    <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200">
                      <QRCodeSVG
                        value={qrUrl}
                        size={160}
                        level={"H"}
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 mt-3 text-center">
                      {lang === "ar" ? "قم بمسح الباركود للطلب المباشر" : "Scan QR code to order directly"}
                    </p>
                  </div>

                  <DialogFooter className="sm:justify-between mt-2 pt-2 border-t border-slate-100 flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsQrModalOpen(false)}
                      className="print:hidden flex-1 sm:flex-none h-10 rounded-xl"
                    >
                      {lang === "ar" ? "إغلاق" : "Close"}
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 print:hidden flex-1 sm:flex-none h-10 rounded-xl"
                      onClick={() => {
                        const printContent = document.getElementById("print-qr-area");
                        if (printContent) {
                          const printWindow = window.open('', '', 'width=600,height=600');
                          if (printWindow) {
                            printWindow.document.write(\`
                              <html>
                                <head>
                                  <title>Print QR Code</title>
                                  <style>
                                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; }
                                    .qr-container { text-align: center; }
                                    h3 { margin-bottom: 4px; font-size: 20px; font-weight: 900; }
                                    p { margin-top: 0; color: #64748b; font-size: 16px; margin-bottom: 16px; font-weight: bold; }
                                    .footer { font-size: 12px; color: #94a3b8; margin-top: 16px; font-weight: bold; }
                                  </style>
                                </head>
                                <body>
                                  <div class="qr-container">
                                    \${printContent.innerHTML}
                                  </div>
                                </body>
                              </html>
                            \`);
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => {
                              printWindow.print();
                              printWindow.close();
                            }, 250);
                          }
                        }
                      }}
                    >
                      <Printer size={16} />
                      {lang === "ar" ? "طباعة الباركود" : "Print QR Code"}
                    </Button>
                  </DialogFooter>
               </>
             )
          })()}
        </DialogContent>
      </Dialog>`;

content = content.replace(oldModal, newModal);
fs.writeFileSync(path, content, "utf8");
