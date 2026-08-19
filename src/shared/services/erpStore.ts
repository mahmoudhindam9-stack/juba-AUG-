addJournalEntry(description, lines, reference, currency = "USD", date, customId) {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const check = this.checkCanModifyJournalEntry(targetDate);
  if (!check.allowed && !customId?.startsWith("ORACLE")) {
    throw new Error(check.reason || "You cannot edit restrictions in a closed year.");
  }

  // ✅ FIX 1: Auto-balance validation with helpful messages
  const totalDebit = lines.reduce(
    (sum, l) => sum + this.getLineBaseValue(l.debit, l.rate || 1),
    0
  );
  const totalCredit = lines.reduce(
    (sum, l) => sum + this.getLineBaseValue(l.credit, l.rate || 1),
    0
  );

  const difference = totalDebit - totalCredit;
  const absDiff = Math.abs(difference);

  // Allow Oracle imports to bypass strict validation
  if (customId?.startsWith("ORACLE")) {
    console.warn(`Oracle import: ${description} | Diff: ${difference.toFixed(2)}`);
  } else if (absDiff > 0.5) {
    // ✅ FIX 2: Throw clear error with details instead of silent return
    const errorMsg = 
      `❌ القيد غير متزن!\n\n` +
      `📋 الوصف: ${description}\n` +
      `💰 إجمالي المدين: ${totalDebit.toFixed(2)}\n` +
      `💰 إجمالي الدائن: ${totalCredit.toFixed(2)}\n` +
      `⚖️ الفرق: ${difference.toFixed(2)}\n\n` +
      `📌 راجع السطور:\n` +
      lines.map((l, i) => 
        `  ${i + 1}. ${l.account_code} | مدين: ${l.debit || 0} | دائن: ${l.credit || 0}`
      ).join('\n');
    
    console.error(errorMsg);
    throw new Error(
      `لا يمكن حفظ قيد غير متزن!\n` +
      `الفرق: ${difference.toFixed(2)} (مدين: ${totalDebit.toFixed(2)} | دائن: ${totalCredit.toFixed(2)})`
    );
  } else if (absDiff > 0.01) {
    // Small rounding difference - warn but allow
    console.warn(
      `⚠️ Small rounding diff in entry: ${description} | ${difference.toFixed(4)}`
    );
  }

  const entry = {
    id:
      customId && customId.trim()
        ? customId.trim()
        : "je-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    branch_id: this.state.currentBranchId,
    date: targetDate,
    description,
    lines,
    created_at: new Date().toISOString(),
    reference: this.generateJournalReference(targetDate, reference),
    currency: currency || lines[0]?.currency || "EGP",
    created_by: this.state.currentUser,
    is_approved: true,
  };
  this.state.journalEntries.unshift(entry);
  this.recalculateAccountBalances();
  this.saveState();
  this.notify();
}
