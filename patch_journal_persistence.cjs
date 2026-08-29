const fs = require('fs');
const path = 'src/shared/services/erpStore.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('from "@/integrations/supabase/client"')) {
  content = content.replace(
    'import { ORACLE_MIGRATION_ACCOUNTS } from "../data/oracleAccounts";\n',
    'import { ORACLE_MIGRATION_ACCOUNTS } from "../data/oracleAccounts";\nimport { supabase } from "@/integrations/supabase/client";\n',
  );
}

if (!content.includes('async persistAllJournalsToDatabase(')) {
  const marker = '  addMallShop(shop) {';
  if (!content.includes(marker)) throw new Error('Could not locate ERPStore insertion marker');
  const method = `  async persistAllJournalsToDatabase() {
    const entries = Array.isArray(this.state.journalEntries) ? this.state.journalEntries : [];
    const normalizedEntries = entries.map((entry) => {
      const rawDate = String(entry.date || '').trim();
      const date = /^\\d{4}-\\d{2}-\\d{2}$/.test(rawDate) ? rawDate : new Date(rawDate).toISOString().split('T')[0];
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
        throw new Error(\`تاريخ القيد غير صالح للحفظ: \\${entry.reference || entry.id}\`);
      }
      return {
        id: String(entry.id),
        branch_id: String(entry.branch_id || this.state.currentBranchId || 'branch-1'),
        date,
        description: String(entry.description || ''),
        reference: entry.reference ? String(entry.reference) : null,
        currency: String(entry.currency || 'USD'),
        created_by: entry.created_by ? String(entry.created_by) : String(this.state.currentUser || 'admin'),
        is_approved: entry.is_approved !== false,
        sequence: Number.isFinite(Number(entry.sequence)) ? Number(entry.sequence) : null,
        attachments: Array.isArray(entry.attachments) ? entry.attachments : [],
        created_at: entry.created_at && !Number.isNaN(new Date(entry.created_at).getTime()) ? new Date(entry.created_at).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    if (normalizedEntries.length === 0) {
      return { savedEntriesCount: 0, savedLinesCount: 0, newAccountsCreated: 0 };
    }

    const { error: entryError } = await supabase
      .from('journal_entries')
      .upsert(normalizedEntries, { onConflict: 'id' });
    if (entryError) throw new Error(\`فشل حفظ القيود في قاعدة البيانات: \\${entryError.message}\`);

    const lines = [];
    for (const entry of normalizedEntries) {
      const source = entries.find((e) => String(e.id) === entry.id);
      (source?.lines || []).forEach((line, index) => {
        const debit = Number(line?.debit || 0);
        const credit = Number(line?.credit || 0);
        const rate = Number(line?.rate || 1);
        if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit < 0 || credit < 0) {
          throw new Error(\`قيمة مدين/دائن غير صالحة في القيد \\${entry.reference || entry.id}\`);
        }
        if (!String(line?.account_code || '').trim()) {
          throw new Error(\`يوجد سطر بدون كود حساب في القيد \\${entry.reference || entry.id}\`);
        }
        lines.push({
          id: String(line.id || \\`\\${entry.id}-line-\\${index + 1}\\`),
          journal_entry_id: entry.id,
          line_no: index + 1,
          account_code: String(line.account_code).trim(),
          debit,
          credit,
          currency: line.currency ? String(line.currency) : null,
          rate: Number.isFinite(rate) && rate > 0 ? rate : 1,
          cost_center: line.cost_center ? String(line.cost_center) : null,
          description: line.description ? String(line.description) : null,
        });
      });
    }

    const entryIds = normalizedEntries.map((e) => e.id);
    const { error: deleteError } = await supabase.from('journal_lines').delete().in('journal_entry_id', entryIds);
    if (deleteError) throw new Error(\`فشل تحديث تفاصيل القيود في قاعدة البيانات: \\${deleteError.message}\`);

    if (lines.length > 0) {
      const { error: lineError } = await supabase.from('journal_lines').insert(lines);
      if (lineError) throw new Error(\`فشل حفظ تفاصيل القيود في قاعدة البيانات: \\${lineError.message}\`);
    }

    return {
      savedEntriesCount: normalizedEntries.length,
      savedLinesCount: lines.length,
      newAccountsCreated: 0,
    };
  }
`;
  content = content.replace(marker, method + marker);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Added durable Supabase journal persistence.');
