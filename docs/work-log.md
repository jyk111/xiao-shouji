# 小手机工作记录

每次修改项目都要在这里追加记录。记录只写本次真实发生的事情，不写未来愿望。

## 记录格式

```md
## YYYY-MM-DD 标题

- 范围：改了哪些模块或文件。
- 原因：为什么要改。
- 内容：实际做了什么。
- 文档：同步了哪些文档。
- 验证：跑了哪些命令，结果如何。
- 后续：还剩什么明确事项。
```

## 2026-05-10 生活系统框架和文档规则

- 范围：新增总框架文档和工作记录规则，更新项目维护流程。
- 原因：后续小手机要先有文档框架，再按模块逐步实现；每次修改都需要留下可追踪记录。
- 内容：新增 `docs/life-system-framework.md`，定义手机壳层、生活 App 层、生活事件层、角色记忆层、主动事件层；新增 `docs/work-log.md` 作为每次修改的记录入口。
- 文档：同步 `CLAUDE.md` 和 `PROJECT_OUTLINE.md` 的文档维护要求。
- 验证：`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示。
- 后续：下一轮如果开始实现，应先从生活事件结构或锁屏通知中心二选一写具体设计。

## 2026-05-10 App 壳第一刀拆分

- 范围：手机壳桌面 App 目录和 `src/App.tsx` 顶层依赖。
- 原因：`src/App.tsx` 仍是巨型入口，后续锁屏、通知中心和生活事件接入前，需要先从低风险的纯目录数据开始拆。
- 内容：新增 `src/shell/appCatalog.tsx`，把桌面分页图标和 Dock 图标从 `src/App.tsx` 抽出；新增 `src/shell/appCatalog.test.ts`，校验目录数量、分页、Dock 顺序和 screen 去重；`src/App.tsx` 改为从 shell catalog 导入目录数据。
- 文档：新增 `docs/superpowers/plans/2026-05-10-app-shell-split.md`，同步 `PROJECT_OUTLINE.md`。
- 验证：`npx tsx src/shell/appCatalog.test.ts` 通过；全部 `src/**/*.test.ts` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；源码中未发现 `crypto.randomUUID` / `randomUUID` 直调。
- 后续：下一刀可拆 `FeatureScreen` 路由，或继续拆 `Desktop` / `AppIcon` / `Draggable` 到 `src/shell/`。

## 2026-05-10 每个软件独立文件夹

- 范围：微信、B站、小红书、电话四个已成型软件的目录结构。
- 原因：用户明确要求每个软件是一个文件夹，后续扩展音乐、QQ、备忘录升级时也要遵守 `src/apps/<软件名>/` 的组织方式。
- 内容：新增 `src/apps/appsStructure.test.ts`；移动微信到 `src/apps/wechat/`，B站到 `src/apps/bilibili/`，小红书到 `src/apps/xiaohongshu/`，电话到 `src/apps/phone/`；软件相关测试也跟随移动；更新 `src/App.tsx` 和 `src/store.ts` import。
- 文档：新增 `docs/superpowers/plans/2026-05-10-app-folder-layout.md`，同步 `PROJECT_OUTLINE.md`、`docs/wechat.md`、`docs/bilibili-plan.md` 和相关 `模块/*/README.md`。
- 验证：`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；源码中未发现 `crypto.randomUUID` / `randomUUID` 直调。
- 后续：下一轮拆未成型软件时，按同样规则建立 `src/apps/music/`、`src/apps/memo/`、`src/apps/qq/` 等目录，不再把软件代码直接放在 `src/` 根目录。

## 2026-05-10 每个软件独立文件夹第二轮

- 范围：继续整理 `src/App.tsx` 中残留的软件屏幕和 `src` 根目录小剧场逻辑。
- 原因：用户要求本轮协调“每个软件一个文件夹”，且不改业务逻辑，只做目录整理、import 修正、测试修正和文档同步。
- 内容：新增 `src/apps/theater/`、`src/apps/calendar/`、`src/apps/diary/`、`src/apps/memo/`、`src/apps/browser/`、`src/apps/qq/`、`src/apps/video/`、`src/apps/settings/`、`src/apps/themes/`、`src/apps/presets/`、`src/apps/logs/`、`src/apps/ai-context/`、`src/apps/contacts/`、`src/apps/shared/` 和 `src/apps/system/`；把小剧场、日历、日记、查手机、备忘录、浏览器、微信聊天/气泡、QQ入口、视频通话、设置/主题/预设/日志/AI上下文/通讯录入口从 `src/App.tsx` 拆出；把 `src/theaterLogic.ts` 和测试移动到 `src/apps/theater/`；更新相关 import 和 `src/apps/appsStructure.test.ts`。
- 文档：同步 `PROJECT_OUTLINE.md` 和本工作记录；新增执行计划 `docs/superpowers/plans/2026-05-10-app-folder-layout-round2.md`。
- 验证：`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过，保留 zustand persist 在 Node 测试环境 storage unavailable 提示；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；源码中未发现 `crypto.randomUUID` / `randomUUID` 直调。
- 后续：若后续要把 `src/apps/system/SystemScreens.tsx` 进一步拆成每个系统工具自己的完整实现，可以在不改行为的前提下继续细拆；本轮先保证所有入口都有独立 `src/apps/<app-name>/` 文件夹。

## 2026-05-10 微信聊天内部继续拆分

- 范围：微信/QQ 共用聊天入口内部结构。
- 原因：上一轮已经把微信整体移出 `src/App.tsx`，但 `src/apps/wechat/WeChatApp.tsx` 仍同时承担四页签外壳、聊天列表、聊天房间和消息气泡，后续微信优化前需要继续降耦合。
- 内容：新增 `src/apps/wechat/chat/ChatList.tsx` 和 `src/apps/wechat/chat/ChatScreen.tsx`；`src/apps/wechat/WeChatApp.tsx` 只保留微信四页签外壳；`src/apps/qq/QQScreen.tsx` 改为复用 `src/apps/wechat/chat/ChatList.tsx`；`src/App.tsx` 改为从 `src/apps/wechat/chat/ChatScreen.tsx` 导入聊天房间；更新 `src/apps/appsStructure.test.ts`。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/wechat.md` 和本工作记录。
- 验证：后续统一跑结构测试、全部 `src/**/*.test.ts`、`npm run lint`、`npm run build` 和 randomUUID 检查。
- 后续：可以继续把 `Bubble`、消息长按工具、生活卡片发送动作从 `ChatScreen.tsx` 内拆成更小文件，但不建议和新功能同一轮混做。

## 2026-05-10 QQ 拆分前调研

- 范围：只调研 QQ 模块入口、聊天复用关系和后续 `src/apps/qq/` 最小拆分边界。
- 原因：用户要求先确认 QQ 是否仍复用 `ChatList` 或 `App.tsx` 内部逻辑，并且不要复制微信整套代码。
- 内容：确认当前没有 `src/apps/qq/`；`src/shell/appCatalog.tsx` 只登记 QQ 桌面图标；`src/App.tsx` 的 `FeatureScreen` 对 `screen === "qq"` 直接渲染 `<ChatList channel={screen} />`；`ChatScreen`、`Bubble` 和 `src/store.ts` 的聊天 actions 仍由 `channel: "wechat" | "qq"` 共用。
- 文档：更新 `模块/QQ/README.md`，写明 QQ 当前复用现状、不可复制微信代码的边界，以及下一步只抽 `QQApp` / `QQChatList` 的最小方案。
- 验证：运行 `rg` 和分段读取确认 `src/App.tsx`、`src/store.ts`、`src/shell/appCatalog.tsx`、`src/apps/` 结构；本次未改业务代码，未运行 lint/build。
- 后续：真正实现时先新增 `src/apps/qq/QQApp.tsx` 并只搬 QQ 列表入口，`ChatScreen`、`Bubble`、聊天 store actions 先保留在 `src/App.tsx` / `src/store.ts`。

## 2026-05-10 音乐模块目录准备

- 范围：音乐模块入口和 `src/apps/music/` 目录结构。
- 原因：用户要求本轮只负责音乐模块，先确认 `MusicScreen` 是否仍在 `src/App.tsx`，如果已有则仅拆到 `src/apps/music/` 并保持行为不变。
- 内容：确认 `MusicScreen` 已是完整音乐页而非占位；新增 `src/apps/music/MusicScreen.tsx`，把既有音乐 UI、搜索、歌单、历史、一起听、char 创作和唱歌/TTS 入口从 `src/App.tsx` 移入；`src/App.tsx` 改为 import 并在 `FeatureScreen` 中继续分发；更新 `src/apps/appsStructure.test.ts` 检查音乐目录。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/music-plan.md`、`模块/音乐/README.md`。
- 验证：`npx tsx src/apps/appsStructure.test.ts` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示。
- 后续：下一步音乐只做小拆分，优先抽无状态工具和子视图；不要在同一轮新增播放器状态或重做交互。

