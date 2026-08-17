import fs from "fs";
let content = fs.readFileSync("src/routes/cashier-treasury.tsx", "utf8");

const replacement = `
    let cashEGP = opBal;
    let cashUSD = 0;
    let cashSSP = 0;
    let cardUSD = 0;
    let walletSSP = 0;
    let cardEGP = 0;
    let walletEGP = 0;
    let cardSSP = 0;
    let walletUSD = 0;

    const txs = erpState.treasuryTransactions.filter((tx) => tx.treasury_id === cashierTreasury.id);
    txs.forEach((tx) => {
      const isIncoming = tx.type === "deposit" || tx.type === "sales" || tx.type === "transfer_in";
      const amt = isIncoming ? tx.amount : -tx.amount;
      const pm = tx.payment_method || "cash";
      const curr = tx.currency || "EGP";

      // Strict assignment to prevent mixing
      if (curr === "EGP" && pm === "cash") cashEGP += amt;
      else if (curr === "EGP" && pm === "card") cardEGP += amt;
      else if (curr === "EGP" && pm === "wallet") walletEGP += amt;

      else if (curr === "USD" && pm === "cash") cashUSD += amt;
      else if (curr === "USD" && pm === "card") cardUSD += amt;
      else if (curr === "USD" && pm === "wallet") walletUSD += amt;

      else if (curr === "SSP" && pm === "cash") cashSSP += amt;
      else if (curr === "SSP" && pm === "card") cardSSP += amt;
      else if (curr === "SSP" && pm === "wallet") walletSSP += amt;
    });
    return { cashEGP, cashUSD, cashSSP, cardUSD, walletSSP, cardEGP, walletEGP, cardSSP, walletUSD };`;

content = content.replace(
  / {4}let cashEGP = opBal;[\s\S]*?return \{ cashEGP, cashUSD, cashSSP, cardUSD, walletSSP \};/,
  replacement,
);

fs.writeFileSync("src/routes/cashier-treasury.tsx", content);
