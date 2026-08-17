import fs from "fs";

const path = "src/shared/services/tableOrdersStore.ts";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  `  private loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);`,
  `  private loadState() {
    try {
      if (typeof window === "undefined" || typeof localStorage === "undefined") {
        this.orders = [];
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);`,
);

content = content.replace(
  `  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));`,
  `  private saveState() {
    try {
      if (typeof window === "undefined" || typeof localStorage === "undefined") return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));`,
);

fs.writeFileSync(path, content, "utf8");
