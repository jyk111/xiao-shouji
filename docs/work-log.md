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

## 2026-05-10 生活事件时间线基础结构

- 范围：只做生活事件时间线基础结构，未改锁屏、通知中心、查手机、微信聊天优化或主动事件逻辑。
- 原因：先给微信、电话、日记、日历、相册、音乐、小红书、B站后续写入高价值生活事件提供统一数据结构、持久化字段和读写工具。
- 内容：新增 `src/lifeEvents.ts`，定义 `LifeEvent`、`LifeEventDraft`、事件 app/type 枚举、`buildLifeEvent`、`normalizeLifeEvents`、`getLifeEventTimeline` 和 `isHighValueChatLifeEventInput`；新增 `src/lifeEvents.test.ts` 覆盖归一化、读取筛选、高价值聊天门槛和 store 写入去重；`src/store.ts` 新增 `lifeEvents`、`addLifeEvent`、`deleteLifeEvent`，同一 `app + sourceId` 更新原事件，当前 persist version 为 44 并迁移旧状态。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/life-system-framework.md` 和本工作记录。
- 验证：先运行 `npx tsx src/lifeEvents.test.ts` 失败，原因是 `src/lifeEvents` 尚不存在；实现后 `npx tsx src/lifeEvents.test.ts` 通过（保留 Node 环境中 zustand storage unavailable 提示）；`npx tsx src/apps/appsStructure.test.ts` 通过；全量 `src/**/*.test.ts` 跑到非本轮范围的 `src/shell/appCatalog.test.ts` 时停止，原因是当前桌面目录已有 16 个 App 而测试仍期望 15 个；`npm run lint` 停在非本轮范围的 `src/apps/active-events/ActiveEventsScreen.tsx` JSX namespace 和 props `key` 类型错误；`npm run build` 通过，保留 Vite chunk 体积提示；源码中未发现 `crypto.randomUUID` / `randomUUID` 直调。
- 后续：各 App 后续接入时只写高价值节点，不要把每条普通聊天或普通浏览行为都写入生活事件。

## 2026-05-10 查手机按角色读取升级

- 范围：只改查手机读取和展示；未改生活事件时间线、锁屏、通知中心、微信聊天优化或主动事件逻辑，也未改其他 App 写入逻辑。
- 原因：查手机需要按选中 char 展示 TA 自己手机里的最近聊天、日记、相册、日历、备忘、浏览器、小红书和音乐摘要，而不是展示用户手机里哪些内容能给角色看。
- 内容：新增 `src/apps/peek/peekLogic.ts` 和 `src/apps/peek/peekLogic.test.ts`，把查手机跨 App 角色手机规则抽成纯逻辑；`src/apps/diary/PeekScreen.tsx` 改为角色切换 + 摘要行展示；`src/apps/appsStructure.test.ts` 增加 `src/apps/peek/` 结构检查。读取规则包括：聊天只读该 char 会话并按角色手机口吻展示；日记/日历/相册/备忘/小红书/音乐只读取明确属于该角色的记录；浏览器使用现有浏览记录作为 TA 手机浏览摘要；没有明确记录时生成角色手机痕迹摘要，不把用户日记、用户相册或用户备忘当成角色手机内容。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/life-system-framework.md`、`docs/diary-plan.md`、`模块/日记/README.md` 和本工作记录。
- 验证：按 TDD 先运行 `npx tsx src/apps/peek/peekLogic.test.ts` 失败，原因是 `src/apps/peek/peekLogic` 尚不存在；实现后该测试通过。`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`npm run lint` 失败在非本轮范围的 `src/apps/active-events/ActiveEventsScreen.tsx` JSX namespace 和 props `key` 类型错误；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "randomUUID|crypto\.randomUUID" src` 未发现源码直调；本地 dev server 跑在 `http://127.0.0.1:3002/` 且 HTTP 200，Browser 插件初始化超时，未完成浏览器内可视冒烟。
- 后续：如果后续把查手机改为优先读生活事件时间线，需要先稳定 LifeEvent 可读范围，再用 `peekLogic.ts` 替换底层数据来源。

### 2026-05-10 查手机视角修正

