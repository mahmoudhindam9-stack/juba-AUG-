import fs from "fs";
const content = fs.readFileSync("src/routes/admin/users.tsx", "utf8");

let newContent = content.replace(
  "const [isConfirmSavePermsOpen, setIsConfirmSavePermsOpen] = useState(false);",
  `const [isConfirmSavePermsOpen, setIsConfirmSavePermsOpen] = useState(false);
  const [isConfirmUpsertOpen, setIsConfirmUpsertOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);`,
);

newContent = newContent.replace(
  '<Button\n              onClick={() => upsert.mutate()}\n              disabled={\n                (!editing && (!form.username || !form.password)) || !form.full_name || upsert.isPending\n              }\n              className="font-bold text-xs h-9"\n            >\n              {editing ? "حفظ التعديلات" : "إضافة مستخدم جديد"}\n            </Button>',
  `<Button\n              onClick={() => setIsConfirmUpsertOpen(true)}\n              disabled={\n                (!editing && (!form.username || !form.password)) || !form.full_name || upsert.isPending\n              }\n              className="font-bold text-xs h-9"\n            >\n              {editing ? "حفظ التعديلات" : "إضافة مستخدم جديد"}\n            </Button>`,
);

newContent = newContent.replace(
  "onClick={() => deleteUser.mutate(u.id)}",
  `onClick={() => {\n                        setUserToDelete(u.id);\n                        setIsConfirmDeleteOpen(true);\n                      }}`,
);

const upsertDialog = `
      {/* Confirmation Dialog for Upsert User */}
      <AlertDialog open={isConfirmUpsertOpen} onOpenChange={setIsConfirmUpsertOpen}>
        <AlertDialogContent className="text-right dir-rtl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="text-primary" size={20} />
              {editing ? "تأكيد تعديل بيانات المستخدم" : "تأكيد إضافة مستخدم جديد"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editing ? "هل أنت متأكد من حفظ التعديلات على هذا الحساب؟" : "هل أنت متأكد من إضافة هذا المستخدم الجديد؟ سيتم منحه الصلاحيات الافتراضية المرتبطة بالدور الوظيفي المختار."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction onClick={() => { upsert.mutate(); setIsConfirmUpsertOpen(false); }} className="bg-primary hover:bg-primary/90">
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Delete User */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent className="text-right dir-rtl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="text-destructive" size={20} />
              تأكيد حذف المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>تراجع</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (userToDelete) { deleteUser.mutate(userToDelete); setIsConfirmDeleteOpen(false); setUserToDelete(null); } }} className="bg-destructive hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
`;

newContent = newContent.replace(
  "      {/* Confirmation Dialog for Saving Permissions */}",
  upsertDialog + "\n      {/* Confirmation Dialog for Saving Permissions */}",
);

fs.writeFileSync("src/routes/admin/users.tsx", newContent);
