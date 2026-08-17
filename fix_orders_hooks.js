import fs from "fs";
let content = fs.readFileSync("src/routes/admin/orders.tsx", "utf8");

const earlyReturnBlock = `  if (userPermissions && !userPermissions.orders) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 className="text-xl font-black text-foreground">صلاحية غير متوفرة</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          عفواً، حسابك لا يملك صلاحية استعراض وإدارة شاشة الطلبات والمبيعات. يرجى مراجعة المدير
          العام لتعديل جدول الصلاحيات الخاص بك.
        </p>
      </div>
    );
  }`;

// Remove the block from its current position
content = content.replace(earlyReturnBlock, "");

// Fix the permissions lookup
content = content.replace(
  "const userPermissions = erpState.userPermissions[currentUserEmail];",
  `const activeUser = erpState.users.find((u) => u.username === currentUserEmail);
  const userRole = activeUser ? activeUser.role : "admin";
  const userPermissions = erpState.userPermissions[userRole];`,
);

// Append the early return just before the main return
content = content.replace(
  '  return (\n    <div className="space-y-6 text-right"',
  earlyReturnBlock + '\n\n  return (\n    <div className="space-y-6 text-right"',
);

fs.writeFileSync("src/routes/admin/orders.tsx", content);