- 范围：修正上一条查手机实现的产品语义，仍只改查手机读取/展示与文档。
- 原因：查手机应当是查角色自己的手机，不是查用户手机；上一版误把“char 可读范围”作为主语。
- 内容：`peekLogic.ts` 改为优先展示明确属于该角色的记录；没有明确记录时生成 TA 手机里的聊天、日记、相册、日历、备忘、浏览器、小红书和音乐痕迹摘要；测试改为拒绝用户日记、用户相册、用户备忘和其他角色内容进入当前角色手机。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/life-system-framework.md`、`docs/diary-plan.md`、`模块/日记/README.md` 和本工作记录。
- 验证：`npx tsx src/apps/peek/peekLogic.test.ts` 先失败在用户日记被读进角色手机，修正后通过；`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "randomUUID|crypto\.randomUUID" src` 未发现源码直调；`http://127.0.0.1:3002/` HTTP 200。

## 2026-05-10 主动事件手动刷新入口

- 范围：只做主动事件第一版手动入口和纯逻辑；没有修改生活事件时间线规则、锁屏、通知中心、查手机、微信聊天优化。
- 原因：需要一个低风险的“刷新今日生活”入口，让系统基于已有聊天、日记、日历、相册、音乐等数据生成少量主动事件建议。
- 内容：新增 `src/apps/active-events/activeEventsLogic.ts` 和测试，按 6 小时冷却、最多 3 条建议、真实 `sourceIds` 生成发消息、写日记、推荐歌、发动态或创建后台提醒建议；新增 `src/apps/active-events/ActiveEventsScreen.tsx`，只在手动点击时生成预览，确认后才写入微信消息、char 日记、音乐聆听记录、朋友圈动态或后台记录，并同步写入 `lifeEvents`；`src/store.ts` 新增 `activeEventLastRefreshAt` 和 setter，当前 persist version 为 44；桌面第二页新增“今日生活”入口并更新结构测试。
- 文档：同步 `docs/life-system-framework.md`、`PROJECT_OUTLINE.md` 和本工作记录。
- 验证：按 TDD 先运行 `npx tsx src/apps/active-events/activeEventsLogic.test.ts` 失败，原因是主动事件逻辑模块尚不存在；实现后通过。`npx tsx src/apps/active-events/activeEventsStore.test.ts` 先失败于缺少 `setActiveEventLastRefreshAt`，实现后通过。`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "crypto\.randomUUID|randomUUID" src package.json vite.config.ts` 未发现直调。
- 后续：后续若要接入 AI 生成文案，仍应保持手动触发和确认写入；自动低频调度需另开一轮设计。

## 2026-05-10 微信聊天语音未读红点

- 范围：只改微信/QQ 共用聊天房间里的通用语音消息能力，未改 QQ 专属逻辑，未改生活事件时间线、锁屏、通知中心、查手机或主动事件。
- 原因：继续优化微信聊天体验，选择“语音条未读红点”作为小闭环，避免把 `ChatScreen.tsx` 继续堆大。
- 内容：新增 `src/apps/wechat/chat/voiceUnread.ts` 和 `voiceUnread.test.ts`，定义模型语音未听判断和播放后标记；新增 `src/apps/wechat/chat/VoiceMessageBubble.tsx`，承接语音条播放态、转文字按钮和未听红点 UI；`ChatScreen.tsx` 只负责接线；`src/store.ts` 增加 `voicePlayedAt` 可选字段和 `markVoiceMessagePlayed` action，persist version 升到 44 并迁移旧聊天消息。
- 文档：同步 `docs/wechat.md`、`PROJECT_OUTLINE.md` 和本工作记录。
- 验证：先运行 `npx tsx src/apps/wechat/chat/voiceUnread.test.ts` 失败，原因是 `voiceUnread` 模块尚不存在；实现后该测试通过。`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`rg "crypto\.randomUUID|randomUUID" src` 未发现源码直调。
- 后续：语音条后续可继续做更细的触摸反馈；多选/转发、图片理解、收藏分类和角色独立预设仍可作为后续独立小闭环。

## 2026-05-10 微信界面主题收敛

- 范围：只改微信界面颜色来源和微信组件 class；未改 QQ 专属逻辑，未改生活事件时间线、锁屏、通知中心、查手机或主动事件。
- 原因：微信内部部分入口图标、文字、箭头、按钮、生活卡片和红点仍使用固定红黄蓝绿，和外层奶油/哥特主题不协调。
- 内容：`src/index.css` 的 `--wechat-*` 变量改为从外层 `--phone-bg`、`--phone-text`、`--panel-bg`、`--accent` 派生；微信入口方块、我页图标、未读红点、语音红点、生活卡片、撤回/收藏工具和输入栏按钮统一吃微信主题变量；`WeChatChats`、`WeChatContacts`、`WeChatMe` 去掉硬编码文字/箭头色；`ChatScreen` 微信聊天背景和发送按钮改由主题 class 控制。
- 文档：同步 `docs/wechat.md` 和本工作记录。
- 验证：`npx tsx src/apps/wechat/chat/voiceUnread.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`rg "crypto\.randomUUID|randomUUID" src` 未发现源码直调。`npx tsx src/apps/appsStructure.test.ts`、`npm run lint`、`npm run build` 当前均失败在非本轮范围的 `src/apps/peek/peekLogic` 缺失，导致 `src/apps/diary/PeekScreen.tsx` 无法解析 `../peek/peekLogic`；因此未能启动可用页面做浏览器视觉烟测。
- 后续：恢复全量验证前，需要先补回或修复查手机模块的 `src/apps/peek/peekLogic`。

