const fs = require('fs');
let code = fs.readFileSync('src/shared/types/index.ts', 'utf-8');

if (!code.includes('MenuItemAddition')) {
    const additionType = `export interface MenuItemAddition {
  name_ar: string;
  icon?: string;
  price?: number;
}\n\n`;

    code = code.replace('export interface MenuItemIngredient', additionType + 'export interface MenuItemIngredient');
}

if (!code.includes('additions?: MenuItemAddition[]')) {
    code = code.replace('badge?: string | null;', 'badge?: string | null;\n  additions?: MenuItemAddition[];');
}

if (!code.includes('notes?: string;')) {
    code = code.replace('quantity: number;\n}', 'quantity: number;\n  notes?: string;\n  selectedAdditions?: MenuItemAddition[];\n}');
}

if (code.includes('export interface CartLine {') && !code.includes('selectedAdditions?: MenuItemAddition[];', code.indexOf('export interface CartLine {'))) {
    code = code.replace('quantity: number;\n}', 'quantity: number;\n  notes?: string;\n  selectedAdditions?: MenuItemAddition[];\n}');
}

fs.writeFileSync('src/shared/types/index.ts', code);
console.log("Updated types");
