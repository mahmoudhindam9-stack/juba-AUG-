const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let code = fs.readFileSync(path, 'utf8');
const oldBlock = `      if (journalSortOrder === "oldest") {
        if (dateA !== dateB) return dateA - dateB;
        if (refA !== refB) return refA - refB;
        if (seqA !== seqB) return seqA - seqB;
        return a.id.localeCompare(b.id);
      } else if (journalSortOrder === "newest") {
        if (dateA !== dateB) return dateB - dateA;
        if (refA !== refB) return refB - refA;
        if (seqA !== seqB) return seqB - seqA;
        return b.id.localeCompare(a.id);
      } else if (journalSortOrder === "ref_asc") {
        if (refA !== refB) return refA - refB;
        if (dateA !== dateB) return dateA - dateB;
        return seqA - seqB;
      } else if (journalSortOrder === "ref_desc") {
        if (refA !== refB) return refB - refA;
        if (dateA !== dateB) return dateB - dateA;
        return seqB - seqA;
      }`;
const newBlock = `      const yearA = Number(String(a.date || "").slice(0, 4)) || 0;
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
      }`;
if (!code.includes(oldBlock)) throw new Error('Journal sort comparator block not found');
code = code.replace(oldBlock, newBlock);
fs.writeFileSync(path, code, 'utf8');
console.log('Journal display ordering patched.');
