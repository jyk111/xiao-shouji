import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const sourcePath = process.argv[2];
const outDir = process.argv[3] || path.resolve('mobile-export/assets');

if (!sourcePath) {
  console.error('Usage: node scripts/make-mobile-app-cover-icon.mjs <source-image> [out-dir]');
  process.exit(1);
}

const source = path.resolve(sourcePath);
const bytes = await fs.readFile(source);
const ext = path.extname(source).toLowerCase();
const mimeTypes = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
]);
const mimeType = mimeTypes.get(ext) || 'application/octet-stream';
const dataUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;

await fs.mkdir(outDir, { recursive: true });
await fs.copyFile(source, path.join(outDir, `app-cover-source${ext || '.img'}`));

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
let executablePath;
for (const candidate of chromeCandidates) {
  try {
    await fs.access(candidate);
    executablePath = candidate;
    break;
  } catch {
    // Try the next installed browser path.
  }
}

const browser = await chromium.launch(executablePath ? { executablePath } : undefined);
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });

await page.setContent(`
  <html>
    <body style="margin:0; background:#f8f0dc;">
      <div id="icon" style="
        width:1024px;
        height:1024px;
        background: url('${dataUrl}');
        background-size: cover;
        background-position: center;
      "></div>
      <div id="adaptive" style="
        width:1024px;
        height:1024px;
        background: url('${dataUrl}') center / cover no-repeat;
      "></div>
      <div id="favicon" style="
        width:196px;
        height:196px;
        overflow:hidden;
        background:url('${dataUrl}') center / cover no-repeat;
      "></div>
    </body>
  </html>
`);

await page.locator('#icon').screenshot({ path: path.join(outDir, 'icon.png'), omitBackground: false });
await page.locator('#adaptive').screenshot({ path: path.join(outDir, 'adaptive-icon.png'), omitBackground: false });
await page.locator('#favicon').screenshot({ path: path.join(outDir, 'favicon.png'), omitBackground: false });

await browser.close();
