import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

content = content.replace(
  `    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (!tr) return;

    const isIncoming = type === "deposit" || type === "sales" || type === "transfer_in";
    const balanceChange = isIncoming ? amount : -amount;

    tr.balance += balanceChange;
    tr.available_balance = tr.balance;`,
  `    const tr = this.state.treasuries.find((t) => t.id === treasuryId);
    if (!tr) return;

    const isIncoming = type === "deposit" || type === "sales" || type === "transfer_in";
    const balanceChange = isIncoming ? amount : -amount;

    tr.balance += balanceChange;
    tr.available_balance = tr.balance;
    
    if (containerId && tr.containers) {
      const container = tr.containers.find(c => c.id === containerId);
      if (container) {
        if (typeof container.balance !== 'number') container.balance = 0;
        container.balance += balanceChange;
      }
    }`,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