## 2026-05-10 锁屏和通知中心最小版本

- 范围：只改手机壳层锁屏、通知中心、桌面/Dock 角标和通知派生工具；未改生活事件时间线、查手机、微信聊天优化或主动事件业务逻辑。
- 原因：让小手机进入项目时先呈现真实手机壳体验，并从现有 App 数据生成最小可用提醒。
- 内容：新增 `src/shell/notifications.ts` 和 `src/shell/notifications.test.ts`，从 `chatSessions.unread`、未接/未接通电话、`calendarEvents.reminderAt`、`memos.reminderAt` 派生通知和 App 角标；`src/App.tsx` 新增 `LockScreen`、`NotificationCenter`、`NotificationCard`，通知点击只进入对应 App 入口；`src/index.css` 增加锁屏、通知中心、通知卡片和角标样式，保持奶油手绘和哥特玻璃主题风格。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/life-system-framework.md` 和本工作记录。
- 验证：`npx tsx src/shell/notifications.test.ts` 先因模块缺失失败，落地后通过；`npx tsx src/apps/appsStructure.test.ts` 通过；全量 `src/**/*.test.ts` 中仅 `src/shell/appCatalog.test.ts` 失败，原因是当前工作区已有 `active-events` 桌面图标导致测试仍期望 15 个桌面 App、实际 16 个；`npm run lint` 失败于现有 `src/apps/active-events/ActiveEventsScreen.tsx` 的 `JSX` 命名空间和 JSX `key` 类型问题；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "crypto\.randomUUID|randomUUID" src` 无命中；Codex in-app browser 没有可用 `iab` 实例，视觉烟测未能执行。
- 后续：如果继续做通知，应先决定是否把生活事件时间线并入通知来源；若要恢复全量验证，需要先处理现有 `active-events` 与 app catalog 测试不一致的问题。

## 2026-05-10 通知入口位置调整