## 2026-05-10 相册模块独立目录

- 范围：只整理相册模块，新增 `src/apps/gallery/`，没有修改微信、日历、备忘录、音乐业务逻辑。
- 原因：把 `GalleryScreen` 和相册 UI、照片分组/筛选/标签/可读范围相关逻辑从 `src/App.tsx` 移到相册自己的目录。
- 内容：新增 `src/apps/gallery/GalleryScreen.tsx`、`src/apps/gallery/galleryLogic.ts`、`src/apps/gallery/galleryLogic.test.ts`；`src/App.tsx` 只保留 `GalleryScreen` import 和 `gallery` 路由；`src/apps/appsStructure.test.ts` 增加 gallery 目录校验；保持 `GalleryPhoto` 和 `galleryTags` 数据结构不变。
- 文档：更新 `docs/gallery-design.md`、`模块/相册/README.md`、`PROJECT_OUTLINE.md`，并追加本记录。
- 验证：`npx tsx src/apps/appsStructure.test.ts` 通过；`npx tsx src/apps/gallery/galleryLogic.test.ts` 通过；全量 `src/**/*.test.ts(x)` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示。
- 后续：相册后续新增功能继续落在 `src/apps/gallery/`，只有状态结构变化时再同步 `src/store.ts` persist migrate。
