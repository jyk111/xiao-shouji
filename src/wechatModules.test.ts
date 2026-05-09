import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const expectedModules = [
  'src/wechat/chats/WeChatChats.tsx',
  'src/wechat/contacts/WeChatContacts.tsx',
  'src/wechat/discover/WeChatDiscover.tsx',
  'src/wechat/me/WeChatMe.tsx',
];

for (const modulePath of expectedModules) {
  assert.equal(existsSync(join(root, modulePath)), true, `${modulePath} should exist`);
}
