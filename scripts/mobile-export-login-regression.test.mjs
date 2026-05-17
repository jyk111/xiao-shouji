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
  !/discord\\[^]*return false;/.test(app),
  'App.js must not block Discord https navigation after intercepting it.',
);

assert(
  !webApp.includes("postMessage(JSON.stringify({ type: 'open-url'"),
  'src/App.tsx must not route Discord login through the native open-url bridge.',
);

console.log('mobile export login regression checks passed');
