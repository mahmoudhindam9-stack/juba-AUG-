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

  // If no account code is provided, auto-create a dedicated supplier account in Chart of Accounts under 24010
    if (!targetAccountCode) {
      const existingSupplierCodes = this.state.accounts
        .map((a) => a.code)
        .filter((c) => c.startsWith("24010") && c.length === 8);

      let maxSuffix = 390;
      existingSupplierCodes.forEach((code) => {
        const suffix = parseInt(code.substring(5), 10);
        if (!isNaN(suffix) && suffix > maxSuffix) {
          maxSuffix = suffix;
        }
      });

      const nextSuffix = maxSuffix + 1;
      targetAccountCode = `24010${String(nextSuffix).padStart(3, "0")}`;
      isNewAccount = true;

      if (!this.state.accounts.some((a) => a.code === targetAccountCode)) {
        const newAcc: Account = {
          code: targetAccountCode,
          name_ar: `مورد - ${name_ar}`,
          type: "liability",
          level: 4,
          parent_code: "24010",
          balance: openingBalance,
          initial_balance: openingBalance,
          status: "active",
          currency: currency || "USD",
          system_binding: "none",
        };
        this.state.accounts.push(newAcc);
      }
    } else {
      const existing = this.state.accounts.find((a) => a.code === targetAccountCode);
      if (!existing) {
        this.state.accounts.push({
          code: targetAccountCode,
          name_ar: `مورد - ${name_ar}`,
          type: "liability",
          level: 4,
          parent_code: "24010",
          balance: openingBalance,
          initial_balance: openingBalance,
          status: "active",
          currency: currency || "USD",
          system_binding: "none",
        });
        isNewAccount = true;
      }
    }

    const supplier: Supplier = {
      id: "sup-" + Date.now(),
      name_ar,
      phone: phone || "",
      balance: openingBalance,
      account_code: targetAccountCode,
      currency: currency || "USD",
      deleted: false,
    };

    this.state.suppliers.push(supplier);
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة مورد جديد",
      `تم تسجيل المورد: ${name_ar} وربطه بالحساب المحاسبي رقم (${targetAccountCode})`,
      "CREATE",
    );
    this.notify();
    return { supplier, account_code: targetAccountCode, isNewAccount };
  }
  deleteSupplier(id: string) {
    const sup = this.state.suppliers.find((s) => s.id === id);
    if (sup) {
      sup.deleted = true;
      this.saveState();
      this.logAction("ADMIN", "حذف مورد (حذف مؤقت)", `تم حذف المورد #${id} مؤقتاً`, "DELETE");
      this.notify();
    }
  }
  updateSupplier(id: string, payload: Partial<Supplier>) {
    const sup = this.state.suppliers.find((s) => s.id === id);
    if (sup) {
      Object.assign(sup, payload);
      // If account_code changed, sync
      if (payload.account_code) {
        const acc = this.state.accounts.find((a) => a.code === payload.account_code);
        if (acc && payload.name_ar) {
          acc.name_ar = `مورد - ${payload.name_ar}`;
        }
      }
      this.saveState();
      this.logAction("ADMIN", "تعديل بيانات مورد", `تم تعديل المورد: ${sup.name_ar}`, "UPDATE");
      this.notify();
    }
  }
  updateSupplierBalance(id: string, amount: number) {
    const sup = this.state.suppliers.find((s) => s.id === id);
    if (sup) {
      sup.balance += amount;
      this.saveState();
      this.notify();
    }
  }
  recordSupplierTransaction(params: {
    supplier_id: string;
    type: "payment" | "invoice" | "adjustment";
    amount: number;
    currency?: "USD" | "SSP" | string;
    exchange_rate?: number;
    treasury_id?: string;
    note?: string;
    date?: string;
  }) {
    const supplier = this.state.suppliers.find((s) => s.id === params.supplier_id);
    if (!supplier) throw new Error("المورد غير موجود");

    const supAccCode = supplier.account_code || "201000";
    const curr = params.currency || "USD";
    const rate = Number(params.exchange_rate) || 1;
    const rawAmount = Number(params.amount) || 0;
    const baseUsd = curr === "USD" ? rawAmount : rate > 1 ? rawAmount / rate : rawAmount * rate;
    const targetDate = params.date || new Date().toISOString().split("T")[0];

    const refSeq = Math.floor(Math.random() * 8999) + 1000;
    let ref = `SUP-TX-${refSeq}`;
    const lines: JournalLine[] = [];

    if (params.type === "payment") {
      // Payment to Supplier: Debit Supplier, Credit Treasury
      const treasury =
        this.state.treasuries.find((t) => t.id === params.treasury_id) || this.state.treasuries[0];
      const treasuryAccCode =
        treasury?.account_code || (treasury?.type === "bank" ? "13020140" : "13010100");
      ref = `SUP-PAY-${refSeq}`;

      lines.push({
        account_code: supAccCode,
        debit: rawAmount,
        credit: 0,
        currency: curr,
        rate: rate,
        description: params.note || `سداد دفعة نقدية للمورد ${supplier.name_ar}`,
      });

      lines.push({
        account_code: treasuryAccCode,
        debit: 0,
        credit: rawAmount,
        currency: curr,
        rate: rate,
        description: params.note || `سداد دفعة نقدية للمورد ${supplier.name_ar}`,
      });

      if (treasury) {
        this.addTreasuryTransaction(
          treasury.id,
          "purchase",
          rawAmount,
          curr,
          `سداد للمورد: ${supplier.name_ar} - ${params.note || ""}`,
          ref,
        );
      }

      supplier.balance -= rawAmount;
    } else if (params.type === "invoice") {
      // Additional Invoice/Claim: Debit Inventory/Expense, Credit Supplier
      ref = `SUP-INV-${refSeq}`;
      lines.push({
        account_code: "103000",
        debit: rawAmount,
        credit: 0,
        currency: curr,
        rate: rate,
        description: params.note || `فاتورة استحقاق بضاعة للمورد ${supplier.name_ar}`,
      });

      lines.push({
        account_code: supAccCode,
        debit: 0,
        credit: rawAmount,
        currency: curr,
        rate: rate,
        description: params.note || `فاتورة استحقاق بضاعة للمورد ${supplier.name_ar}`,
      });

      supplier.balance += rawAmount;
    } else {
      // Adjustment:
      ref = `SUP-ADJ-${refSeq}`;
      lines.push({
        account_code: supAccCode,
        debit: rawAmount > 0 ? rawAmount : 0,
        credit: rawAmount < 0 ? Math.abs(rawAmount) : 0,
        currency: curr,
        rate: rate,
        description: params.note || `تسوية رصيد حساب المورد ${supplier.name_ar}`,
      });

      lines.push({
        account_code: "17010100",
        debit: rawAmount < 0 ? Math.abs(rawAmount) : 0,
        credit: rawAmount > 0 ? rawAmount : 0,
        currency: curr,
        rate: rate,
        description: params.note || `تسوية رصيد حساب المورد ${supplier.name_ar}`,
      });

      supplier.balance -= rawAmount;
    }

    this.addJournalEntry(
      `حركة مورد (${supplier.name_ar}) - ${params.note || ref}`,
      lines,
      ref,
      curr,
      targetDate,
    );

    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "تسجيل حركة مورد",
      `تم تسجيل حركة ${params.type} بمبلغ ${rawAmount.toLocaleString()} ${curr} للمورد ${supplier.name_ar} (حساب #${supAccCode}) برقم مرجعي ${ref}`,
      "TRANSACTION",
    );
    this.notify();

    return {
      success: true,
      reference: ref,
      account_code: supAccCode,
      supplier_name: supplier.name_ar,
      amount: rawAmount,
      currency: curr,
      base_usd_amount: baseUsd,
    };
  }
  addTreasury(
    name_ar,
    type,
    currency,
    openingBalance = 0,
    employee = "غير محدد",
    containers = [],
    linked_to_restaurant = false,
    account_code,
  ) {
    const treasury = {
      id: "tr-" + Date.now(),
      branch_id: this.state.currentBranchId,
      name_ar,
      type,
      currency,
      balance: openingBalance,
      is_open: true,
      account_code: void 0,
      opening_balance: openingBalance,
      available_balance: openingBalance,
      responsible_employee: employee,
      status: "active",
      deleted: false,
      containers,
      linked_to_restaurant,
    };
    this.state.treasuries.push(treasury);
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة حساب خزينة/بنك",
      `تم إنشاء حساب ${name_ar} برصيد إفتتاحي ${openingBalance} ${currency}`,
      "CREATE",
    );
    return treasury;
  }
  updateTreasury(id, payload) {
    const tr = this.state.treasuries.find((t) => t.id === id);
    if (tr) {
      Object.assign(tr, payload);
      this.saveState();
      this.logAction("ADMIN", "تعديل حساب خزينة/بنك", `تم تعديل حساب: ${tr.name_ar}`, "UPDATE");
    }
  }
  setTreasuryOpenStatus(treasuryId, isOpen) {
    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (tr) {
      const oldState = tr.is_open;
      tr.is_open = isOpen;
      tr.status = isOpen ? "active" : "closed";
      this.saveState();
      this.logAction(
        "ADMIN",
        isOpen ? "فتح الخزينة اليومي" : "إغلاق الخزينة اليومي",
        `تم تغيير حالة خزينة ${tr.name_ar} إلى ${isOpen ? "مفتوحة" : "مغلقة"}`,
        "UPDATE",
        `isOpen: ${oldState}`,
        `isOpen: ${isOpen}`,
      );
    }
  }
  deleteTreasury(id) {
    const trIndex = this.state.treasuries.findIndex((t) => t.id === id);
    const tr = this.state.treasuries[trIndex];
    if (tr) {
      if (Math.abs(tr.balance) > 0.001)
        throw new Error(
          `لا يمكن حذف الخزينة وهي تحتوي على رصيد مالي نشط (${tr.balance.toLocaleString()} ${tr.currency}).`,
        );
      tr.deleted = true;
      tr.is_open = false;
      this.state.treasuries.splice(trIndex, 1);
      this.saveState();
      this.logAction("ADMIN", "حذف خزينة", `تم حذف الخزينة ${tr.name_ar}`, "DELETE");
    }
  }
  reconcileTreasury(treasuryId, actualCount, notes) {
    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (!tr) throw new Error("الخزينة غير موجودة");
    const ledgerBalance = tr.balance;
    const difference = actualCount - ledgerBalance;
    const recon = {
      id: "rec-" + Date.now(),
      treasury_id: treasuryId,
      date: /* @__PURE__ */ new Date().toISOString(),
      ledger_balance: ledgerBalance,
      actual_balance: actualCount,
      difference,
      reconciled_by: this.state.currentUser,
      notes,
    };
    if (!this.state.reconciliations) this.state.reconciliations = [];
    this.state.reconciliations.unshift(recon);
    tr.balance = actualCount;
    tr.available_balance = actualCount;
    "" + Date.now().toString().substring(8);
    this.postReconciliationJournal(recon, tr);
    this.saveState();
    this.logAction(
      "ADMIN",
      "تسوية ومطابقة خزينة",
      `تم تسوية خزينة ${tr.name_ar} بفارق ${difference.toFixed(2)} ج.م (جرد فعلي: ${actualCount})`,
      "TRANSACTION",
    );
  }
  postReconciliationJournal(recon, tr) {
    const treasuryAccountCode =
      tr.type === "bank" ? "102000" : tr.branch_id === "branch-2" ? "101001" : "101000";
    const diff = recon.difference;
    const lines = [];
    if (diff > 0) {
      lines.push({
        account_code: treasuryAccountCode,
        debit: diff,
        credit: 0,
      });
      lines.push({
        account_code: "401000",
        debit: 0,
        credit: diff,
      });
    } else if (diff < 0) {
      lines.push({
        account_code: "506000",
        debit: Math.abs(diff),
        credit: 0,
      });
      lines.push({
        account_code: treasuryAccountCode,
        debit: 0,
        credit: Math.abs(diff),
      });
    }
    if (lines.length > 0)
      this.addJournalEntry(
        `تسوية جرد مالي لخزينة ${tr.name_ar}`,
        lines,
        `REC-${recon.id.substring(4, 9).toUpperCase()}`,
      );
  }
  addTreasuryTransaction(
    treasuryId,
    type,
    amount,
    currency,
    note,
    relatedId,
    paymentMethod,
    containerId,
  ) {
    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (!tr) return;
    const beforeBal = tr.balance;
    if (type === "deposit" || type === "sales" || type === "transfer_in") {
      tr.balance += amount;
      tr.available_balance = tr.balance;
      if (containerId && tr.containers) {
        const cnt = tr.containers.find((c) => c.id === containerId);
        if (cnt) cnt.balance += amount;
      }
    } else {
      tr.balance -= amount;
      tr.available_balance = tr.balance;
      if (containerId && tr.containers) {
        const cnt = tr.containers.find((c) => c.id === containerId);
        if (cnt) cnt.balance -= amount;
      }
    }
    const tx = {
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      branch_id: this.state.currentBranchId,
      treasury_id: treasuryId,
      type,
      amount,
      currency,
      payment_method: paymentMethod || "cash",
      note,
      related_entity_id: relatedId,
      created_at: /* @__PURE__ */ new Date().toISOString(),
    };
    this.state.treasuryTransactions.unshift(tx);
    this.saveState();
    this.logAction(
      this.state.currentUser,
      "حركة مالية على الخزينة",
      `تم إجراء حركة ${type} بقيمة ${amount} ج.م على خزينة ${tr.name_ar}`,
      "TRANSACTION",
      `balance: ${beforeBal}`,
      `balance: ${tr.balance}`,
    );
    this.postTreasuryJournal(tx, tr);
  }
  postTreasuryJournal(tx, tr) {
    let debitAccount = "101000";
    let creditAccount = "301000";
    if (this.state.currentBranchId === "branch-2") debitAccount = "101001";
    else if (tr.type === "bank") debitAccount = "102000";
    if (tx.type === "sales") creditAccount = "401000";
    else if (tx.type === "expense") creditAccount = "504000";
    else if (tx.type === "purchase") creditAccount = "103000";
    const lines = [];
    if (tx.type === "deposit" || tx.type === "sales" || tx.type === "transfer_in") {
      lines.push({
        account_code: debitAccount,
        debit: tx.amount,
        credit: 0,
      });
      lines.push({
        account_code: creditAccount,
        debit: 0,
        credit: tx.amount,
      });
    } else if (
      tx.type === "withdrawal" ||
      tx.type === "purchase" ||
      tx.type === "expense" ||
      tx.type === "transfer_out"
    ) {
      lines.push({
        account_code: creditAccount,
        debit: tx.amount,
        credit: 0,
      });
      lines.push({
        account_code: debitAccount,
        debit: 0,
        credit: tx.amount,
      });
    }
    if (lines.length > 0)
      this.addJournalEntry(tx.note, lines, `TX-${tx.id.substring(3, 8).toUpperCase()}`);
  }
  addAccount(
    code,
    name_ar,
    type,
    parentCode,
    level = 2,
    initial_balance = 0,
    system_binding = "none",
    currency = "EGP",
  ) {
    if (this.state.accounts.some((a) => a.code === code))
      throw new Error("كود الحساب موجود بالفعل");
    const account = {
      code,
      name_ar,
      type,
      balance: initial_balance,
      parent_code: parentCode,
      level,
      status: "active",
      initial_balance,
      system_binding,
      currency,
      sync_status: system_binding && system_binding !== "none" ? "pending" : "synced",
    };
    this.state.accounts.push(account);
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "إضافة حساب محاسبي",
      `تم تسجيل الحساب الجديد في الدليل: ${name_ar} (${code})`,
      "CREATE",
    );
    return account;
  }
  updateAccountStatus(code, status) {
    const acc = this.state.accounts.find((a) => a.code === code);
    if (acc) {
      acc.status = status;
      this.saveState();
      this.logAction(
        "ADMIN",
        "تحديث حالة حساب",
        `تم تغيير حالة حساب ${acc.name_ar} إلى ${status}`,
        "UPDATE",
      );
    }
  }
  updateAccount(code, payload) {
    const acc = this.state.accounts.find((a) => a.code === code);
    if (!acc) throw new Error("الحساب غير موجود");
    if (payload.code && payload.code !== code) {
      if (this.state.accounts.some((a) => a.code === payload.code))
        throw new Error("كود الحساب الجديد مستخدم بالفعل لحساب آخر");
      this.state.accounts.forEach((a) => {
        if (a.parent_code === code) a.parent_code = payload.code;
      });
      this.state.journalEntries.forEach((je) => {
        je.lines?.forEach((l) => {
          if (l.account_code === code) l.account_code = payload.code;
        });
      });
    }
    const oldBinding = acc.system_binding;
    Object.assign(acc, payload);
    if (payload.system_binding !== void 0 && payload.system_binding !== oldBinding)
      acc.sync_status = payload.system_binding !== "none" ? "pending" : "synced";
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "تعديل حساب محاسبي",
      `تم تعديل بيانات الحساب المحاسبي: ${acc.name_ar} (${acc.code})`,
      "UPDATE",
    );
    return acc;
  }
  activateAccountSync(code) {
    const acc = this.state.accounts.find((a) => a.code === code);
    if (acc) {
      acc.sync_status = "synced";
      this.recalculateAccountBalances();
      this.saveState();
      this.logAction(
        "ADMIN",
        "تنشيط مزامنة رصيد الحساب",
        `تم تنشيط مزامنة الرصيد وتحديثه للحساب: ${acc.name_ar} (${acc.code})`,
        "UPDATE",
      );
    }
  }
  deleteAccount(code) {
    const index = this.state.accounts.findIndex((a) => a.code === code);
    if (index === -1) throw new Error("الحساب غير موجود");
    const acc = this.state.accounts[index];
    if (this.state.accounts.some((a) => a.parent_code === code))
      throw new Error(
        "لا يمكن حذف حساب رئيسي يمتلك حسابات فرعية. قم بحذف أو نقل الحسابات الفرعية أولاً.",
      );
    if (this.state.journalEntries.some((je) => je.lines?.some((l) => l.account_code === code))) {
      acc.status = "inactive";
      this.saveState();
      this.logAction(
        "ADMIN",
        "تعطيل حساب مرتبط بقيود",
        `الحساب ${acc.name_ar} (${acc.code}) مرتبط بقيود محاسبية، تم تحويل حالته إلى معطل بدلاً من الحذف الفيزيائي لحفظ الشجرة والنزاهة المالية.`,
        "UPDATE",
      );
      return {
        softDeleted: true,
        message: "الحساب مرتبط بقيود محاسبية، تم تعطيله بدلاً من الحذف لحفظ النزاهة المالية.",
      };
    }
    this.state.accounts.splice(index, 1);
    this.saveState();
    this.logAction(
      "ADMIN",
      "حذف حساب محاسبي",
      `تم حذف الحساب المحاسبي من الدليل: ${acc.name_ar} (${code})`,
      "DELETE",
    );
    return {
      softDeleted: false,
      message: "تم حذف الحساب بنجاح!",
    };
  }
  recalculateAccountBalances() {
    const balanceMap = {};
    this.state.accounts.forEach((acc) => {
      balanceMap[acc.code] = acc.initial_balance || 0;
    });
    this.state.journalEntries.forEach((entry) => {
      if (!entry.lines) return;
      entry.lines.forEach((line) => {
        const acc = this.state.accounts.find((a) => a.code === line.account_code);
        if (acc) {
          if (balanceMap[acc.code] === void 0) balanceMap[acc.code] = acc.initial_balance || 0;
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);
          if (acc.type === "asset" || acc.type === "expense")
            balanceMap[acc.code] += debit - credit;
          else balanceMap[acc.code] += credit - debit;
        }
      });
    });
    this.state.accounts.forEach((acc) => {
      if (acc.system_binding && acc.system_binding !== "none" && acc.sync_status !== "pending") {
        let liveBalance = acc.initial_balance || 0;
        if (acc.system_binding.startsWith("treasury_")) {
          const tId = acc.system_binding.replace("treasury_", "");
          let t = this.state.treasuries.find((x) => x.id === tId);
          if (!t) {
            if (tId === "main") t = this.state.treasuries.find((x) => x.id === "tr-1");
            else if (tId === "cib") t = this.state.treasuries.find((x) => x.id === "tr-2");
            else if (tId === "extra") t = this.state.treasuries.find((x) => x.id === "tr-3");
            else if (tId === "usd") t = this.state.treasuries.find((x) => x.id === "tr-4");
            else if (tId === "management_egp")
              t = this.state.treasuries.find((x) => x.id === "tr-5");
          }
          if (t) liveBalance = t.balance || 0;
        } else
          switch (acc.system_binding) {
            case "suppliers_payable":
              liveBalance = this.state.suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
              break;
            case "sales_revenue":
              liveBalance =
                this.state.vouchers
                  ?.filter((v) => !v.deleted && v.type === "receipt")
                  ?.reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;
              break;
            case "operating_expenses":
              liveBalance =
                this.state.vouchers
                  ?.filter((v) => !v.deleted && v.type === "payment")
                  ?.reduce((sum, v) => sum + Number(v.amount || 0), 0) || 0;
              break;
            case "warehouse_main_value": {
              const items = localWarehouseStore.getInventory();
              liveBalance = localWarehouseStore
                .getWarehouseInventory("wh-main-default")
                .reduce((sum, row) => {
                  const item = items.find((i) => i.id === row.inventory_id);
                  if (item) return sum + Number(row.quantity || 0) * Number(item.cost || 0);
                  return sum;
                }, 0);
              break;
            }
            case "warehouse_kitchen_value": {
              const items = localWarehouseStore.getInventory();
              liveBalance = localWarehouseStore
                .getWarehouseInventory("wh-sub-kitchen")
                .reduce((sum, row) => {
                  const item = items.find((i) => i.id === row.inventory_id);
                  if (item) return sum + Number(row.quantity || 0) * Number(item.cost || 0);
                  return sum;
                }, 0);
              break;
            }
            case "expired_inventory_value": {
              const nowStr = /* @__PURE__ */ new Date().toISOString().split("T")[0];
              const expiredBatches = this.state.inventoryExpiry.filter(
                (b) => b.expiry_date <= nowStr,
              );
              const items = localWarehouseStore.getInventory();
              liveBalance = expiredBatches.reduce((sum, batch) => {
                const item = items.find((i) => i.id === batch.inventory_id);
                if (item) return sum + Number(batch.quantity || 0) * Number(item.cost || 0);
                return sum;
              }, 0);
              break;
            }
            case "disposed_waste_value":
              liveBalance = this.state.totalDisposedExpiryValue || 0;
              break;
            default:
              break;
          }
        balanceMap[acc.code] = liveBalance;
      }
    });
    this.state.accounts.forEach((acc) => {
      if (balanceMap[acc.code] !== void 0) acc.balance = balanceMap[acc.code];
    });
    if (this.state.treasuries && this.state.treasuries.length > 0) {
      this.state.treasuries.forEach((tr) => {
        const opening = Number(tr.opening_balance || 0);
        const matchedCode = String(tr.account_code || "").trim();

        // Real-time calculation of treasury balance directly from General Ledger Journal Entries
        let totalDebit = 0;
        let totalCredit = 0;

        (this.state.journalEntries || []).forEach((je) => {
          (je.lines || []).forEach((line) => {
            const lineAccCode = String(line.account_code || "").trim();
            let isMatch = false;

            if (matchedCode && lineAccCode === matchedCode) {
              isMatch = true;
            } else {
              const resolved = this.resolveTreasuryForAccount(
                lineAccCode,
                line.currency || je.currency,
                line.description || je.description,
              );
              if (resolved && resolved.id === tr.id) {
                isMatch = true;
              }
            }

            if (isMatch) {
              totalDebit += Number(line.debit || 0);
              totalCredit += Number(line.credit || 0);
            }
          });
        });

        const glCalculatedBalance = opening + (totalDebit - totalCredit);
        tr.balance = glCalculatedBalance;
        tr.available_balance = glCalculatedBalance;

        // Update multi-currency sub-containers if any
        if (tr.containers && tr.containers.length > 0) {
          tr.containers.forEach((cnt) => {
            let cntDebit = 0;
            let cntCredit = 0;
            const targetCurr = (cnt.currency || "").toUpperCase();

            (this.state.journalEntries || []).forEach((je) => {
              (je.lines || []).forEach((line) => {
                const lineAccCode = String(line.account_code || "").trim();
                const lineCurr = (line.currency || je.currency || "").toUpperCase();

                if (lineCurr === targetCurr) {
                  let isMatch = false;
                  if (matchedCode && lineAccCode === matchedCode) {
                    isMatch = true;
                  } else {
                    const resolved = this.resolveTreasuryForAccount(
                      lineAccCode,
                      line.currency || je.currency,
                      line.description || je.description,
                    );
                    if (resolved && resolved.id === tr.id) {
                      isMatch = true;
                    }
                  }

                  if (isMatch) {
                    cntDebit += Number(line.debit || 0);
                    cntCredit += Number(line.credit || 0);
                  }
                }
              });
            });

            cnt.balance = cntDebit - cntCredit;
          });
        }
      });
    }
    this.saveState();
  }
  resolveTreasuryForAccount(accountCode, currency, movementNote) {
    if (!this.state.treasuries || this.state.treasuries.length === 0) return void 0;
    const directMatch = this.state.treasuries.find(
      (t) => !t.deleted && t.account_code && t.account_code === accountCode,
    );
    if (directMatch) return directMatch;
    const code = String(accountCode || "").trim();
    const curr = (currency || "").toUpperCase();
    const note = (movementNote || "").toLowerCase();
    if (code === "15010100" || code === "150101" || code.startsWith("150101")) {
      const usdTr = this.state.treasuries.find(
        (t) => !t.deleted && (t.id === "tr-4" || (t.currency === "USD" && t.type === "cash")),
      );
      if (usdTr) return usdTr;
    }
    if (code === "15010200" || code === "150102" || (code.startsWith("1501") && curr === "EGP")) {
      const egpTr = this.state.treasuries.find(
        (t) =>
          !t.deleted && (t.id === "tr-5" || (t.currency === "EGP" && t.name_ar.includes("مصري"))),
      );
      if (egpTr) return egpTr;
    }
    if (code === "101000" || code === "1010" || code.startsWith("101000")) {
      if (curr === "USD") {
        const usdTr = this.state.treasuries.find((t) => !t.deleted && t.currency === "USD");
        if (usdTr) return usdTr;
      } else if (curr === "SSP") {
        const sspTr = this.state.treasuries.find((t) => !t.deleted && t.currency === "SSP");
        if (sspTr) return sspTr;
      }
      const cashierTr = this.state.treasuries.find(
        (t) => !t.deleted && (t.id === "tr-1" || t.linked_to_restaurant),
      );
      if (cashierTr) return cashierTr;
    }
    if (code === "101001" || code.includes("juba") || note.includes("جوبا")) {
      const jubaTr = this.state.treasuries.find(
        (t) =>
          !t.deleted &&
          (t.id === "tr-juba" || t.branch_id === "branch-2" || t.name_ar.includes("جوبا")),
      );
      if (jubaTr) return jubaTr;
    }
    if (
      code === "102000" ||
      code.startsWith("1502") ||
      code.startsWith("1020") ||
      note.includes("بنك") ||
      note.includes("cib")
    ) {
      const bankTr = this.state.treasuries.find(
        (t) => !t.deleted && (t.type === "bank" || t.id === "tr-2" || t.id === "tr-cib"),
      );
      if (bankTr) return bankTr;
    }
    const acc = this.state.accounts.find((a) => a.code === code);
    if (acc) {
      const accName = acc.name_ar.toLowerCase();
      if (accName.includes("دولار") || accName.includes("usd")) {
        const t = this.state.treasuries.find((tr) => !tr.deleted && tr.currency === "USD");
        if (t) return t;
      }
      if (accName.includes("بنك") || accName.includes("cib") || accName.includes("ايدين")) {
        const t = this.state.treasuries.find((tr) => !tr.deleted && tr.type === "bank");
        if (t) return t;
      }
      if (accName.includes("كاشير") || accName.includes("صالة") || accName.includes("مطعم")) {
        const t = this.state.treasuries.find(
          (tr) => !tr.deleted && (tr.id === "tr-1" || tr.linked_to_restaurant),
        );
        if (t) return t;
      }
      if (accName.includes("مصري") || accName.includes("ادارة") || accName.includes("إدارة")) {
        const t = this.state.treasuries.find(
          (tr) => !tr.deleted && (tr.id === "tr-5" || tr.currency === "EGP"),
        );
        if (t) return t;
      }
    }
    if (curr) {
      const fallbackByCurr = this.state.treasuries.find((t) => !t.deleted && t.currency === curr);
      if (fallbackByCurr) return fallbackByCurr;
    }
    return this.state.treasuries.find((t) => !t.deleted);
  }
  inferMovementTypeFromLine(line, mainDesc = "", otherLines = []) {
    const isDebit = Number(line.debit || 0) > 0;
    const isCredit = Number(line.credit || 0) > 0;
    const desc = (line.description || " " + mainDesc).toLowerCase();
    const hasRevenueAccount = otherLines.some((l) => l.account_code.startsWith("4"));
    const hasExpenseAccount = otherLines.some(
      (l) =>
        l.account_code.startsWith("5") ||
        l.account_code.startsWith("6") ||
        l.account_code.startsWith("3"),
    );
    const hasTreasuryAccount = otherLines.some(
      (l) =>
        l.account_code.startsWith("1501") ||
        l.account_code.startsWith("1010") ||
        l.account_code.startsWith("1020"),
    );
    const hasSupplierOrInv = otherLines.some(
      (l) =>
        l.account_code.startsWith("103") ||
        l.account_code.startsWith("202") ||
        l.account_code.startsWith("140"),
    );
    if (isDebit) {
      if (desc.includes("تحويل") || desc.includes("تمويل") || hasTreasuryAccount)
        return "transfer_in";
      if (
        desc.includes("مبيعات") ||
        desc.includes("ايراد") ||
        desc.includes("إيراد") ||
        hasRevenueAccount
      )
        return "sales";
      if (desc.includes("تسوية") || desc.includes("فارق")) return "reconciliation";
      return "deposit";
    }
    if (isCredit) {
      if (desc.includes("تحويل") || desc.includes("تمويل") || hasTreasuryAccount)
        return "transfer_out";
      if (
        desc.includes("شراء") ||
        desc.includes("مشتريات") ||
        desc.includes("خامات") ||
        hasSupplierOrInv
      )
        return "purchase";
      if (
        desc.includes("مصروف") ||
        desc.includes("مرتب") ||
        desc.includes("اجور") ||
        desc.includes("أجور") ||
        desc.includes("بنزين") ||
        desc.includes("صيانة") ||
        desc.includes("بوفيه") ||
        desc.includes("ايجار") ||
        desc.includes("إيجار") ||
        desc.includes("سلف") ||
        hasExpenseAccount
      )
        return "expense";
      if (desc.includes("تسوية") || desc.includes("عجز")) return "reconciliation";
      return "withdrawal";
    }
    return "deposit";
  }
  importJournalEntriesAndSyncTreasuries(entries, options = {}) {
    let insertedEntries = 0;
    let newAccountsCreated = 0;
    let linkedTreasuryTransactions = 0;

    const existingEntryIds = new Set(this.state.journalEntries.map((je) => je.id));
    const existingEntryRefs = new Set(
      this.state.journalEntries.map(
        (je) => `${je.reference || ""}_${je.date || ""}_${je.description || ""}`,
      ),
    );
    const existingAccountCodes = new Set(this.state.accounts.map((a) => a.code));
    const existingTxIds = new Set(this.state.treasuryTransactions.map((tx) => tx.id));
    const existingTxRefs = new Set(
      this.state.treasuryTransactions.map(
        (tx) => `${tx.related_entity_id || ""}_${tx.treasury_id}_${tx.amount}_${tx.type}`,
      ),
    );
    (entries || []).forEach((entry) => {
      const entryKey = `${entry.reference || ""}_${entry.date || ""}_${entry.description || ""}`;
      let entryToProcess = entry;
      if (!existingEntryIds.has(entry.id) && !existingEntryRefs.has(entryKey)) {
        this.state.journalEntries.unshift(entry);
        existingEntryIds.add(entry.id);
        existingEntryRefs.add(entryKey);
        insertedEntries++;
      } else {
        const found = this.state.journalEntries.find(
          (j) =>
            j.id === entry.id ||
            `${j.reference || ""}_${j.date || ""}_${j.description || ""}` === entryKey,
        );
        if (found) entryToProcess = found;
      }
      (entryToProcess.lines || []).forEach((line, lineIndex) => {
        const code = String(line.account_code || "").trim();
        if (!code) return;
        if (!existingAccountCodes.has(code)) {
          let type = "asset";
          if (code.startsWith("1")) type = "asset";
          else if (code.startsWith("2")) type = "liability";
          else if (code.startsWith("3")) type = "equity";
          else if (code.startsWith("4")) type = "revenue";
          else if (code.startsWith("5") || code.startsWith("6")) type = "expense";
          let level = 3;
          if (code.length <= 1) level = 1;
          else if (code.length <= 3) level = 2;
          else if (code.length <= 5) level = 3;
          else level = 4;
          const accDisplayName =
            (line.account_name && line.account_name.trim()) ||
            (line.description && !line.description.startsWith("قيد")
              ? line.description
              : `حساب محاسبي (${code})`);
          const newAcc = {
            code,
            name_ar: accDisplayName,
            type,
            level,
            balance: 0,
            initial_balance: 0,
            status: "active",
            currency: line.currency || entryToProcess.currency || "EGP",
            system_binding: "none",
          };
          this.state.accounts.push(newAcc);
          existingAccountCodes.add(code);
          newAccountsCreated++;
        }
        const isTreasuryAccount =
          code.startsWith("130") ||
          code.startsWith("1501") ||
          code.startsWith("1010") ||
          code.startsWith("1502") ||
          code.startsWith("1020") ||
          this.state.treasuries.some((t) => t.account_code === code);
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        const amount = debit > 0 ? debit : credit;
        if (isTreasuryAccount && amount > 0) {
          const matchedTreasury = this.resolveTreasuryForAccount(
            code,
            line.currency || entryToProcess.currency,
            line.description || entryToProcess.description,
          );
          if (matchedTreasury) {
            const otherLines = (entryToProcess.lines || []).filter((_, idx) => idx !== lineIndex);
            const movementType = this.inferMovementTypeFromLine(
              line,
              entryToProcess.description,
              otherLines,
            );
            const txCurrency =
              line.currency || entryToProcess.currency || matchedTreasury.currency || "EGP";
            const txNote =
              line.description ||
              entryToProcess.description ||
              `قيد رقم ${entryToProcess.reference || entryToProcess.id}`;
            const txKey = `${entryToProcess.id}_${matchedTreasury.id}_${amount}_${movementType}`;
            if (!existingTxRefs.has(txKey)) {
              const txId = `tx-import-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
              const txDate = entryToProcess.date
                ? new Date(entryToProcess.date).toISOString()
                : /* @__PURE__ */ new Date().toISOString();
              const newTx = {
                id: txId,
                branch_id: matchedTreasury.branch_id || "branch-1",
                treasury_id: matchedTreasury.id,
                type: movementType,
                amount,
                currency: txCurrency,
                payment_method: matchedTreasury.type === "bank" ? "bank_transfer" : "cash",
                note: txNote,
                related_entity_id: entryToProcess.id,
                created_at: txDate,
              };
              this.state.treasuryTransactions.unshift(newTx);
              existingTxIds.add(txId);
              existingTxRefs.add(txKey);
              linkedTreasuryTransactions++;
            }
          }
        }
      });
    });
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "استيراد ومعالجة قيود Excel",
      `تم استيراد ومعالجة ${insertedEntries} قيد، وإنشاء ${newAccountsCreated} حساب جديد، وربط ${linkedTreasuryTransactions} حركة بالخزائن المقابلة.`,
      "IMPORT",
    );
    return {
      insertedEntries,
      newAccountsCreated,
      linkedTreasuryTransactions,
    };
  }
  mergeAndSyncAllData() {
    const existingAccountCodes = new Set(this.state.accounts.map((a) => a.code));
    let newAccountsCreated = 0;
    this.state.journalEntries.forEach((entry) => {
      (entry.lines || []).forEach((line) => {
        const code = String(line.account_code || "").trim();
        if (code && !existingAccountCodes.has(code)) {
          let type = "asset";
          if (code.startsWith("1")) type = "asset";
          else if (code.startsWith("2")) type = "liability";
          else if (code.startsWith("3")) type = "equity";
          else if (code.startsWith("4")) type = "revenue";
          else if (code.startsWith("5") || code.startsWith("6")) type = "expense";
          let level = 3;
          if (code.length <= 1) level = 1;
          else if (code.length <= 3) level = 2;
          else if (code.length <= 5) level = 3;
          else level = 4;
          this.state.accounts.push({
            code,
            name_ar: line.description
              ? `حساب (${code}) - ${line.description}`
              : `حساب محاسبي (${code})`,
            type,
            level,
            balance: 0,
            initial_balance: 0,
            status: "active",
            currency: line.currency || entry.currency || "EGP",
            system_binding: "none",
          });
          existingAccountCodes.add(code);
          newAccountsCreated++;
        }
      });
    });
    const existingTxRefs = new Set(
      (this.state.treasuryTransactions || []).map(
        (tx) => `${tx.related_entity_id || ""}_${tx.treasury_id}_${tx.amount}_${tx.type}`,
      ),
    );
    this.state.journalEntries.forEach((entry) => {
      (entry.lines || []).forEach((line, idx) => {
        const code = String(line.account_code || "").trim();
        const isTreasuryAccount =
          code.startsWith("130") ||
          code.startsWith("1501") ||
          code.startsWith("1010") ||
          code.startsWith("1502") ||
          code.startsWith("1020") ||
          this.state.treasuries.some((t) => t.account_code === code);
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        const amount = debit > 0 ? debit : credit;
        if (isTreasuryAccount && amount > 0) {
          const matchedTreasury = this.resolveTreasuryForAccount(
            code,
            line.currency || entry.currency,
            line.description || entry.description,
          );
          if (matchedTreasury) {
            const otherLines = (entry.lines || []).filter((_, i) => i !== idx);
            const movementType = this.inferMovementTypeFromLine(
              line,
              entry.description,
              otherLines,
            );
            const txKey = `${entry.id}_${matchedTreasury.id}_${amount}_${movementType}`;
            if (!existingTxRefs.has(txKey)) {
              const newTx = {
                id: `tx-sync-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
                branch_id: matchedTreasury.branch_id || "branch-1",
                treasury_id: matchedTreasury.id,
                type: movementType,
                amount,
                currency: line.currency || entry.currency || matchedTreasury.currency || "EGP",
                payment_method: matchedTreasury.type === "bank" ? "bank_transfer" : "cash",
                note:
                  line.description || entry.description || `قيد رقم ${entry.reference || entry.id}`,
                related_entity_id: entry.id,
                created_at: entry.date
                  ? new Date(entry.date).toISOString()
                  : /* @__PURE__ */ new Date().toISOString(),
              };
              this.state.treasuryTransactions.unshift(newTx);
              existingTxRefs.add(txKey);
            }
          }
        }
      });
    });
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "دمج وتحديث البيانات المالية",
      `تم فحص ومطابقة شجرة الحسابات (${this.state.accounts.length} حساب) والقيود (${this.state.journalEntries.length} قيد) وتحديث كافة الخزائن والأرصدة.`,
      "UPDATE",
    );
    return {
      accountsCount: this.state.accounts.length,
      entriesCount: this.state.journalEntries.length,
      treasuriesUpdated: this.state.treasuries.length,
      transactionsCount: this.state.treasuryTransactions.length,
    };
  }

  persistAllJournalsToDatabase() {
    const existingAccountCodes = new Set(this.state.accounts.map((a) => a.code));
    const newlyCreatedAccounts: Account[] = [];
    let newAccountsCreated = 0;

    // 1. Ensure all accounts in all journal lines exist
    this.state.journalEntries.forEach((entry) => {
      (entry.lines || []).forEach((line) => {
        const code = String(line.account_code || "").trim();
        if (code && !existingAccountCodes.has(code)) {
          let type = "asset";
          if (code.startsWith("1")) type = "asset";
          else if (code.startsWith("2")) type = "liability";
          else if (code.startsWith("3")) type = "equity";
          else if (code.startsWith("4")) type = "revenue";
          else if (code.startsWith("5") || code.startsWith("6")) type = "expense";

          let level = 3;
          if (code.length <= 1) level = 1;
          else if (code.length <= 3) level = 2;
          else if (code.length <= 5) level = 3;
          else level = 4;

          const newAcc: Account = {
            code,
            name_ar:
              (line.account_name && line.account_name.trim()) ||
              (line.description && !line.description.startsWith("قيد")
                ? line.description
                : `حساب محاسبي (${code})`),
            type,
            level,
            balance: 0,
            initial_balance: 0,
            status: "active",
            currency: line.currency || entry.currency || "USD",
            system_binding: "none",
          };
          this.state.accounts.push(newAcc);
          newlyCreatedAccounts.push(newAcc);
          existingAccountCodes.add(code);
          newAccountsCreated++;
        }
      });
    });

    // 2. Link & Sync Treasury movements
    const existingTxRefs = new Set(
      (this.state.treasuryTransactions || []).map(
        (tx) => `${tx.related_entity_id || ""}_${tx.treasury_id}_${tx.amount}_${tx.type}`,
      ),
    );
    let linkedTreasuryTransactions = 0;

    this.state.journalEntries.forEach((entry) => {
      (entry.lines || []).forEach((line, idx) => {
        const code = String(line.account_code || "").trim();
        const isTreasuryAccount =
          code.startsWith("130") ||
          code.startsWith("1501") ||
          code.startsWith("1010") ||
          code.startsWith("1502") ||
          code.startsWith("1020") ||
          this.state.treasuries.some((t) => t.account_code === code);
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        const amount = debit > 0 ? debit : credit;

        if (isTreasuryAccount && amount > 0) {
          const matchedTreasury = this.resolveTreasuryForAccount(
            code,
            line.currency || entry.currency,
            line.description || entry.description,
          );
          if (matchedTreasury) {
            const otherLines = (entry.lines || []).filter((_, i) => i !== idx);
            const movementType = this.inferMovementTypeFromLine(
              line,
              entry.description,
              otherLines,
            );
            const txKey = `${entry.id}_${matchedTreasury.id}_${amount}_${movementType}`;
            if (!existingTxRefs.has(txKey)) {
              const newTx = {
                id: `tx-sync-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
                branch_id: matchedTreasury.branch_id || "branch-1",
                treasury_id: matchedTreasury.id,
                type: movementType,
                amount,
                currency: line.currency || entry.currency || matchedTreasury.currency || "USD",
                payment_method: matchedTreasury.type === "bank" ? "bank_transfer" : "cash",
                note:
                  line.description || entry.description || `قيد رقم ${entry.reference || entry.id}`,
                related_entity_id: entry.id,
                created_at: entry.date
                  ? new Date(entry.date).toISOString()
                  : /* @__PURE__ */ new Date().toISOString(),
              };
              this.state.treasuryTransactions.unshift(newTx);
              existingTxRefs.add(txKey);
              linkedTreasuryTransactions++;
            }
          }
        }
      });
    });

    // 3. Recalculate balances
    this.recalculateAccountBalances();

    // 4. Calculate stats for report
    let totalBaseUSD = 0;
    let balancedEntriesCount = 0;
    let unbalancedEntriesCount = 0;

    this.state.journalEntries.forEach((je) => {
      const entryCurrencies = Array.from(
        new Set(je.lines.map((l) => l.currency || je.currency || "USD")),
      );
      const isSingleCurr = entryCurrencies.length <= 1;

      const tDebit = je.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
      const tCredit = je.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

      const baseDebit = je.lines.reduce((s, l) => {
        const r = Number(l.rate) || 1;
        const v = Number(l.debit) || 0;
        if (l.currency === "USD") return s + v;
        return s + v * r;
      }, 0);

      const baseCredit = je.lines.reduce((s, l) => {
        const r = Number(l.rate) || 1;
        const v = Number(l.credit) || 0;
        if (l.currency === "USD") return s + v;
        return s + v * r;
      }, 0);

      totalBaseUSD += baseDebit;

      const isBalanced = isSingleCurr
        ? Math.abs(tDebit - tCredit) < 0.01
        : Math.abs(baseDebit - baseCredit) < 0.05;
      if (isBalanced) balancedEntriesCount++;
      else unbalancedEntriesCount++;
    });

    // 5. Commit to durable storage
    this.saveState();
    this.logAction(
      "ADMIN",
      "حفظ وتثبيت القيود في قاعدة البيانات",
      `تم حفظ وتثبيت ${this.state.journalEntries.length} قيد محاسبي (${balancedEntriesCount} متزن، ${unbalancedEntriesCount} غير متزن)، وإنشاء ${newAccountsCreated} حساب جديد، وربط ${linkedTreasuryTransactions} حركة خزينة.`,
      "UPDATE",
    );

    return {
      success: true,
      savedEntriesCount: this.state.journalEntries.length,
      savedEntries: [...this.state.journalEntries],
      newAccountsCreated,
      newlyCreatedAccounts,
      totalAccountsCount: this.state.accounts.length,
      linkedTreasuryTransactions,
      totalBaseUSD,
      balancedEntriesCount,
      unbalancedEntriesCount,
      savedAt: new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  }

  checkCanModifyJournalEntry(entryDateOrEntry: any): { allowed: boolean; reason?: string } {
    const dateStr =
      typeof entryDateOrEntry === "string" ? entryDateOrEntry : entryDateOrEntry?.date;
    const currentYear = new Date().getFullYear(); // 2026
    let entryYear = currentYear;
    if (dateStr) {
      const parsedYear = new Date(dateStr).getFullYear();
      if (!isNaN(parsedYear) && parsedYear > 1970) {
        entryYear = parsedYear;
      }
    }

    // Previous years restriction check (e.g. 2025, 2024, etc.)
    if (entryYear < currentYear) {
      if (this.state.isAccountingPeriodLocked) {
        return {
          allowed: false,
          reason:
            "You cannot edit restrictions in a closed year. (لا يمكنك تعديل أو حذف القيود في سنة أو فترة مالية مغلقة)",
        };
      }
    } else if (entryYear === currentYear) {
      // Current fiscal year check (e.g. 2026)
      if (this.state.fiscalYearStatus === "closed") {
        return {
          allowed: false,
          reason:
            "السنة المالية 2026 مغلقة ومقفلة حالياً، لا يمكن تعديل أو حذف القيود إلا بعد إعادة فتح السنة المالية.",
        };
      }
    }

    return { allowed: true };
  }

  deleteSingleJournalEntry(entryId: string): { success: boolean; error?: string } {
    const targetEntry = this.state.journalEntries.find((je) => je.id === entryId);
    if (!targetEntry) return { success: false, error: "القيد غير موجود" };

    const check = this.checkCanModifyJournalEntry(targetEntry.date);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    this.state.journalEntries = this.state.journalEntries.filter((je) => je.id !== entryId);
    if (Array.isArray(this.state.treasuryTransactions)) {
      this.state.treasuryTransactions = this.state.treasuryTransactions.filter(
        (tx) => tx.related_entity_id !== entryId,
      );
    }
    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "حذف قيد محاسبي فردي",
      `تم حذف القيد رقم ${targetEntry.reference || targetEntry.id} (${targetEntry.description}) وإعادة احتساب الأرصدة.`,
      "DELETE",
    );
    this.notify();
    return { success: true };
  }

  updateExistingJournalEntry(
    entryId: string,
    updated: {
      description?: string;
      date?: string;
      reference?: string;
      currency?: string;
      lines?: any[];
    },
  ): { success: boolean; error?: string } {
    const targetEntry = this.state.journalEntries.find((je) => je.id === entryId);
    if (!targetEntry) return { success: false, error: "القيد غير موجود" };

    const check = this.checkCanModifyJournalEntry(targetEntry.date);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    if (updated.date && updated.date !== targetEntry.date) {
      const newDateCheck = this.checkCanModifyJournalEntry(updated.date);
      if (!newDateCheck.allowed) {
        return { success: false, error: newDateCheck.reason };
      }
    }

    if (updated.description !== undefined) targetEntry.description = updated.description;
    if (updated.date !== undefined) targetEntry.date = updated.date;
    if (updated.reference !== undefined) targetEntry.reference = updated.reference;
    if (updated.currency !== undefined) targetEntry.currency = updated.currency;
    if (updated.lines !== undefined) targetEntry.lines = updated.lines;

    this.recalculateAccountBalances();
    this.saveState();
    this.logAction(
      "ADMIN",
      "تعديل قيد محاسبي",
      `تم تعديل القيد المحاسبي رقم ${targetEntry.reference || targetEntry.id} (${targetEntry.description}) بنجاح.`,
      "UPDATE",
    );
    this.notify();
    return { success: true };
  }

  getAccountLedgerEntries(accountCode) {
    const entries = [];
    const acc = this.state.accounts.find((a) => a.code === accountCode);
    if (!acc)
      return {
        account: null,
        entries: [],
      };
    let currentBalance = acc.initial_balance || 0;
    const sortedEntries = [...this.state.journalEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    for (const je of sortedEntries)
      for (const line of je.lines || [])
        if (line.account_code === accountCode) {
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);
          if (acc.type === "asset" || acc.type === "expense") currentBalance += debit - credit;
          else currentBalance += credit - debit;
          entries.push({
            id: je.id,
            date: je.date,
            description: je.description,
            reference: je.reference,
            debit,
            credit,
            runningBalance: currentBalance,
            created_by: je.created_by,
          });
        }
    return {
      account: acc,
      entries,
    };
  }
  getLineBaseValue(amount, rate) {
    const val = Number(amount) || 0;
    const r = Number(rate) || 1;
    if (r <= 0) return val;
    return val * r;
  }

  generateJournalReference(
    dateStr?: string,
    providedRef?: string,
    pendingEntries: any[] = [],
    periodVal?: any,
    journalNumVal?: any,
  ) {
    if (providedRef && String(providedRef).trim()) {
      const trimmed = String(providedRef).trim();
      if (trimmed.includes("/")) {
        const parts = trimmed.split("/");
        const pClean = parts[0].trim().padStart(2, "0");
        const jClean = parts[1].trim().padStart(2, "0");
        return `${pClean}/${jClean}`;
      }
      return trimmed;
    }

    // 1. Extract Period (01) from periodVal or from date's month
    let periodStr = "";
    if (periodVal !== undefined && periodVal !== null && String(periodVal).trim() !== "") {
      const pTrim = String(periodVal).trim();
      const pNum = parseInt(pTrim, 10);
      if (!isNaN(pNum)) {
        periodStr = String(pNum).padStart(2, "0");
      } else {
        periodStr = pTrim.padStart(2, "0");
      }
    }

    const d = dateStr ? new Date(dateStr) : new Date();
    if (!periodStr) {
      const m = isNaN(d.getTime()) ? new Date().getMonth() + 1 : d.getMonth() + 1;
      periodStr = String(m).padStart(2, "0");
    }

    // 2. Extract Journal Number (02) from journalNumVal or calculate sequential order in period
    if (
      journalNumVal !== undefined &&
      journalNumVal !== null &&
      String(journalNumVal).trim() !== "" &&
      String(journalNumVal).trim() !== "0"
    ) {
      const jTrim = String(journalNumVal).trim();
      if (jTrim.includes("/")) {
        const parts = jTrim.split("/");
        return `${parts[0].trim().padStart(2, "0")}/${parts[1].trim().padStart(2, "0")}`;
      }
      const jNum = parseInt(jTrim, 10);
      const journalStr = !isNaN(jNum) ? String(jNum).padStart(2, "0") : jTrim.padStart(2, "0");
      return `${periodStr}/${journalStr}`;
    }

    let maxSeq = 0;
    const checkEntry = (je: any) => {
      if (!je || !je.reference) return;
      const ref = String(je.reference).trim();
      if (ref.includes("/")) {
        const parts = ref.split("/");
        if (parts[0] === periodStr) {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    };

    if (Array.isArray(this.state.journalEntries)) {
      this.state.journalEntries.forEach(checkEntry);
    }
    if (Array.isArray(pendingEntries)) {
      pendingEntries.forEach(checkEntry);
    }

    const seq = maxSeq + 1;
    return `${periodStr}/${String(seq).padStart(2, "0")}`;
  }

  addJournalEntry(description, lines, reference, currency = "USD", date, customId) {
    const targetDate = date || /* @__PURE__ */ new Date().toISOString().split("T")[0];
    const check = this.checkCanModifyJournalEntry(targetDate);
    if (!check.allowed && !customId?.startsWith("ORACLE")) {
      console.warn("Accounting period / year is locked:", check.reason);
      throw new Error(check.reason || "You cannot edit restrictions in a closed year.");
    }
    const totalDebit = lines.reduce(
      (sum, l) => sum + this.getLineBaseValue(l.debit, l.rate || 1),
      0,
    );
    const totalCredit = lines.reduce(
      (sum, l) => sum + this.getLineBaseValue(l.credit, l.rate || 1),
      0,
    );
    if (Math.abs(totalDebit - totalCredit) > 0.5) {
      console.error(
        `Double-entry balance mismatch error: Debit (Base): ${totalDebit}, Credit (Base): ${totalCredit}`,
      );
      if (!customId?.startsWith("ORACLE")) return;
      else console.warn("Bypassing strict double-entry validation for legacy Oracle import.");
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
      created_at: /* @__PURE__ */ new Date().toISOString(),
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
  postSalesInvoiceJournal(
    orderNumber,
    total,
    subtotal,
    tax,
    paymentMethod = "cash",
    branchId,
    currency = "EGP",
    treasuryId = "tr-1",
    containerId,
  ) {
    let treasuryAccount = "101000";
    if (paymentMethod === "card") treasuryAccount = "102000";
    else if (paymentMethod === "wallet") treasuryAccount = "103000";
    const lines = [
      {
        account_code: treasuryAccount,
        debit: total,
        credit: 0,
      },
      {
        account_code: "401000",
        debit: 0,
        credit: subtotal,
      },
      {
        account_code: "202000",
        debit: 0,
        credit: tax,
      },
    ];
    this.addJournalEntry(
      `فاتورة مبيعات POS - طلب رقم #${orderNumber}`,
      lines,
      `INV-${orderNumber}`,
    );
    try {
      this.addTreasuryTransaction(
        treasuryId,
        "sales",
        total,
        currency,
        `إيرادات مبيعات المطعم - طلب رقم #${orderNumber}`,
        `INV-${orderNumber}`,
        paymentMethod,
        containerId,
      );
    } catch (err) {
      console.error("Error adding treasury transaction for order:", err);
    }
  }
  syncOperationalSalesWithTreasury(orders, targetTreasuryId) {
    let syncedCount = 0;
    let totalAmountSynced = 0;
    let alreadySyncedCount = 0;
    const trId =
      targetTreasuryId ||
      this.state.treasuries.find((t) => t.linked_to_restaurant && !t.deleted)?.id ||
      "tr-1";
    const targetTreasury = this.state.treasuries.find((t) => t.id === trId);
    if (!targetTreasury) {
      console.warn("Target cashier treasury not found for sync");
      return {
        syncedCount: 0,
        totalAmountSynced: 0,
        alreadySyncedCount: 0,
      };
    }
    const validOrders = (orders || []).filter(
      (o) => o && o.order_number && o.status !== "cancelled",
    );
    for (const order of validOrders) {
      const orderRef = `INV-${order.order_number}`;
      if (this.state.treasuryTransactions.find((tx) => tx.related_entity_id === orderRef)) {
        alreadySyncedCount++;
        continue;
      }
      let orderCurrency = "EGP";
      if (order.currency) orderCurrency = order.currency;
      else if (order.notes) {
        const match = String(order.notes).match(/العملة:\s*([A-Za-z]+)/);
        if (match && match[1]) orderCurrency = match[1];
      }
      const totalAmt = Number(order.total || 0);
      const subtotalAmt = Number(order.subtotal || totalAmt);
      const taxAmt = Number(order.tax || 0);
      const paymentMethod = order.payment_method || "cash";
      let containerId = "";
      if (targetTreasury.containers && targetTreasury.containers.length > 0) {
        const matchedCnt =
          targetTreasury.containers.find(
            (c) =>
              c.currency === orderCurrency &&
              ((paymentMethod === "cash" && c.id.includes("cash")) ||
                (paymentMethod === "card" && c.id.includes("card")) ||
                (paymentMethod === "wallet" && c.id.includes("wallet"))),
          ) || targetTreasury.containers.find((c) => c.currency === orderCurrency);
        if (matchedCnt) containerId = matchedCnt.id;
      }
      try {
        this.postSalesInvoiceJournal(
          order.order_number,
          totalAmt,
          subtotalAmt,
          taxAmt,
          paymentMethod,
          this.state.currentBranchId || "BR-001",
          orderCurrency,
          trId,
          containerId,
        );
        syncedCount++;
        totalAmountSynced += totalAmt;
      } catch (err) {
        console.error(`Error syncing order #${order.order_number}:`, err);
      }
    }
    if (syncedCount > 0) {
      this.recalculateAccountBalances();
      this.saveState();
      this.logAction(
        "CASHIER",
        "مزامنة مبيعات اليوم التشغيلية",
        `تمت مزامنة ${syncedCount} طلب مبيعات بقيمة إجمالية ${totalAmountSynced.toLocaleString()} مع خزينة الكاشير (${targetTreasury.name_ar})`,
        "TRANSACTION",
      );
    }
    return {
      syncedCount,
      totalAmountSynced,
      alreadySyncedCount,
    };
  }
  postSalesReturnJournal(
    orderNumber,
    total,
    paymentMethod = "cash",
    branchId,
    currency = "EGP",
    treasuryId = "tr-1",
    containerId,
  ) {
    let treasuryAccount = "101000";
    if (paymentMethod === "card") treasuryAccount = "102000";
    else if (paymentMethod === "wallet") treasuryAccount = "103000";
    const lines = [
      {
        account_code: "401000",
        debit: total,
        credit: 0,
      },
      {
        account_code: treasuryAccount,
        debit: 0,
        credit: total,
      },
    ];
    this.addJournalEntry(`مرتجع مبيعات POS - طلب رقم #${orderNumber}`, lines, `SRT-${orderNumber}`);
    try {
      this.addTreasuryTransaction(
        treasuryId,
        "withdrawal",
        total,
        currency,
        `مرتجع مبيعات المطعم - طلب رقم #${orderNumber}`,
        `SRT-${orderNumber}`,
        paymentMethod,
        containerId,
      );
    } catch (err) {
      console.error("Error adding treasury transaction for refund:", err);
    }
  }
  postPurchaseInvoiceJournal(
    poId: string,
    supplierId: string,
    total: number,
    branchId: string,
    currency: string = "USD",
    rate: number = 1,
    supplierAccountCode?: string,
  ) {
    const supplier = this.state.suppliers.find((s) => s.id === supplierId);
    const targetSupAcc = supplierAccountCode || supplier?.account_code || "201000";

    const lines = [
      {
        account_code: "103000",
        debit: total,
        credit: 0,
        currency: currency || "USD",
        rate: rate,
        description: `استلام مخزون بضاعة - أمر شراء #${poId.substring(3, 8)}`,
      },
      {
        account_code: targetSupAcc,
        debit: 0,
        credit: total,
        currency: currency || "USD",
        rate: rate,
        description: `استحقاق المورد (${supplier?.name_ar || "مورد"}) - أمر شراء #${poId.substring(3, 8)}`,
      },
    ];
    this.addJournalEntry(
      `فاتورة مشتريات للمورد ${supplier?.name_ar || ""} - أمر شراء #${poId.substring(3, 8)}`,
      lines,
      `PO-${poId.substring(3, 8).toUpperCase()}`,
      currency,
    );
  }
  postPurchaseReturnJournal(
    poId: string,
    amount: number,
    branchId: string,
    currency: string = "USD",
    rate: number = 1,
    supplierAccountCode?: string,
  ) {
    const supplier = this.state.suppliers.find(
      (s) => s.id === this.state.purchaseOrders.find((p) => p.id === poId)?.supplier_id,
    );
    const targetSupAcc = supplierAccountCode || supplier?.account_code || "201000";

    const lines = [
      {
        account_code: targetSupAcc,
        debit: amount,
        credit: 0,
        currency: currency || "USD",
        rate: rate,
        description: `مرتجع بضائع للمورد (${supplier?.name_ar || "مورد"}) - أمر شراء #${poId.substring(3, 8)}`,
      },
      {
        account_code: "103000",
        debit: 0,
        credit: amount,
        currency: currency || "USD",
        rate: rate,
        description: `تخفيض مخزون بضاعة مرتجعة - أمر شراء #${poId.substring(3, 8)}`,
      },
    ];
    this.addJournalEntry(
      `مرتجع بضائع مشتريات للمورد - أمر شراء #${poId.substring(3, 8)}`,
      lines,
      `PRT-${poId.substring(3, 8).toUpperCase()}`,
      currency,
    );
  }
  postExpenseJournal(voucherId, amount, accountCode, costCenter, branchId) {
    const lines = [
      {
        account_code: accountCode,
        debit: amount,
        credit: 0,
        cost_center: costCenter,
      },
      {
        account_code: branchId === "branch-2" ? "101001" : "101000",
        debit: 0,
        credit: amount,
      },
    ];
    this.addJournalEntry(
      `سند صرف مصروفات - رقم #${voucherId.substring(4, 9)}`,
      lines,
      `EXP-${voucherId.substring(4, 9).toUpperCase()}`,
    );
  }
  postRevenueJournal(voucherId, amount, accountCode, costCenter, branchId) {
    const lines = [
      {
        account_code: branchId === "branch-2" ? "101001" : "101000",
        debit: amount,
        credit: 0,
      },
      {
        account_code: accountCode,
        debit: 0,
        credit: amount,
        cost_center: costCenter,
      },
    ];
    this.addJournalEntry(
      `سند قبض إيرادات متنوعة - رقم #${voucherId.substring(4, 9)}`,
      lines,
      `REV-${voucherId.substring(4, 9).toUpperCase()}`,
    );
  }
  postTreasuryTransferJournal(fromTreasuryId, toTreasuryId, amount, branchId) {
    const fromT = this.state.treasuries.find((t) => t.id === fromTreasuryId);
    const toT = this.state.treasuries.find((t) => t.id === toTreasuryId);
    if (!fromT || !toT) return;
    const fromAcc =
      fromT.type === "bank" ? "102000" : fromT.branch_id === "branch-2" ? "101001" : "101000";
    const lines = [
      {
        account_code:
          toT.type === "bank" ? "102000" : toT.branch_id === "branch-2" ? "101001" : "101000",
        debit: amount,
        credit: 0,
      },
      {
        account_code: fromAcc,
        debit: 0,
        credit: amount,
      },
    ];
    this.addJournalEntry(
      `حركة تحويل مالي بين الخزائن - من ${fromT.name_ar} إلى ${toT.name_ar}`,
      lines,
      `TRF-${Math.floor(Math.random() * 8999) + 1e3}`,
    );
  }
  postCashDepositJournal(treasuryId, amount, branchId) {
    const lines = [
      {
        account_code: branchId === "branch-2" ? "101001" : "101000",
        debit: amount,
        credit: 0,
      },
      {
        account_code: "301000",
        debit: 0,
        credit: amount,
      },
    ];
    this.addJournalEntry(
      `إيداع تمويل مالي مباشر بالخزينة`,
      lines,
      `DEP-${Math.floor(Math.random() * 8999) + 1e3}`,
    );
  }
  postCashWithdrawalJournal(treasuryId, amount, branchId) {
    const lines = [
      {
        account_code: "301000",
        debit: amount,
        credit: 0,
      },
      {
        account_code: branchId === "branch-2" ? "101001" : "101000",
        debit: 0,
        credit: amount,
      },
    ];
    this.addJournalEntry(
      `سحب نقدي مباشر تمويلي من الخزينة`,
      lines,
      `WDL-${Math.floor(Math.random() * 8999) + 1e3}`,
    );
  }
  postInventoryAdjustmentJournal(docNumber, amount, branchId) {
    const lines = [
      {
        account_code: "506000",
        debit: Math.abs(amount),
        credit: 0,
      },
      {
        account_code: "103000",
        debit: 0,
        credit: Math.abs(amount),
      },
    ];
    this.addJournalEntry(
      `تسوية جرد مخزني - هدر وخسائر - مستند #${docNumber}`,
      lines,
      `ADJ-${docNumber.substring(4)}`,
    );
  }
  postInventoryConsumptionJournal(orderNumber, totalCost, branchId) {
    const lines = [
      {
        account_code: "501000",
        debit: totalCost,
        credit: 0,
      },
      {
        account_code: "103000",
        debit: 0,
        credit: totalCost,
      },
    ];
    this.addJournalEntry(
      `قيد استهلاك بوم المطبخ (Recipe Consumption) - طلب #${orderNumber}`,
      lines,
      `CON-${orderNumber}`,
    );
  }
  createPurchaseOrder(
    supplierId: string,
    items: any[],
    notes?: string,
    currency: "USD" | "SSP" | string = "USD",
    exchange_rate: number = 1,
  ) {
    let subtotal = 0;
    items.forEach((i) => {
      subtotal += i.quantity * i.unit_cost;
    });
    const tax = subtotal * 0.14;
    const total = subtotal + tax;
    const rate = Number(exchange_rate) || 1;
    const total_base_usd = currency === "USD" ? total : rate > 1 ? total / rate : total * rate;

    const po: PurchaseOrder = {
      id: "po-" + Date.now(),
      branch_id: this.state.currentBranchId,
      supplier_id: supplierId,
      order_date: /* @__PURE__ */ new Date().toISOString().split("T")[0],
      status: "draft",
      items,
      subtotal,
      tax,
      total,
      currency: currency || "USD",
      exchange_rate: rate,
      total_base_usd,
      notes,
    };
    this.state.purchaseOrders.unshift(po);
    this.saveState();
    this.logAction(
      "ADMIN",
      "إنشاء أمر شراء",
      `تم عمل مسودة أمر شراء بمجموع ${total.toLocaleString()} ${po.currency} للمورد`,
      "CREATE",
    );
    this.notify();
    return po;
  }
  receivePurchaseOrder(poId: string, treasuryId?: string) {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === "received") return;
    po.status = "received";
    po.received_date = new Date().toISOString().split("T")[0];

    const supplier = this.state.suppliers.find((s) => s.id === po.supplier_id);
    const supAccCode = supplier?.account_code || "201000";
    const currency = po.currency || "USD";
    const rate = Number(po.exchange_rate) || 1;

    const treasury =
      this.state.treasuries.find((t) => t.id === treasuryId) || this.state.treasuries[0];
    if (treasury) {
      this.addTreasuryTransaction(
        treasury.id,
        "purchase",
        po.total,
        currency,
        `شراء بضاعة - أمر شراء #${po.id.substring(3, 8)} (${supplier?.name_ar || ""})`,
        po.id,
      );
    }
    this.updateSupplierBalance(po.supplier_id, po.total);
    this.postPurchaseInvoiceJournal(
      po.id,
      po.supplier_id,
      po.total,
      this.state.currentBranchId,
      currency,
      rate,
      supAccCode,
    );
    this.logAction(
      "ADMIN",
      "استلام أمر شراء ودفع القيمة",
      `تم تسليم الطلبية #${poId.substring(3, 8)} وإجراء القيد المحاسبي على حساب المورد (${supAccCode}) بمبلغ ${po.total.toLocaleString()} ${currency}`,
      "TRANSACTION",
    );
    this.saveState();
    this.notify();
  }
  receivePurchaseOrderPartial(poId, receivedItems, treasuryId) {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error("أمر الشراء غير موجود");
    let newlyReceivedTotal = 0;
    let isFullyReceived = true;
    po.items = po.items.map((item) => {
      const match = receivedItems.find((r) => r.inventory_id === item.inventory_id);
      const currentReceived = item.received_quantity || 0;
      const newlyReceived = match ? match.received_quantity : 0;
      const updatedReceived = currentReceived + newlyReceived;
      if (updatedReceived < item.quantity) isFullyReceived = false;
      newlyReceivedTotal += newlyReceived * item.unit_cost;
      return {
        ...item,
        received_quantity: updatedReceived,
      };
    });
    const newlyReceivedTax = newlyReceivedTotal * 0.14;
    const grandReceivedTotal = newlyReceivedTotal + newlyReceivedTax;
    if (isFullyReceived) po.status = "received";
    const treasury = this.state.treasuries.find((t) => t.id === treasuryId);
    if (treasury && grandReceivedTotal > 0)
      this.addTreasuryTransaction(
        treasuryId,
        "purchase",
        grandReceivedTotal,
        treasury.currency,
        `استلام جزئي/كامل بضائع - أمر شراء #${po.id.substring(3, 8)}`,
        po.id,
      );
    this.updateSupplierBalance(po.supplier_id, grandReceivedTotal);
    if (grandReceivedTotal > 0)
      this.postPurchaseInvoiceJournal(
        po.id,
        po.supplier_id,
        grandReceivedTotal,
        this.state.currentBranchId,
      );
    this.logAction(
      "ADMIN",
      "استلام بضائع أمر شراء",
      `تم استلام بضائع من الأمر #${po.id.substring(3, 8)} بقيمة ${grandReceivedTotal.toFixed(2)} ج.م (مكتمل: ${isFullyReceived ? "نعم" : "لا"})`,
      "TRANSACTION",
    );
    this.saveState();
    return {
      receivedTotal: grandReceivedTotal,
      isFullyReceived,
    };
  }
  returnPurchaseOrderItems(poId, returnedItems) {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error("أمر الشراء غير موجود");
    let returnedTotal = 0;
    po.items = po.items.map((item) => {
      const match = returnedItems.find((r) => r.inventory_id === item.inventory_id);
      const currentReturned = item.returned_quantity || 0;
      const newlyReturned = match ? match.returned_quantity : 0;
      const updatedReturned = currentReturned + newlyReturned;
      returnedTotal += newlyReturned * item.unit_cost;
      return {
        ...item,
        returned_quantity: updatedReturned,
      };
    });
    const returnedTax = returnedTotal * 0.14;
    const grandReturnedTotal = returnedTotal + returnedTax;
    po.status = "returned";
    this.updateSupplierBalance(po.supplier_id, -grandReturnedTotal);
    this.postPurchaseReturnJournal(po.id, grandReturnedTotal, this.state.currentBranchId);
    this.logAction(
      "ADMIN",
      "إرجاع بضائع للمورد",
      `تم إرجاع مرتجعات من الأمر #${po.id.substring(3, 8)} بقيمة ${grandReturnedTotal.toFixed(2)} ج.م خصماً من حساب المورد`,
      "TRANSACTION",
    );
    this.saveState();
    return grandReturnedTotal;
  }
  cancelPurchaseOrder(poId) {
    const po = this.state.purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === "cancelled") return false;
    const oldStatus = po.status;
    po.status = "cancelled";
    if (oldStatus === "received") {
      const tx = this.state.treasuryTransactions.find(
        (t) => t.related_entity_id === poId && t.type === "purchase",
      );
      if (tx) {
        const treasury = this.state.treasuries.find((t) => t.id === tx.treasury_id);
        if (treasury) {
          treasury.balance += tx.amount;
          treasury.available_balance = treasury.balance;
          this.logAction(
            "SYSTEM",
            "عكس حركة الخزينة",
            `استرجاع مبلغ ${tx.amount} ج.م إلى خزينة ${treasury.name_ar}`,
            "TRANSACTION",
          );
        }
      }
      this.updateSupplierBalance(po.supplier_id, -po.total);
      const lines = [
        {
          account_code: "103000",
          debit: 0,
          credit: po.total,
        },
        {
          account_code: "201000",
          debit: po.total,
          credit: 0,
        },
      ];
      this.addJournalEntry(
        `إلغاء وعكس قيد أمر شراء #${poId.substring(3, 8)}`,
        lines,
        `REV-${poId.substring(3, 8).toUpperCase()}`,
      );
    }
    this.saveState();
    this.logAction(
      "ADMIN",
      "إلغاء أمر الشراء",
      `تم إلغاء أمر الشراء #${poId.substring(3, 8)} بالكامل وتصفية القيود المرتبطة`,
      "TRANSACTION",
    );
    return true;
  }
  createVoucher(
    type,
    category,
    amount,
    treasuryId,
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
