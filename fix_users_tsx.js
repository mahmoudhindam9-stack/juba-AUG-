import fs from "fs";
let content = fs.readFileSync("src/routes/admin/users.tsx", "utf8");

content = content.replace(
  `هل أنت متأكد من حفظ التعديلات الجديدة على صلاحيات المستخدم ({roleLabels[selectedRole] ?? selectedRole})؟ سيتم
              تطبيق هذه الصلاحيات فوراً وقد تؤثر على وصول المستخدم.`,
  `هل أنت متأكد من حفظ التعديلات الجديدة على صلاحيات المستخدم ({roleLabels[selectedRole] ?? selectedRole})؟ سيتم تطبيق هذه الصلاحيات فوراً وقد تؤثر على وصول المستخدم.`,
);

fs.writeFileSync("src/routes/admin/users.tsx", content);
