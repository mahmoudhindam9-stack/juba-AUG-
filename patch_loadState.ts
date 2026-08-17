import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

const newLoadState = `
  private loadState(): ERPStoreState {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return this.getDefaultState();
    }
    const raw = localStorage.getItem("erp_store_state");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        
        let treasuries = parsed.treasuries?.map((t: any) => ({
          ...t,
          branch_id: "branch-1",
          name_ar: t.id === "tr-3" ? "خزينة الكاش الإضافية" : t.name_ar,
          available_balance: t.available_balance ?? t.balance,
          responsible_employee: t.responsible_employee ?? "غير محدد",
          status: t.status ?? "active",
          deleted: !!t.deleted,
        })) || DEFAULT_TREASURIES;

        // Migration: Delete Treasury 225
        const t225 = treasuries.find(t => t.name_ar && t.name_ar.includes("225"));
        if (t225) {
          treasuries = treasuries.filter(t => t.id !== t225.id);
          if (parsed.treasuryTransactions) {
            parsed.treasuryTransactions = parsed.treasuryTransactions.filter(tx => tx.treasury_id !== t225.id);
          }
        }

        // Migration: Unlink tr-1 from restaurant
        const tr1 = treasuries.find(t => t.id === "tr-1");
        if (tr1) {
          tr1.linked_to_restaurant = false;
          tr1.name_ar = "كاشير 1";
        }

        // Migration: Ensure Treasury 300 exists and is linked
        let t300 = treasuries.find(t => t.name_ar && t.name_ar.includes("300"));
        if (!t300) {
          t300 = {
            id: "tr-300",
            branch_id: "branch-1",
            name_ar: "300",
            type: "cash",
            currency: "MULTI",
            linked_to_restaurant: true,
            balance: 0,
            is_open: true,
            opening_balance: 0,
            available_balance: 0,
            responsible_employee: "غير محدد",
            status: "active",
            deleted: false,
            containers: [
              { id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
              { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },
              { id: "cnt-card-usd", name: "فيزا دولار", currency: "USD", balance: 0 },
              { id: "cnt-cash-usd", name: "كاش دولار", currency: "USD", balance: 0 },
              { id: "cnt-cash-egp", name: "كاش مصري", currency: "EGP", balance: 0 },
              { id: "cnt-card-egp", name: "فيزا مصري", currency: "EGP", balance: 0 },
              { id: "cnt-wallet-egp", name: "محفظة مصري", currency: "EGP", balance: 0 }
            ]
          };
          treasuries.push(t300);
        } else {
          t300.linked_to_restaurant = true;
          t300.deleted = false;
          if (!t300.containers || t300.containers.length === 0) {
            t300.containers = [
              { id: "cnt-cash-ssp", name: "كاش سوداني", currency: "SSP", balance: 0 },
              { id: "cnt-wallet-ssp", name: "محفظة سوداني", currency: "SSP", balance: 0 },
              { id: "cnt-card-usd", name: "فيزا دولار", currency: "USD", balance: 0 },
              { id: "cnt-cash-usd", name: "كاش دولار", currency: "USD", balance: 0 },
              { id: "cnt-cash-egp", name: "كاش مصري", currency: "EGP", balance: 0 },
              { id: "cnt-card-egp", name: "فيزا مصري", currency: "EGP", balance: 0 },
              { id: "cnt-wallet-egp", name: "محفظة مصري", currency: "EGP", balance: 0 }
            ];
          }
        }

        return {
          branches: DEFAULT_BRANCHES,
          currentBranchId: "branch-1",
          treasuries: treasuries,
          suppliers:
            parsed.suppliers?.map((s: any) => ({
`;

const regex =
  / {2}private loadState\(\): ERPStoreState \{[\s\S]*?parsed\.suppliers\?\.map\(\(s: any\) => \(\{/g;
content = content.replace(regex, newLoadState);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
