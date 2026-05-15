import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = 'http://127.0.0.1:3013/';
const outDir = path.resolve('qa-screenshots/full-phone-acceptance-2026-05-14-v12');
fs.mkdirSync(outDir, { recursive: true });

const themes = ['pastel', 'guofeng', 'gothic', 'celtic-paladin'];
const viewports = [
  { name: 'small-360x740', width: 360, height: 740 },
  { name: 'standard-390x844', width: 390, height: 844 },
  { name: 'large-430x932', width: 430, height: 932 },
];
const page0Apps = ['wechat', 'qq', 'gallery', 'calendar', 'diary', 'memo', 'peek'];
const page1Apps = ['xiaohongshu', 'bilibili', 'theater', 'music', 'browser', 'presets', 'ai-context', 'logs', 'char-active', 'backup'];
const dockApps = ['phone', 'settings', 'contacts', 'themes'];
const allApps = [...page0Apps, ...page1Apps, ...dockApps];
const now = Date.now();

const seedState = (theme) => ({
  state: {
    activeScreen: 'desktop',
    desktopPage: 0,
    theme,
    communityVerificationConfig: {
      communityName: 'discord',
      requiredGroups: ['类脑', '旅程', '世界树'],
      verifiedGroups: ['类脑'],
      discordClientId: '1502353063975981227',
      discordGuildIds: ['1134557553011998840', '1291925535324110879', '1460356383521247265'],
      discordRoleIds: [],
      discordInviteUrls: ['https://discord.gg/odysseia', 'https://discord.gg/NSqeHSK2J', 'https://discord.gg/4GtJfrSNU'],
      authorizationUrl: 'https://discord.com/oauth2/authorize',
      callbackUrl: 'http://127.0.0.1:3013/',
      verificationMethod: 'discord',
      backdoorVerifiedUntil: now + 172800000,
    },
    characters: [{
      id: 'qa-char',
      name: 'QA联动角色',
      avatar: '',
      description: '用于整机验收的角色',
      personality: '稳定、温柔、会配合测试',
      firstMessage: '我在这里。',
      systemPrompt: '你是用于QA的角色。',
    }],
    chatSessions: {
      'wechat:qa-char': {
        id: 'wechat:qa-char',
        characterId: 'qa-char',
        channel: 'wechat',
        lastUpdated: now,
        unread: 1,
        messages: [
          { id: 'qa-m1', role: 'model', kind: 'text', content: 'QA history visible', timestamp: now - 60000 },
          { id: 'qa-m2', role: 'user', kind: 'voice', content: 'QA voice seed', transcript: 'QA voice seed', duration: 4, timestamp: now - 30000 },
        ],
      },
    },
    galleryPhotos: [{
      id: 'qa-photo-1',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="%23d2eadf"/><text x="40" y="190" font-size="48" fill="%23111">QA Gallery Link</text></svg>',
      title: 'QA相册联动照片',
      description: 'AI上下文应该能读取这张照片的说明',
      album: '聊天',
      tags: ['QA标签', '微信'],
      characterId: 'qa-char',
      readableByChar: true,
      source: 'wechat',
      favorite: true,
      hidden: false,
      createdAt: now - 120000,
      updatedAt: now - 120000,
    }],
    memos: [{
      id: 'qa-memo-1',
      title: 'QA备忘联动',
      content: '上下文应该保留这条备忘。',
      type: 'note',
      tags: ['QA'],
      characterId: 'qa-char',
      readableByChar: true,
      createdAt: now - 90000,
      updatedAt: now - 90000,
    }],
    diaries: [{
      id: 'qa-diary-1',
      title: 'QA日记联动',
      content: '上下文应该保留这篇日记。',
      tags: ['QA'],
      source: 'manual',
      createdAt: now - 90000,
      updatedAt: now - 90000,
    }],
    apiKey: '',
    apiBaseUrl: '',
  },
  version: 51,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safeName = (name) => name.replace(/[^a-z0-9-]/gi, '_');

async function seedPage(page, theme) {
  await page.addInitScript((payload) => {
    localStorage.clear();
    localStorage.setItem('char-phone-framework', JSON.stringify(payload));
  }, seedState(theme));
}

async function unlock(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.phone-shell', { timeout: 15000 });
  const gate = await page.locator('.community-gate').count();
  if (gate) throw new Error('Community gate still visible after seeded Discord verification');
  const unlocker = page.locator('.lock-unlock-button');
  if (await unlocker.count()) await unlocker.click();
  await page.waitForSelector('.desktop-screen', { timeout: 8000 });
}

async function setPageByDot(page, pageIndex) {
  const selector = pageIndex === 0 ? 'button[aria-label="第 1 页"]' : 'button[aria-label="第 2 页"]';
  await page.locator(selector).click({ force: true });
  await sleep(180);
}

async function testSwipe(page) {
  await setPageByDot(page, 0);
  const start = await page.locator('.desktop-screen').boundingBox();
  if (!start) return false;
  await page.mouse.move(start.x + start.width - 40, start.y + 260);
  await page.mouse.down();
  await page.mouse.move(start.x + 40, start.y + 260, { steps: 12 });
  await page.mouse.up();
  await sleep(350);
  return await page.locator('button[data-screen="xiaohongshu"]').isVisible().catch(() => false);
}

async function clickTopLeftBack(page) {
  const shellBack = page.locator('.shell-app-back-button');
  if (await shellBack.count()) {
    await shellBack.first().click({ force: true });
    return 'shell-app-back-button';
  }
  const circle = page.locator('.circle-button');
  const count = await circle.count();
  if (count) {
    let best = 0;
    let bestScore = Infinity;
    for (let i = 0; i < count; i += 1) {
      const box = await circle.nth(i).boundingBox();
      if (!box) continue;
      const score = box.x * 1.2 + box.y;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    await circle.nth(best).click({ force: true });
    return 'circle-button';
  }
  return 'missing';
}

async function inspectLayout(page) {
  return await page.evaluate(() => {
    const shell = document.querySelector('.phone-shell');
    const active = document.querySelector('.phone-shell')?.className || '';
    const bodyText = document.body.innerText || '';
    const shellRect = shell?.getBoundingClientRect();
    const input = document.querySelector('.wechat-chat-input');
    const inputRect = input?.getBoundingClientRect();
    const msgList = document.querySelector('.wechat-message-list');
    const msgRect = msgList?.getBoundingClientRect();
    return {
      active,
      hasCrash: /小手机界面崩了|Cannot read properties|ErrorBoundary|NotFoundError|错误/.test(bodyText),
      shellHorizontalOverflow: shell ? shell.scrollWidth > shell.clientWidth + 4 : false,
      bodyHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
      shellTop: shellRect?.top ?? null,
      shellBottom: shellRect?.bottom ?? null,
      visibleHeight: window.innerHeight,
      wechatInputVisible: inputRect ? inputRect.bottom > 0 && inputRect.top < window.innerHeight && inputRect.height >= 30 : null,
      wechatMessagesVisibleAboveInput: inputRect && msgRect ? msgRect.bottom <= inputRect.top + 4 && msgRect.height > 120 : null,
    };
  });
}

async function openApp(page, screen) {
  if (page1Apps.includes(screen)) await setPageByDot(page, 1);
  else await setPageByDot(page, 0);
  const target = page.locator(`button[data-screen="${screen}"]`).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  await target.click({ force: true });
  await sleep(650);
}

const report = { baseUrl, outDir, checks: [], errors: [], consoleErrors: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const vp of viewports) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => report.errors.push({ viewport: vp.name, theme, error: String(error) }));
    page.on('console', (message) => {
      if (message.type() === 'error') report.consoleErrors.push({ viewport: vp.name, theme, text: message.text().slice(0, 300) });
    });
    await seedPage(page, theme);
    await unlock(page);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-${theme}-desktop-page0.png`), fullPage: true });
    const swipeOk = await testSwipe(page);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-${theme}-desktop-page1-after-swipe.png`), fullPage: true });
    report.checks.push({ viewport: vp.name, theme, screen: 'desktop-swipe', ok: swipeOk, layout: await inspectLayout(page) });

    for (const screen of allApps) {
      await openApp(page, screen);
      if (screen === 'wechat') {
        const row = page.locator('.wechat-chat-row').first();
        if (await row.count()) {
          await row.click({ force: true });
          await sleep(400);
          const input = page.locator('.wechat-chat-input');
          if (await input.count()) {
            await input.fill('QA mobile input visible');
            await page.screenshot({ path: path.join(outDir, `${vp.name}-${theme}-wechat-input-focus.png`), fullPage: true });
            await page.locator('.wechat-compose-send').click({ force: true });
            await sleep(600);
            await page.locator('.circle-button').first().click({ force: true });
            await sleep(250);
            await row.click({ force: true });
            await sleep(250);
            await page.locator('.circle-button.small').first().click({ force: true });
            await sleep(250);
            const actions = page.locator('.wechat-plus-action');
            if (await actions.count()) {
              await actions.first().click({ force: true });
              await sleep(200);
              await input.fill('QA voice input visible');
              await page.screenshot({ path: path.join(outDir, `${vp.name}-${theme}-wechat-voice-mode.png`), fullPage: true });
            }
          }
        }
      }
      if (screen === 'gallery') {
        const photoCard = page.locator('text=QA相册联动照片').first();
        if (await photoCard.count()) await photoCard.click({ force: true }).catch(() => {});
        await sleep(250);
      }
      if (screen === 'ai-context') {
        const text = await page.locator('body').innerText();
        report.checks.push({
          viewport: vp.name,
          theme,
          screen: 'ai-context-linkage',
          ok: text.includes('QA联动角色') && text.includes('QA') && (text.includes('微信') || text.includes('QA history visible')),
          foundGallery: text.includes('QA相册联动照片'),
        });
      }
      const layout = await inspectLayout(page);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-${theme}-${safeName(screen)}.png`), fullPage: true });
      const backMethod = await clickTopLeftBack(page);
      await sleep(350);
      const returned = await page.locator('.desktop-screen').isVisible().catch(() => false);
      report.checks.push({ viewport: vp.name, theme, screen, ok: !layout.hasCrash && !layout.shellHorizontalOverflow && !layout.bodyHorizontalOverflow && returned, backMethod, returned, layout });
      if (!returned) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await unlock(page);
      }
    }
    await context.close();
  }
}

await browser.close();
const failures = report.checks.filter((check) => !check.ok);
report.summary = { totalChecks: report.checks.length, failureCount: failures.length, failures };
fs.writeFileSync(path.join(outDir, 'qa-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
