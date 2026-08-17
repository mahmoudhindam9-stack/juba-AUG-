import fs from "fs";
let content = fs.readFileSync("src/shared/services/erpStore.ts", "utf8");

const interfaceDef = `export interface SystemUser {
  id: string;
  full_name: string;
  username: string; // Used for login (email or plain text)
  phone: string;
  role: string;
  password?: string;
  created_at: string;
}

export interface UserPermission {`;

content = content.replace("export interface UserPermission {", interfaceDef);

const stateDef = `  currentUser: string;
  users: SystemUser[];`;

content = content.replace("  currentUser: string;", stateDef);

const defaultUsers = `const DEFAULT_USERS: SystemUser[] = [
  { id: "u-admin", full_name: "مدير النظام", username: "admin", phone: "01000000000", role: "admin", created_at: new Date().toISOString() },
  { id: "u-manager", full_name: "مشرف الفرع", username: "manager", phone: "01000000001", role: "manager", created_at: new Date().toISOString() },
  { id: "u-cashier", full_name: "كاشير الصالة", username: "cashier", phone: "01000000002", role: "cashier", created_at: new Date().toISOString() },
];

const DEFAULT_PERMISSIONS`;

content = content.replace("const DEFAULT_PERMISSIONS", defaultUsers);

// In default permissions, let's also update the keys if they are still emails, to match usernames if possible. Actually wait, let's leave it as is and just add 'admin', 'manager', 'cashier'.
const defaultPermsUpdate = `const DEFAULT_PERMISSIONS: Record<string, UserPermission> = {
  "admin": {
    orders: true, pos: true,
    floor: true,
    kitchen: true,
    delivery: true,
    inventory: true,
    hr: true,
    purchasing: true,
    production: true,
    treasury: true,
    accounting: true,
    journal_approval: true,
    expense_approval: true,
    revenue_approval: true,
    reports: true,
    cost_centers: true,
    branch_mgmt: true,
    audit_logs: true,
    users_roles: true,
  },
  "manager": {
    orders: true, pos: true,
    floor: true,
    kitchen: true,
    delivery: true,
    inventory: true,
    hr: true,
    purchasing: true,
    production: true,
    treasury: false,
    accounting: true,
    journal_approval: false,
    expense_approval: true,
    revenue_approval: true,
    reports: true,
    cost_centers: true,
    branch_mgmt: false,
    audit_logs: false,
    users_roles: false,
  },
  "cashier": {
    orders: true, pos: true,
    floor: true,
    kitchen: false,
    delivery: true,
    inventory: false,
    hr: false,
    purchasing: false,
    production: false,
    treasury: false,
    accounting: false,
    journal_approval: false,
    expense_approval: false,
    revenue_approval: false,
    reports: false,
    cost_centers: false,
    branch_mgmt: false,
    audit_logs: false,
    users_roles: false,
  },
  "admin@restaurant.com": {`;
content = content.replace(
  'const DEFAULT_PERMISSIONS: Record<string, UserPermission> = {\n  "admin@restaurant.com": {',
  defaultPermsUpdate,
);

content = content.replace(
  'currentUser: parsed.currentUser || "admin@restaurant.com",',
  'currentUser: parsed.currentUser || "admin",\n          users: parsed.users || DEFAULT_USERS,',
);
content = content.replace(
  'currentUser: "admin@restaurant.com",',
  'currentUser: "admin",\n      users: DEFAULT_USERS,',
);

content = content.replace(
  "// Permissions & Current User management",
  `// Permissions & Current User management
  getUsers() { return this.state.users || []; }
  upsertUser(user: SystemUser) {
    if (!this.state.users) this.state.users = [];
    const idx = this.state.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = user;
    } else {
      this.state.users.push(user);
    }
    this.saveState();
  }
  deleteUser(id: string) {
    if (!this.state.users) return;
    this.state.users = this.state.users.filter(u => u.id !== id);
    this.saveState();
  }`,
);

fs.writeFileSync("src/shared/services/erpStore.ts", content);
