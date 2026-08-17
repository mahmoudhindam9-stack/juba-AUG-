import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

const replacement = `
    const beforeBal = tr.balance;

    if (type === "deposit" || type === "sales" || type === "transfer_in") {
      tr.balance += amount;
      tr.available_balance = tr.balance;
      if (containerId && tr.containers) {
        const cnt = tr.containers.find(c => c.id === containerId);
        if (cnt) cnt.balance += amount;
      }
    } else {
      tr.balance -= amount;
      tr.available_balance = tr.balance;
      if (containerId && tr.containers) {
        const cnt = tr.containers.find(c => c.id === containerId);
        if (cnt) cnt.balance -= amount;
      }
    }
`;

content = content.replace(
  /const beforeBal = tr\.balance;\s*if \(type === "deposit" \|\| type === "sales" \|\| type === "transfer_in"\) \{\s*tr\.balance \+= amount;\s*tr\.available_balance = tr\.balance;\s*\} else \{\s*tr\.balance -= amount;\s*tr\.available_balance = tr\.balance;\s*\}/g,
  replacement,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
