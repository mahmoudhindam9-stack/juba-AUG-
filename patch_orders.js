import fs from "fs";
let content = fs.readFileSync("src/routes/admin/orders.tsx", "utf8");

const target = "const queryClient = useQueryClient();";
const replacement = `const queryClient = useQueryClient();
  const erpState = erpStore.getState();
  const currentUserEmail = erpState.currentUser || "admin@restaurant.com";
  const userPermissions = erpState.userPermissions[currentUserEmail];

  if (userPermissions && !userPermissions.orders) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 className="text-xl font-black text-foreground">صلاحية غير متوفرة</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          عفواً، حسابك لا يملك صلاحية استعراض وإدارة شاشة الطلبات والمبيعات. يرجى مراجعة المدير العام لتعديل جدول الصلاحيات الخاص بك.
        </p>
      </div>
    );
  }
`;

content = content.replace(target, replacement);
fs.writeFileSync("src/routes/admin/orders.tsx", content);