- 范围：只改手机壳层通知入口显示规则和样式。
- 原因：桌面顶部居中的通知入口遮挡主界面，需要减少存在感，并且进入其他 App 后不应继续显示。
- 内容：`src/App.tsx` 改为只在 `activeScreen === 'desktop'` 时渲染通知入口和通知中心；`src/index.css` 把通知入口缩小为左上角小胶囊，减少遮挡。
- 文档：追加本工作记录。
- 验证：`npx tsx src/shell/notifications.test.ts` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "crypto\.randomUUID|randomUUID" src` 无命中。
- 后续：若仍觉得桌面左上角占位明显，可进一步改成第二页的系统 App 图标入口。

## 2026-05-11 查手机二级界面

- 范围：只改查手机读取、展示和共享 UI 类型声明；未改生活事件时间线、锁屏、通知中心、微信聊天优化或主动事件。
- 原因：查手机首页摘要不够，点进每个模块应能看到类似角色手机 App 的具体界面。
- 内容：`src/apps/peek/peekLogic.ts` 为每个查手机模块输出详情条目 `items`，生成态也提供可进入的角色手机痕迹；`src/apps/diary/PeekScreen.tsx` 改成首页模块按钮 + 二级详情页，聊天像聊天卡片，相册像照片格子，日记/日历/备忘/浏览器/小红书/音乐显示列表卡片；`src/apps/shared/AppPrimitives.tsx` 补 `Panel` 的 `key` 类型声明以通过现有 JSX 用法。
- 文档：同步 `PROJECT_OUTLINE.md`、`docs/life-system-framework.md`、`docs/diary-plan.md`、`模块/日记/README.md` 和本工作记录。
- 验证：`npx tsx src/apps/peek/peekLogic.test.ts` 先失败在详情条目不存在，补 `items` 后通过；`npx tsx src/apps/appsStructure.test.ts` 通过；全部 `src/**/*.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "randomUUID|crypto\.randomUUID" src` 未发现源码直调；`http://127.0.0.1:3002/` HTTP 200。
- 后续：如果需要更像原生 App，可继续给每个二级页做独立导航栏和更贴近微信/相册/浏览器的视觉细节。

## 2026-05-11 预设 App 统一管理各软件提示词

- 范围：只改预设页、各软件提示词读取点和 `src/store.ts` 预设字段；未改各 App 的核心生成流程。
- 原因：玩家需要在“预设”App 里集中查看和自由修改微信/QQ、浏览器、小红书、B站、电话、音乐写歌等软件预设，而不是分散在各 App 内部。
- 内容：`src/apps/system/SystemScreens.tsx` 的 `PresetsScreen` 改为按软件分卡片编辑预设名称和内容，并保留微信内置聊天预设套用；`src/store.ts` 新增 `defaultSoftwarePresets` 以及 `xiaohongshuPreset*`、`bilibiliPreset*`、`phonePreset*`、`musicPreset*` 字段，persist version 升到 45；`BilibiliScreen` 改读 B站专属预设；`XiaohongshuApp` 刷新生成时把小红书预设传入生成逻辑；`PhoneScreen` 电话回复读电话预设；`MusicScreen` char 写歌读音乐预设；`AppPrimitives.Panel` 类型兼容 JSX key。
- 文档：同步 `PROJECT_OUTLINE.md` 和本工作记录。
- 验证：`npm run lint` 通过；全部 `src/**/*.test.ts` 通过，保留 Node 环境中 zustand storage unavailable 提示；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "crypto\.randomUUID|randomUUID" src` 无命中。
- 后续：微信“我”里仍保留导入酒馆/聊天预设入口，后续可把导入入口也复制到预设 App 顶部。

## 2026-05-11 P5R 红黑主题调整

- 范围：只改红黑主题视觉和主题选项文案；奶油手绘主题变量未修改。
- 原因：原红色主题偏灰、偏玻璃；用户希望参考 `D:/zip (2).zip` 的主题变量、粗边框和卡片化语言，做得更接近 P5R 的黑白高对比和鲜红斜切感。
- 内容：`src/index.css` 将 `.theme-gothic` 调整为红色主视觉、黑白斜切、白色半调点阵和粗黑边硬卡片；桌面图标、Dock、时间卡片、锁屏背景、按钮阴影统一使用黑/白/红；锁屏时隐藏红黑主题手机壳伪状态栏，避免和锁屏自己的时间/WiFi 重叠；`src/App.tsx` 和 `src/apps/system/SystemScreens.tsx` 将该主题显示名改为 `P5R 红黑`。
- 文档：追加本工作记录。
- 验证：`npx tsx src/apps/appsStructure.test.ts` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`rg -n "crypto\.randomUUID|randomUUID" src` 无命中；生成截图 `qa-screenshots/57-p5r-red-theme-reference-lock.png`。
- 后续：如果还想更像“怪盗菜单”，下一步可单独做主题页/桌面图标的斜切排版，但仍应避免影响奶油主题。

### 2026-05-11 红黑主题收敛修正

- 原因：上一版过度使用点阵、粗斜条和白色块，视觉噪音过强。
- 内容：`src/index.css` 在红黑主题末尾追加收敛覆盖：减少点阵密度，改成大面积黑底 + 两条红色斜切；卡片、按钮、Dock 和图标统一为黑底白边红阴影，去掉大面积白色卡片和过度倾斜。
- 验证：`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；生成截图 `qa-screenshots/58-p5r-red-theme-calm-lock.png`。

