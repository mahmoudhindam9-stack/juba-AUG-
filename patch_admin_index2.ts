import fs from "fs";
let content = fs.readFileSync("src/routes/admin/index.tsx", "utf8");

// Add linked_to_restaurant to state
content = content.replace(
  "    containers: [] as { id: string; name: string; currency: string; balance: number }[],\n  });",
  "    containers: [] as { id: string; name: string; currency: string; balance: number }[],\n    linked_to_restaurant: false,\n  });",
);

// Update payload in updateTreasury
content = content.replace(
  '        responsible_employee: newTreasuryForm.responsible_employee || "أمين الخزينة",\n        containers: newTreasuryForm.containers,\n      });',
  '        responsible_employee: newTreasuryForm.responsible_employee || "أمين الخزينة",\n        containers: newTreasuryForm.containers,\n        linked_to_restaurant: newTreasuryForm.linked_to_restaurant,\n      });',
);

// Add parameters to addTreasury call
content = content.replace(
  '        newTreasuryForm.responsible_employee || "أمين الخزينة",\n        newTreasuryForm.containers,\n      );\n    }',
  '        newTreasuryForm.responsible_employee || "أمين الخزينة",\n        newTreasuryForm.containers,\n        newTreasuryForm.linked_to_restaurant\n      );\n    }',
);

// Reset state in handleAddTreasury
content = content.replace(
  "      containers: [],\n    });\n    setEditingTreasuryId(null);",
  "      containers: [],\n      linked_to_restaurant: false,\n    });\n    setEditingTreasuryId(null);",
);

// Populate state in handleEditTreasury
content = content.replace(
  "      containers: tr.containers || [],\n    });\n    // Scroll to form",
  "      containers: tr.containers || [],\n      linked_to_restaurant: !!tr.linked_to_restaurant,\n    });\n    // Scroll to form",
);

fs.writeFileSync("src/routes/admin/index.tsx", content);
