const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let code = fs.readFileSync(path, 'utf8');
const start = code.indexOf('      if (journalSortOrder === "oldest") {');
const endNeedle = '      return dateA - dateB;';
const end = code.indexOf(endNeedle, start);
if (start < 0 || end < 0) throw new Error('Journal sort section not found');
const replacement = `      const yearA = Number(String(a.date || "").slice(0, 4)) || 0;
      const yearB = Number(String(b.date || "").slice(0, 4)) || 0;
      if (journalSortOrder === "oldest") {
        if (yearA !== yearB) return yearA - yearB;
        if (refA !== refB) return refA - refB;
        if (seqA !== seqB) return seqA - seqB;
        if (dateA !== dateB) return dateA - dateB;
        return a.id.localeCompare(b.id);
      } else if (journalSortOrder === "newest") {
        if (yearA !== yearB) return yearB - yearA;
        if (refA !== refB) return refB - refA;
        if (seqA !== seqB) return seqB - seqA;
        if (dateA !== dateB) return dateB - dateA;
        return b.id.localeCompare(a.id);
      } else if (journalSortOrder === "ref_asc") {
        if (yearA !== yearB) return yearA - yearB;
        if (refA !== refB) return refA - refB;
        if (seqA !== seqB) return seqA - seqB;
        return dateA - dateB;
      } else if (journalSortOrder === "ref_desc") {
        if (yearA !== yearB) return yearB - yearA;
        if (refA !== refB) return refB - refA;
        if (seqA !== seqB) return seqB - seqA;
        return dateB - dateA;
      }
      return dateA - dateB;`;
code = code.slice(0, start) + replacement + code.slice(end + endNeedle.length);
fs.writeFileSync(path, code, 'utf8');
console.log('Robust journal display ordering patch applied.');