## 2026-05-11 古风手札主题与主题目录

- 范围：只改主题系统视觉、主题文案和主题目录说明；未改聊天、通知、锁屏、查手机、主动事件的数据逻辑。
- 原因：新增古风主题，并按要求把主题资源迁到独立目录，避免继续把完整主题堆在业务入口或全局 CSS 里。
- 内容：新增 `src/themes/themeOptions.ts` 管理主题 ID、类型和主题页预览文案；新增 `src/themes/guofeng.css`，为 `guofeng` 主题覆盖手机壳背景、锁屏、桌面图标、Dock、通知入口、通知卡片、通用卡片/按钮/输入框、微信/QQ 聊天变量和生活卡片视觉；`src/main.tsx` 导入独立主题 CSS；`src/store.ts` 从主题目录复用 `ThemeType`。
- 文档：同步 `PROJECT_OUTLINE.md` 和 `模块/主题/README.md`，记录 `src/themes/` 作为主题系统目录。
- 验证：`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；本地 dev server 跑在 `http://127.0.0.1:3004/`，生成截图 `qa-screenshots/59-guofeng-lock.png`、`qa-screenshots/60-guofeng-desktop.png`、`qa-screenshots/61-guofeng-wechat-chat.png`、`qa-screenshots/62-guofeng-themes.png`。
- 后续：如继续新增主题，优先新增 `src/themes/<theme>.css` 并只在 `themeOptions.ts` 登记文案和 ID。
## 2026-05-11 古风主题方向修正

- 范围：只改主题展示文案和主题说明文档；未改业务逻辑或持久化数据结构。
- 原因：上一版文案和方向过于西式奇幻感，不符合“古风”预期。
- 内容：`src/themes/themeOptions.ts` 将 `guofeng` 说明改为宣纸米白、墨色文字、朱砂点印、黛青淡纹；`模块/主题/README.md` 同步主题定位。
- 验证：后续随本轮统一运行 `npm run lint` 和 `npm run build`。

## 2026-05-11 古风软件器物化加强

- 范围：只加强古风主题视觉和主题目录说明；未改聊天、通知、锁屏、查手机、主动事件的数据逻辑；奶油主题未改动。
- 原因：上一版古风辨识度仍偏弱，桌面软件只是通用图标换色，不像古风变体。
- 内容：`src/App.tsx` 为桌面和 Dock 图标补 `data-screen` 视觉钩子；`src/themes/guofeng.css` 将古风主题软件图标改为书札/器物/印章字标，例如微信为“简”、音乐为“笛”、日记为“卷”、预设为“印”、主题为“染”，并补宣纸格线、手札印章和更明确的朱砂点印；移除不符合当前目标的旧主题登记和导入。
- 文档：同步 `PROJECT_OUTLINE.md` 和 `模块/主题/README.md`，主题页只保留奶油、P5R 红黑、古风手札。
- 验证：`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；本地 dev server 跑在 `http://127.0.0.1:3005/`，生成截图 `qa-screenshots/68-guofeng-wechat-list-fresh.png`、`qa-screenshots/71-guofeng-themes-three-only.png`、`qa-screenshots/72-guofeng-desktop-final.png`。

## 2026-05-11 三主题全软件截图与微信输入 QA

- 范围：对奶油、P5R 红黑、古风手札三套主题做全软件截图和微信输入冒烟；奶油主题只检查不调整，P5R 和古风只做视觉修正。
- 原因：需要确认三个主题下每个桌面软件、Dock 软件、锁屏、桌面和微信文字/语音输入都能正常打开和显示。
- 内容：P5R 假状态栏限制在桌面显示，避免压住各软件标题和返回按钮；古风补齐浏览器、小红书、B站等独立样式软件的宣纸/朱砂/黛青视觉覆盖；移除和三主题目标冲突的旧主题入口、导入和空目录。
- 验证：`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；本地 dev server 跑在 `http://127.0.0.1:3005/`；通过真实桌面点击打开每个软件并生成 `qa-screenshots/full-theme-qa-2026-05-11-v2/` 共 84 张截图，QA 汇总在 `qa-screenshots/full-theme-qa-2026-05-11-v2/qa-report.json`。
- 微信：三套主题均从桌面点开微信、进入测试联系人聊天、发送文字、打开加号面板、切换语音条并发送语音文字；`textSent`、`plusPanelOpened`、`voiceModeOpened`、`voiceSent` 均为 true。

