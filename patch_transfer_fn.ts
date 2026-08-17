import fs from "fs";

const path = "src/routes/cashier-treasury.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `  // Auto-sync whenever orders data finishes loading`,
  `  const handleTransferMoney = () => {
    if (!transferTargetTreasury || transferAmount <= 0) {
      toast({
        title: lang === "ar" ? "خطأ" : "Error",
        description: lang === "ar" ? "يرجى تحديد الخزينة المستهدفة وإدخال مبلغ صحيح" : "Select target treasury and enter valid amount",
        variant: "destructive"
      });
      return;
    }
    
    const targetName = erpState.treasuries.find((t) => t.id === transferTargetTreasury)?.name_ar || "";

    erpStore.addTreasuryTransaction(
      cashierTreasuryId,
      "transfer_out",
      transferAmount,
      transferCurrency,
      \`تحويل نقدية إلى \${targetName}\`,
      undefined,
      transferPaymentMethod,
      undefined
    );

    erpStore.addTreasuryTransaction(
      transferTargetTreasury,
      "transfer_in",
      transferAmount,
      transferCurrency,
      \`استلام نقدية من \${cashierTreasury.name_ar}\`,
      undefined,
      transferPaymentMethod,
      undefined
    );
    
    erpStore.addJournalEntry(
      \`إقفال شيفت / تحويل نقدية من \${cashierTreasury.name_ar} إلى \${targetName}\`,
      [
        { account_code: "101000", debit: transferAmount, credit: 0 },
        { account_code: "101000", debit: 0, credit: transferAmount }
      ],
      "SHIFT-" + Date.now().toString().slice(-6)
    );

    toast({
      title: lang === "ar" ? "تم التحويل بنجاح" : "Transferred Successfully",
      description: lang === "ar" ? \`تم تحويل مبلغ \${transferAmount} \${transferCurrency}\` : \`Transferred \${transferAmount} \${transferCurrency}\`,
      variant: "default"
    });
    setTransferDialogOpen(false);
    setTransferAmount(0);
  };

  // Auto-sync whenever orders data finishes loading`,
);

fs.writeFileSync(path, content, "utf8");
