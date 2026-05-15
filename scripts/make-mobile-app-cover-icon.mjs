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
const dataUrl = `data:image/webp;base64,${bytes.toString('base64')}`;

await fs.mkdir(outDir, { recursive: true });
await fs.copyFile(source, path.join(outDir, 'app-cover-source.webp'));

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
        background:
          linear-gradient(135deg, rgba(255,255,255,.18), rgba(29,70,93,.18)),
          url('${dataUrl}');
        background-size: cover;
        background-position: 52% 36%;
      "></div>
      <div id="adaptive" style="
        width:1024px;
        height:1024px;
        background:
          radial-gradient(circle at 68% 20%, rgba(255,255,255,.36), transparent 23%),
          linear-gradient(135deg, #f8edd7, #183f52);
        display:grid;
        place-items:center;
      ">
        <div style="
          width:820px;
          height:820px;
          border-radius:230px;
          overflow:hidden;
          background:url('${dataUrl}') center 36% / cover no-repeat;
          box-shadow: 0 0 0 24px #f8f0dc, 0 32px 80px rgba(10,36,52,.28);
        "></div>
      </div>
      <div id="favicon" style="
        width:196px;
        height:196px;
        border-radius:48px;
        overflow:hidden;
        background:url('${dataUrl}') 52% 36% / cover no-repeat;
      "></div>
    </body>
  </html>
`);

await page.locator('#icon').screenshot({ path: path.join(outDir, 'icon.png'), omitBackground: false });
await page.locator('#adaptive').screenshot({ path: path.join(outDir, 'adaptive-icon.png'), omitBackground: false });
await page.locator('#favicon').screenshot({ path: path.join(outDir, 'favicon.png'), omitBackground: false });

await browser.close();