## 2026-05-11 NAI 生图、相册去重和凯尔特主题恢复

- 范围：新增共享 NAI 生图能力、微信/小红书生图入口、相册去重和 `generated` 来源、凯尔特主题视觉；未改聊天、通知、锁屏、查手机、主动事件的数据结构和写入规则。
- 原因：用户需要用 NAI API 验证小红书、微信和 char 主动发图链路，并恢复优化凯尔特主题，同时修正微信键盘呼出后聊天记录保持可见。
- 内容：新增 `src/lib/naiImage.ts`，支持 NovelAI 图片接口、PNG/ZIP 返回解析和超时错误；`SettingsScreen` 接入生图配置和测试按钮；`ChatScreen` 增加微信加号菜单 AI 生图、char `[image prompt="..."]` 动作、聚焦/visualViewport 滚到底；`XiaohongshuApp` 发布页增加 NAI 封面生成并同步相册；`store.ts` persist version 升到 46，新增 `imageGenerationConfig`、`image` 日志类型、相册 URL 去重和 `generated` 来源；`App.tsx` 42 教程补作者/平台/性质/适用人群文案；新增 `src/themes/celtic-paladin/index.css` 并恢复主题选项。
- 文档：同步 `PROJECT_OUTLINE.md`、`模块/主题/README.md` 和本工作记录。
- 验证：临时使用用户提供的 NAI key 直连 `https://image.novelai.net/ai/generate-image` 成功，返回二进制图片包并解出 `qa-screenshots/nai-api-test-2026-05-11/nai-connectivity.png`；`npx tsx src/apps/wechat/ai/wechatAiMessages.test.ts` 通过；`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；本地 dev server 跑在 `http://127.0.0.1:3005/`；凯尔特主题和 AI UI 截图在 `qa-screenshots/celtic-and-ai-2026-05-11/`。
- QA 记录：真实 NAI 直连成功；微信用户侧 AI 生图在浏览器中成功写入图片气泡；小红书生图、char 微信 `[image]` 发图用拦截的 NAI PNG 响应验证 UI/store 链路成功；主动事件刷新生成 3 条建议；微信输入框 focus 后消息列表保持底部可见。

## 2026-05-11 生图设置归位、锁屏壁纸和社区验证配置

- 范围：只改扩展设置、锁屏展示、相册壁纸入口、默认主题和社区验证配置；未改聊天、通知、查手机或主动事件业务逻辑。
- 原因：生图应集中在设置页统一配置；玩家需要从相册替换锁屏壁纸；新用户默认主题应为奶油手绘；没有自定义锁屏时需要内置小人图；社区验证需要记录 Discord 回调和身份组。
- 内容：`src/lib/naiImage.ts` 增加 `promptPreset` 通用正向提示串并在请求前拼接；`SettingsScreen` 的生图页明确作为全局 NAI 配置入口，补通用正向提示串；新增社区验证页，保存回调地址、目标社区和 `类脑/旅程/世界树` 身份组；`store.ts` persist version 升到 47，默认主题改为 `pastel`，新增 `communityVerificationConfig`；`LockScreen` 在没有用户壁纸时展示内置小人锁屏图；`GalleryScreen` 详情页增加“设为锁屏/默认锁屏”。
- 文档：同步 `PROJECT_OUTLINE.md` 和本工作记录。
- 验证：`npm run lint` 通过；`npx tsx src/apps/wechat/ai/wechatAiMessages.test.ts` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；生成截图 `qa-screenshots/settings-wallpaper-community-2026-05-11/`，报告在同目录 `qa-report.json`。

## 2026-05-11 社区验证门禁修正和默认锁屏资产归位

