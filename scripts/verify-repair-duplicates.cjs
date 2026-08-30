const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

const paths = [
  'src/components/TableOrderModal.tsx',
  'src/routes/captain.tsx',
  'src/routes/menu.tsx',
  'src/routes/cashier-treasury.tsx',
];

let failed = false;

for (const path of paths) {
  const text = readFileSync(path, 'utf8');
  const selectedAdditions = (text.match(/selectedAdditions\s*:/g) || []).length;
  if (path.endsWith('TableOrderModal.tsx') && selectedAdditions > 4) {
    console.error(`FAIL: ${path} contains ${selectedAdditions} selectedAdditions properties; expected no duplicate repair inserts.`);
    failed = true;
  }

  const repairMarkers = (text.match(/auto-(?:restaurant|pos|crosspage)-fix|repair-restaurant|fix-restaurant-cross-page-flow/g) || []).length;
  if (repairMarkers > 0 && path.endsWith('TableOrderModal.tsx')) {
    console.error(`FAIL: ${path} contains repair workflow markers in application source.`);
    failed = true;
  }
}

const workflowFiles = execFileSync('git', ['ls-files', '.github/workflows'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of workflowFiles) {
  const text = readFileSync(file, 'utf8');
  if (/Apply .*repair|git add src\//.test(text) && /github-actions\[bot\]/.test(text)) {
    console.error(`FAIL: one-off source-mutating repair workflow remains: ${file}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('PASS: no duplicate repair inserts or one-off source-mutating repair workflows detected.');
