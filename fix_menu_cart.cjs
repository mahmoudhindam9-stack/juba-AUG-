const fs = require('fs');
let code = fs.readFileSync('src/routes/menu.tsx', 'utf-8');

// We need to add state for customizing an item
const addStateStr = `  const [isCartOpen, setIsCartOpen] = useState(false);`;
const stateInjection = `
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customNotes, setCustomNotes] = useState("");
  const [selectedAdditions, setSelectedAdditions] = useState<any[]>([]);
`;
code = code.replace(addStateStr, addStateStr + '\n' + stateInjection);

// Replace addToCart
const addToCartTarget = `  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) => (p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { item, quantity: 1 }];
    });
    toast({
      title: "تم الإضافة",
      description: \`تم إضافة \${item.name_ar} إلى الطلب\`,
    });
  };`;

const newAddToCart = `
  const handleItemClick = (item: MenuItem) => {
    setCustomizingItem(item);
    setCustomNotes("");
    setSelectedAdditions([]);
  };

  const confirmAddToCart = () => {
    if (!customizingItem) return;
    
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (p) =>
          p.item.id === customizingItem.id &&
          p.notes === customNotes &&
          JSON.stringify(p.selectedAdditions) === JSON.stringify(selectedAdditions)
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { item: customizingItem, quantity: 1, notes: customNotes, selectedAdditions: selectedAdditions }];
    });
    
    toast({
      title: "تم الإضافة",
      description: \`تم إضافة \${customizingItem.name_ar} إلى الطلب\`,
    });
    setCustomizingItem(null);
  };
`;
code = code.replace(addToCartTarget, newAddToCart);

// replace updateQuantity
const updateQuantityTarget = `  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.item.id === itemId) {
          const newQ = p.quantity + delta;
          return newQ > 0 ? { ...p, quantity: newQ } : p;
        }
        return p;
      }),
    );
  };`;
const newUpdateQuantity = `  const updateQuantity = (cartIndex: number, delta: number) => {
    setCart((prev) =>
      prev.map((p, i) => {
        if (i === cartIndex) {
          const newQ = p.quantity + delta;
          return newQ > 0 ? { ...p, quantity: newQ } : p;
        }
        return p;
      }),
    );
  };
  
  const removeFromCart = (cartIndex: number) => {
    setCart((prev) => prev.filter((_, i) => i !== cartIndex));
  };
`;
code = code.replace(updateQuantityTarget, newUpdateQuantity);
code = code.replace(/  const removeFromCart = \(itemId: string\) => \{\n    setCart\(\(prev\) => prev\.filter\(\(p\) => p\.item\.id !== itemId\)\);\n  \};\n/, '');

// total amount calculation needs to include addition prices
const totalAmountTarget = `  const totalAmount = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);`;
const newTotalAmount = `  const totalAmount = cart.reduce((sum, c) => {
    const itemTotal = c.item.price + (c.selectedAdditions?.reduce((s, a) => s + (a.price || 0), 0) || 0);
    return sum + itemTotal * c.quantity;
  }, 0);`;
code = code.replace(totalAmountTarget, newTotalAmount);

// replace onClick={() => addToCart(item)}
code = code.replace(/onClick=\{\(\) => addToCart\(item\)\}/g, 'onClick={() => handleItemClick(item)}');

fs.writeFileSync('src/routes/menu.tsx', code);
console.log("Updated menu.tsx cart logic");