- 范围：只改启动门禁和默认锁屏资产读取；不改聊天、通知、查手机、主动事件业务逻辑。
- 原因：社区验证不能只是配置项，未验证时不应直接进入小手机；默认锁屏不应由代码临时画图，应读取玩家提供的内嵌图片资产。
- 内容：`App` 启动时先读取 `communityVerificationConfig.requiredGroups` 与 `verifiedGroups`，未满足 `类脑/旅程/世界树` 等必需身份组时渲染社区验证门，不进入锁屏/桌面；门禁可读取当前 URL 的 `groups/discord_groups/roles` 参数，也可粘贴 Discord 返回的身份组文本验证。默认锁屏图片改为优先读取 `/default-lock-wallpaper.png`，如果项目未放该图片则只显示主题背景，不再代码绘制小人。
- 文档：同步 `PROJECT_OUTLINE.md` 和本工作记录。
- 验证：`npm run lint` 通过；生成截图 `qa-screenshots/community-gate-2026-05-11/community-gate.png`，确认新档首屏显示社区验证并列出身份组。
## 2026-05-14 锁屏、相册、预设与 char 主动整理

- 范围：只调整锁屏视觉、相册上传/入口体验、预设管理、小剧场默认世界书导入、char 主动入口和凯尔特主题视觉；不改微信/通知/查手机/主动事件的数据写入规则。
- 原因：锁屏需要按主题呈现不同气质；相册上传流程过杂；玩家需要把 `D:\useruser (3).json` 默认带入小剧场；预设需要多条目并区分 system/user/assistant；char 主动需要独立软件入口；凯尔特主题需要更明确的西幻手札风格。
- 内容：新增 `src/apps/theater/defaultUseruserWorldBook.ts` 并接入小剧场默认世界书；相册首页改为“相簿 + 标签 + 选择照片”的轻量导入规则；预设支持每个软件多条目、当前启用条目和发送身份；桌面第二页新增 `char主动` 软件；古风、P5R、凯尔特西幻和奶油默认锁屏各自有主题化默认样式；凯尔特主题改为羊皮纸、银蓝符文、深林绿和细金属边。
- 验证：`npm run lint` 通过；`npm run build` 通过，保留 Vite chunk 体积提示；`npx tsx src/apps/gallery/galleryLogic.test.ts`、`npx tsx src/apps/theater/theaterLogic.test.ts`、`npx tsx src/apps/appsStructure.test.ts` 均通过；手机视口 390x844 生成 QA 截图 `qa-screenshots/theme-gallery-preset-v11-2026-05-14-clean/`，覆盖四个主题锁屏、相册、预设、小剧场、char 主动和桌面第二页；真实滑动翻页测试可从第一页左滑到第二页。

## 2026-05-14 整机验收、返回适配与 APK v12

- 范围：修正全屏软件返回入口，刷新移动端 WebView 内容，并完成四主题、三尺寸、全软件整机验收。
- 原因：微信、小红书、B站和浏览器是自定义全屏软件，缺少统一外层返回入口时会出现“点进去回不来”的手机端问题；同时需要确认微信输入、相册、AI 上下文和桌面翻页在不同手机尺寸下都能使用。
- 内容：`src/App.tsx` 为微信、小红书、B站、浏览器增加 shell 级悬浮返回键；`src/index.css` 补齐返回键样式并跟随主题变量；默认锁屏不再请求缺失的 `/default-lock-wallpaper.png`，没有玩家壁纸时只使用主题化锁屏背景；`mobile-export/app.json` Android `versionCode` 升到 12；刷新 `mobile-export/web-content.js` 和 `mobile-export/web.html`。
- 验证：`npm run lint` 通过；`npm run build` 通过，仅保留 Vite chunk 体积提示；`node scripts/qa-v12.mjs` 通过，报告为 276 项检查、0 失败，覆盖 360x740、390x844、430x932，四主题，桌面滑动翻页、21 个软件入口/返回、微信文字/语音输入、相册与 AI 上下文联动。
- 打包：EAS Android preview 构建成功，build id `19ef86d7-89b1-44a2-a133-855f27c773b7`；APK 下载为 `小手机-v12-整机验收返回适配.apk`，SHA256 `405361C8DC2064A49E828F5FA56256B8BD090325B52115A25E9D3A9A5AB46D13`。
