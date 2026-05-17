import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const manifestPath = join(root, 'mobile-export', 'android-local-backup', 'app', 'src', 'main', 'AndroidManifest.xml');
const appPath = join(root, 'mobile-export', 'App.js');
const webAppPath = join(root, 'src', 'App.tsx');

const manifest = readFileSync(manifestPath, 'utf8');
const app = readFileSync(appPath, 'utf8');
const webApp = readFileSync(webAppPath, 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  manifest.includes('android:scheme="smallphone"'),
  'AndroidManifest.xml must declare the smallphone:// callback scheme.',
);

assert(
  manifest.includes('android.intent.category.BROWSABLE'),
  'AndroidManifest.xml must make the callback scheme browsable.',
);

assert(
  /\^https:\\\/\\\/\(discord\\\.gg\|discord\\\.com\)\\\//.test(app) && /openExternalUrl\(url\);[\s\S]*?return false;/.test(app),
  'App.js must open Discord links externally and stop WebView from keeping the login page inside the app.',
);

assert(
  webApp.includes("postMessage(JSON.stringify({ type: 'open-url'"),
  'src/App.tsx must route native Discord login through the open-url bridge.',
);

console.log('mobile export login regression checks passed');
