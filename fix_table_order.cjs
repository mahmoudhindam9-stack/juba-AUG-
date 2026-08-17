const fs = require('fs');
let code = fs.readFileSync('src/shared/services/tableOrdersStore.ts', 'utf-8');

const target = `export interface TableCartLine {
  item: MenuItem;
  quantity: number;
}`;
const replacement = `export interface TableCartLine {
  item: MenuItem;
  quantity: number;
  notes?: string;
  selectedAdditions?: any[];
}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/shared/services/tableOrdersStore.ts', code);
console.log("Updated TableCartLine");
