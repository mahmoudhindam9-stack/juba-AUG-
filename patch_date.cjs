const fs = require('fs');
const path = 'src/routes/admin/ledger.tsx';
let content = fs.readFileSync(path, 'utf8');

const newFunc = `
          function excelDateToJSDate(serial) {
            try {
              if (!serial) return new Date().toISOString();
              let date_info;
              if (typeof serial === 'string') {
                date_info = new Date(serial);
                if (isNaN(date_info.getTime())) {
                   const parts = serial.split(/[-/]/);
                   if (parts.length === 3) {
                     // assume DD/MM/YYYY or similar if invalid
                     // We will just try YYYY-MM-DD from the parts just in case
                     if (parts[2].length === 4) {
                       date_info = new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}\`);
                     } else {
                       date_info = new Date(\`\${parts[0]}-\${parts[1]}-\${parts[2]}\`);
                     }
                   }
                }
              } else if (typeof serial === 'number') {
                const utc_days  = Math.floor(serial - 25569);
                const utc_value = Math.floor(utc_days * 86400);
                date_info = new Date(utc_value * 1000);
              }
              if (!date_info || isNaN(date_info.getTime())) {
                return new Date().toISOString();
              }
              return date_info.toISOString();
            } catch (e) {
              return new Date().toISOString();
            }
          }
`;

content = content.replace(/function excelDateToJSDate\(serial\) \{[\s\S]*?return date_info\.toISOString\(\);\s*\}/, newFunc.trim());

fs.writeFileSync(path, content, 'utf8');
