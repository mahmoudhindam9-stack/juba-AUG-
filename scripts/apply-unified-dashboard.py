from pathlib import Path
import re

root = Path('.')
index = root / 'src/routes/admin/index.tsx'
audit = root / 'src/components/admin/AuditOperationsModal.tsx'
s = index.read_text(encoding='utf-8')

# Import the new unified overview exactly once.
if 'UnifiedFinancialOverview' not in s:
    anchor = 'import { AuditOperationsModal } from "@/components/admin/AuditOperationsModal";\n'
    if anchor not in s:
        raise SystemExit('dashboard import anchor not found')
    s = s.replace(anchor, anchor + 'import { UnifiedFinancialOverview } from "@/components/admin/UnifiedFinancialOverview";\n', 1)

# Ensure bank/CIB data never participates in the homepage treasury collection.
branch_old = '  const branchTreasuries = useMemo(() => {\n    return erpState.treasuries.filter((t) => t.branch_id === currentBranch.id && !t.deleted);\n  }, [erpState.treasuries, currentBranch.id]);'
branch_new = '''  const branchTreasuries = useMemo(() => {
    return erpState.treasuries.filter((t) => {
      if (t.branch_id !== currentBranch.id || t.deleted) return false;
      const account = (erpState.accounts || []).find((a) =>
        (t.account_code && a.code === t.account_code) || a.system_binding === `treasury_${t.id}`,
      );
      const label = `${t.name_ar || ""} ${t.account_code || ""} ${account?.name_ar || ""}`.toLocaleLowerCase("ar-EG");
      return !t.system_binding?.includes("treasury_cib") && !/cib|سيب|البنك الرئيسي/.test(label);
    });
  }, [erpState.treasuries, erpState.accounts, currentBranch.id]);'''
if branch_old in s:
    s = s.replace(branch_old, branch_new, 1)

# Make the headline cash/bank aggregates account-ledger based, excluding CIB.
cash_old = re.search(r'  const totalCashBalance = useMemo\(\(\) => \{.*?\n  \}, \[erpState\.treasuries, currentBranch\.id, erpState\.exchangeRates\]\);', s, re.S)
if cash_old:
    replacement = '''  const totalCashBalance = useMemo(() => {
    return branchTreasuries
      .filter((t) => t.type === "cash")
      .reduce((sum, t) => {
        const account = (erpState.accounts || []).find((a) =>
          (t.account_code && a.code === t.account_code) || a.system_binding === `treasury_${t.id}`,
        );
        return sum + Number(account?.balance ?? t.balance ?? 0);
      }, 0);
  }, [branchTreasuries, erpState.accounts]);'''
    s = s[:cash_old.start()] + replacement + s[cash_old.end():]

bank_old = re.search(r'  const totalBankBalance = useMemo\(\(\) => \{.*?\n  \}, \[erpState\.treasuries, currentBranch\.id, erpState\.exchangeRates\]\);', s, re.S)
if bank_old:
    replacement = '''  const totalBankBalance = useMemo(() => {
    return branchTreasuries
      .filter((t) => t.type === "bank")
      .reduce((sum, t) => {
        const account = (erpState.accounts || []).find((a) =>
          (t.account_code && a.code === t.account_code) || a.system_binding === `treasury_${t.id}`,
        );
        return sum + Number(account?.balance ?? t.balance ?? 0);
      }, 0);
  }, [branchTreasuries, erpState.accounts]);'''
    s = s[:bank_old.start()] + replacement + s[bank_old.end():]

# Insert the unified overview immediately before the first major dashboard tabs block.
if '<UnifiedFinancialOverview' not in s:
    marker = '\n      <Tabs '
    pos = s.find(marker)
    if pos == -1:
        marker = '\n      <Tabs'
        pos = s.find(marker)
    if pos == -1:
        raise SystemExit('dashboard Tabs insertion point not found')
    component = '''
      <UnifiedFinancialOverview
        erpState={erpState}
        currentBranch={currentBranch}
        onOpenOperations={() => setIsAuditOperationsOpen(true)}
      />
'''
    s = s[:pos] + '\n' + component + s[pos:]

# If the old homepage contains a literal CIB card, remove only the surrounding Card block.
def remove_card_containing(text: str):
    global s
    target = s.find(text)
    if target == -1:
        return False
    start = s.rfind('<Card', 0, target)
    if start == -1:
        return False
    pos = start
    depth = 0
    while True:
        next_open = s.find('<Card', pos)
        next_close = s.find('</Card>', pos)
        if next_close == -1:
            return False
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + len('<Card')
        else:
            depth -= 1
            pos = next_close + len('</Card>')
            if depth == 0:
                break
    s = s[:start] + s[pos:]
    return True

for marker in ['البنك الرئيسي (CIB)', 'CIB']:
    if remove_card_containing(marker):
        break

index.write_text(s, encoding='utf-8')

# Make audit search token-based (each search word must exist), improving smart Arabic matching.
a = audit.read_text(encoding='utf-8')
old = '    const q = normalize(search);\n    return prepared\n      .filter((log) => severity === "all" || normalize(log.severity || "info") === severity)\n      .filter((log) => !q || log._search.includes(q))'
new = '''    const tokens = normalize(search).split(/\\s+/).filter(Boolean);
    return prepared
      .filter((log) => severity === "all" || normalize(log.severity || "info") === severity)
      .filter((log) => tokens.length === 0 || tokens.every((token) => log._search.includes(token)))'''
if old in a:
    a = a.replace(old, new, 1)
else:
    print('audit search block already updated or not found')
audit.write_text(a, encoding='utf-8')

# Emit quick verification facts for workflow logs.
print('unified overview inserted:', '<UnifiedFinancialOverview' in s)
print('CIB still present in dashboard source:', bool(re.search(r'(?i)CIB|البنك الرئيسي', s)))
print('audit token search enabled:', 'tokens.every' in a)
