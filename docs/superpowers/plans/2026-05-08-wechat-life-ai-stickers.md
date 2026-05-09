# WeChat Life AI Stickers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add realistic WeChat life actions, active character actions, coordinated colors, group rename, AI extraction, and emoji-style sticker starter packs.

**Architecture:** Keep the active WeChat shell in `src/App.tsx`, but move reply planning and life-action parsing into `src/wechat/ai/`. Store life cards in existing chat sessions with a few optional `ChatMessage` fields and a persist migration. Use manifest-based starter sticker packs so assets can be expanded later without coupling chat logic to downloaded repositories.

**Tech Stack:** React 19, TypeScript, Zustand persist, Vite, local `npx tsx` tests.

---

### Task 1: AI Parsing Unit

**Files:**
- Create: `src/wechat/ai/wechatAiMessages.ts`
- Create: `src/wechat/ai/wechatAiMessages.test.ts`

- [ ] **Step 1: Add parser tests**

```ts
import { strict as assert } from 'node:assert';
import { parseWeChatAiReply } from './wechatAiMessages';

const parsed = parseWeChatAiReply('到了说一声\\n[sticker mood=comfort]\\n[transfer amount=188 note=晚饭钱]\\n[red-packet amount=52 note=买点甜的]\\n[shopping item=奶茶 amount=18 note=我下单了]');
assert.equal(parsed.length, 5);
assert.equal(parsed[0].kind, 'text');
assert.equal(parsed[1].kind, 'sticker');
assert.equal(parsed[1].mood, 'comfort');
assert.equal(parsed[2].kind, 'transfer');
assert.equal(parsed[2].amount, '188');
assert.equal(parsed[2].note, '晚饭钱');
assert.equal(parsed[3].kind, 'red-packet');
assert.equal(parsed[4].kind, 'shopping');
assert.equal(parsed[4].itemName, '奶茶');

const fallback = parseWeChatAiReply('[transfer note=少了金额]');
assert.equal(fallback[0].kind, 'text');

console.log('wechatAiMessages tests passed');
```

- [ ] **Step 2: Run failing test**

Run: `npx tsx src\wechat\ai\wechatAiMessages.test.ts`
Expected: fails because the parser file does not exist.

- [ ] **Step 3: Implement parser**

Create a parser that returns text, sticker, transfer, red-packet, and shopping parts. It must treat malformed action lines as text.

- [ ] **Step 4: Verify parser**

Run: `npx tsx src\wechat\ai\wechatAiMessages.test.ts`
Expected: prints `wechatAiMessages tests passed`.

### Task 2: Store Types And Migration

**Files:**
- Modify: `src/store.ts`

- [ ] **Step 1: Extend message types**

Add `transfer`, `red-packet`, and `shopping` to `MessageKind`, with optional `amount`, `note`, `itemName`, and `status` on `ChatMessage`.

- [ ] **Step 2: Add group rename action**

Add `updateGroupChat(id, updates)` to `AppState` and store implementation. It should trim names and keep old names if the input is empty.

- [ ] **Step 3: Bump persist version**

Increase the version from `37` to `38`. No destructive migration is needed; optional fields are absent on old messages.

### Task 3: AI Folder And Chat Integration

**Files:**
- Create: `src/wechat/ai/wechatAi.ts`
- Create: `src/wechat/ai/README.md`
- Modify: `src/App.tsx`
- Modify: `src/wechat/shared/WeChatShared.tsx`

- [ ] **Step 1: Move reply planning into AI helper**

Create `buildWeChatReplyRequest` and `fallbackWeChatReply` helpers that keep the existing prompt behavior but add life-action instructions.

- [ ] **Step 2: Add active life actions**

Use `parseWeChatAiReply` in `ChatScreen`. AI output action lines should create real chat messages instead of raw instruction text.

- [ ] **Step 3: Hide group typing**

Render `isTyping` only for direct chats. Group chats should not show the group name as typing.

- [ ] **Step 4: Remove pending send hint**

Remove the visible “输入框留空点发送” hint from the input area. Put the instruction in the AI README and prompt instead.

- [ ] **Step 5: Add alive preset**

Add a “活人感微信” preset that allows occasional low-frequency stickers, transfers, red packets, and shopping notes.

### Task 4: WeChat Life UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `src/wechat/contacts/WeChatContacts.tsx`
- Modify: `src/wechat/discover/WeChatDiscover.tsx`

- [ ] **Step 1: Render life cards**

Add Bubble branches for `transfer`, `red-packet`, and `shopping`.

- [ ] **Step 2: Add plus panel composer**

Add small forms for transfer, red packet, and shopping inside the WeChat plus panel. Send cards as user messages and add drafts for AI context.

- [ ] **Step 3: Sync shopping to orders**

When a user sends a shopping card, call `addPurchaseRecord` with the active character or first group member.

- [ ] **Step 4: Harmonize colors**

Adjust contact and discover icon classes to a coordinated low-saturation palette in CSS.

### Task 5: Group Rename And Sticker Packs

**Files:**
- Modify: `src/wechat/chats/WeChatChats.tsx`
- Modify: `src/wechat/contacts/WeChatContacts.tsx`
- Create: `src/wechat/stickers/stickerPacks.ts`
- Create: `src/wechat/stickers/README.md`
- Modify: `docs/wechat.md`
- Modify: `模块/微信/README.md`

- [ ] **Step 1: Group rename UI**

Add long-press/right-click rename for group rows in chats and contacts. Prompt for the new name and call `updateGroupChat`.

- [ ] **Step 2: Sticker pack manifest**

Create starter pack metadata for OpenMoji, Noto Emoji, and Twemoji with source/license notes. Do not include斗图素材.

- [ ] **Step 3: Documentation**

Update WeChat docs and module README with the new AI folder, life cards, sticker pack source rule, and tests.

### Task 6: Verification

**Files:**
- Test only.

- [ ] **Step 1: Run parser test**

Run: `npx tsx src\wechat\ai\wechatAiMessages.test.ts`
Expected: pass.

- [ ] **Step 2: Run existing WeChat tests**

Run:
`npx tsx src\wechatModules.test.ts`
`npx tsx src\wechatChat.test.ts`
Expected: pass.

- [ ] **Step 3: Run project checks**

Run:
`npm run lint`
`npm run build`
Expected: pass.

- [ ] **Step 4: Search UUID**

Run a source search for `crypto.randomUUID` and `randomUUID()`.
Expected: no direct source calls.

- [ ] **Step 5: Browser check**

Open `http://localhost:3000/`, enter WeChat, check four tabs, direct chat, group chat, plus panel, life cards, and theme overflow.
