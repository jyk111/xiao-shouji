const fs = require('fs');
const path = require('path');
const input = path.join(__dirname, 'web.html');
const output = path.join(__dirname, 'web-content.js');
const html = fs.readFileSync(input, 'utf8');
fs.writeFileSync(output, `export const WEB_HTML = ${JSON.stringify(html)};\n`, 'utf8');
console.log(`Wrote ${output}`);
