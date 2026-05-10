# 小手机项目大纲

本文件是维护 AI 的导航图。后续修改代码前先读这里，再去目标文件顶部注释定位函数。

## 两层目录结构

### 根目录

- `CLAUDE.md`：固定维护流程。规定开工、修改、文档同步、验证和最终回复方式。
- `PROJECT_OUTLINE.md`：当前文件。记录两层目录、关键文件职责、入口函数和维护注意事项。
- `模块/`：中文模块导航目录。每个子目录只放模块说明，真实代码入口仍由说明指向 `src/App.tsx` 或对应源码。
- `MAINTENANCE_OUTLINE.md`：全局维护大纲。当前内容来自旧交接，存在编码显示问题；非全局路线变更不要重写。
- `README.md`：原 AI Studio 运行说明。后续可替换为小手机项目 README。
- `package.json`：npm 脚本和依赖。JSON 不能写顶部注释；用途在本文件维护。
- `package-lock.json`：依赖锁定文件。不要手写改动。
- `vite.config.ts`：Vite 配置。顶部注释列出 defineConfig、插件、alias、HMR 依赖。
- `tsconfig.json`：TypeScript 配置。JSON/JSONC 类配置不作为业务入口。
- `index.html`：Vite HTML 入口，挂载 `#root`。
- `.env.example`：环境变量示例。
- `.gitignore`：忽略规则。
- `metadata.json`：AI Studio 元数据。不要作为业务配置入口。
- `dist/`：构建产物。由 `npm run build` 生成，不手写维护。
- `node_modules/`：依赖安装目录。不要搜索或修改其中源码。

### `src/`

- `src/main.tsx`：React 启动入口。只负责渲染 `App` 和导入全局 CSS。
- `src/App.tsx`：当前真实 UI 壳入口。负责错误边界、桌面、小手机壳、全局音乐 audio、备忘自动写入和 `FeatureScreen` 分发；各软件屏幕优先在 `src/apps/<app-name>/`。
- `src/store.ts`：Zustand 全局状态。包含角色、聊天、图片/语音/表情/转账/红包/购物消息、消息删除/收藏/撤回、模型 API 配置、微信聊天预设参数、主题、微信个人资料、照片墙、朋友圈、带描述表情包、表情收藏/删除、订单与卡包、群聊、联系人标签、结构化日记、日历日程、系统相册、备忘录、小红书笔记、B站条目、桌面布局、persist 迁移。
- `src/index.css`：全局 CSS。包含主题变量、手机壳、桌面、通用控件、微信页、聊天气泡、哥特覆盖和滚动条隐藏。
- `src/lib/utils.ts`：工具函数。`cn` 合并 className，`createId` 生成兼容 ID。
- `src/lib/charaParser.ts`：酒馆/角色卡解析。负责 PNG/JSON 角色卡、头像提取和角色字段归一化。
- `src/apps/`：每个真实手机软件的独立代码目录。软件自己的 UI、逻辑和测试优先放在 `src/apps/<软件名>/`，共享壳、状态、工具和全局样式仍留在 `src/` 对应公共目录。
- `src/apps/wechat/WeChatApp.tsx`：微信四页签外壳，只负责切换聊天、通讯录、发现和我。
- `src/apps/wechat/chat/`：通用聊天列表、聊天房间和消息气泡。QQ 入口当前复用这里的 `ChatList` / `ChatScreen` 能力。
- `src/apps/wechat/ai/`：微信 AI 提示词、活人感规则、转账/红包/购物/表情动作解析和新手教程。
- `src/apps/wechat/stickers/`：微信 emoji/sticker 风格表情包 starter manifest 和来源说明。
- `src/apps/phone/PhoneScreen.tsx`：电话模块真实 UI。包含最近通话、角色拨号、呼叫中、来电中、通话中、通话详情、短口语电话 AI 回复和写入聊天记录按钮。
- `src/apps/gallery/`：相册模块真实代码目录。`GalleryScreen.tsx` 负责相册 UI、上传、图床/微信照片导入、详情编辑、标签点选、可读范围和 char 评价；`galleryLogic.ts` 负责照片筛选、日期分组、标签切换、导入草稿、隐藏切换和评价文案；`galleryLogic.test.ts` 维护相册逻辑测试。
- `src/apps/xiaohongshu/XiaohongshuApp.tsx`：小红书独立 App。包含推荐/关注/附近首页、玩家形象编辑、相册取图、笔记发布、我的发布、详情页、标签筛选、关注、收藏和删除。
- `src/apps/xiaohongshu/types.ts`：小红书条目类型 `XiaohongshuNote` 和玩家形象 `XiaohongshuProfile`。
- `src/apps/xiaohongshu/xiaohongshuLogic.ts`：小红书条目归一化、玩家形象归一化、角色/世界书笔记生成、推荐/关注/附近/我的筛选、标签筛选和 AI 上下文摘要。
- `src/apps/bilibili/`：B站模块真实代码目录。`BilibiliScreen.tsx` 负责视频流、搜索和详情页；`bilibiliLogic.ts` 负责 B站-only fallback、模型 JSON 解析和外站过滤；`bilibiliTypes.ts` 维护 B站条目和搜索记录类型。
- `src/apps/music/MusicScreen.tsx`：音乐模块真实 UI。当前由 `src/App.tsx` 分发到这里，保持原有曲库、播放页、歌单、历史、一起听、外部搜索、char 创作和唱歌/TTS 入口行为不变。
- `src/apps/theater/`：小剧场模块真实代码目录。`TheaterScreen.tsx` 负责创作、历史、收藏、主题库和世界书管理；`theaterLogic.ts` 和测试跟随放在同目录。
- `src/apps/calendar/CalendarScreen.tsx`：日历模块真实 UI。保持月视图、今天、日程、编辑、详情、节日和日记/备忘转入逻辑。
- `src/apps/diary/`：日记和查手机目录。`DiaryScreen.tsx` 负责日记列表/编辑/详情/char 生成；`PeekScreen.tsx` 负责查手机摘要。
- `src/apps/memo/MemoScreen.tsx`：备忘录模块真实 UI。保持标签、置顶、锁定、提醒、转日历和 char 备忘设置逻辑。
- `src/apps/browser/BrowserScreen.tsx`：浏览器模块真实 UI。保持搜索生成、历史、书签、世界书导入和浏览器专属模型配置。
- `src/apps/qq/QQScreen.tsx`：QQ 入口。当前复用 `src/apps/wechat/WeChatApp.tsx` 中的通用聊天列表和聊天房间能力，只包装 QQ 列表入口。
- `src/apps/video/VideoCallScreen.tsx`：视频通话入口。保持原有画面描述和通话按钮 UI。
- `src/apps/settings/`、`src/apps/themes/`、`src/apps/presets/`、`src/apps/logs/`、`src/apps/ai-context/`、`src/apps/contacts/`：设置、主题、预设、后台记录、AI 上下文和全局通讯录入口目录；共享实现集中在 `src/apps/system/SystemScreens.tsx`，各目录导出对应屏幕。
- `src/apps/shared/`：App 屏幕共享 UI primitives 和 AI 文本工具，供拆出的软件屏幕复用。
- `src/shell/appCatalog.tsx`：手机壳桌面 App 目录。维护桌面分页图标、Dock 图标和 catalog 测试用 screen 列表；`src/App.tsx` 仍负责实际渲染。
- `src/shell/appCatalog.test.ts`：桌面 App 目录结构测试，校验图标数量、分页、Dock 顺序和 screen 去重。
- `src/components/WeChatLayout.tsx`：未来微信布局拆分占位；当前没有接入。
- `src/pages/ChatsPage.tsx`：未来微信聊天列表页占位；当前真实函数是 `App.tsx` 里的 `WeChatChats`。
- `src/pages/ContactsPage.tsx`：未来微信通讯录页占位；当前真实函数是 `App.tsx` 里的 `WeChatContacts`。
- `src/pages/DiscoverPage.tsx`：未来微信发现页占位；当前真实函数是 `App.tsx` 里的 `WeChatDiscover`。
- `src/pages/MePage.tsx`：未来微信我页占位；当前真实函数是 `App.tsx` 里的 `WeChatMe`。
- `src/pages/ChatRoom.tsx`：未来聊天房间占位；当前真实函数是 `App.tsx` 里的 `ChatScreen` 和 `Bubble`。
- `src/pages/ProfilePage.tsx`：未来角色资料页占位；当前真实编辑入口是 `App.tsx` 里的 `ContactsScreen`。

### `docs/`

- `docs/wechat.md`：微信模块文档。记录当前状态、本次改动、重要文件、下一步。
- `docs/diary-plan.md`：日记模块详细构建思路。下一轮日记任务优先读取。
- `docs/calendar-plan.md`：日历模块需求文档。记录日历目标、数据结构、页面结构和实施顺序。
- `docs/gallery-design.md`：相册设计模式。记录相册视觉结构、交互规则、数据规则和后续扩展。
- `docs/memo-plan.md`：备忘录模块需求文档。记录备忘录目标、数据结构、页面结构和实施顺序。
- `docs/bilibili-plan.md`：B站模块需求文档。记录只读取 B站条目、视频流、详情页、搜索生成、查手机摘要和实施顺序。
- `docs/life-system-framework.md`：小手机生活系统总框架。记录手机壳层、生活 App 层、生活事件层、角色记忆层和主动事件层；跨 App 改动先读这里。
- `docs/work-log.md`：每次修改追加工作记录，写清楚范围、原因、实际内容、同步文档、验证和后续事项。

### `模块/`

- `模块/微信/README.md`：微信入口函数、状态依赖、维护同步规则。
- `模块/QQ/README.md`：QQ 当前入口和维护边界。
- `模块/日记/README.md`：日记入口、状态和查手机关联。
- `下一轮-日记/README.md`：下一轮日记任务的最小阅读清单。
- `模块/日历/README.md`：日历入口规划、状态规划和维护边界。
- `下一轮-日历/README.md`：下一轮日历任务的最小阅读清单。
- `模块/相册/README.md`：相册入口、状态、可导入来源和维护边界。
- `模块/备忘录/README.md`：备忘录入口、状态升级规划和维护边界。
- `模块/电话/README.md`：电话/视频通话入口和 TTS 依赖。
- `模块/主题/README.md`：主题页、主题变量和维护边界。
- `模块/B站/README.md`：B站入口、状态、生成解析和维护边界。
- `模块/音乐/README.md`：音乐入口、状态、目录拆分方案和维护边界。
- `模块/角色导入/README.md`：全局/微信导入入口和角色卡解析链路。
- `模块/小红书/README.md`：小红书 App 入口、状态、AI 读取规则和维护边界。

## 当前真实入口地图

- App 壳：`src/App.tsx` -> `App`。
- 桌面：`src/App.tsx` -> `Desktop`、`Draggable`、`CustomWidgetView`、`AppIcon`；桌面 App 目录来自 `src/shell/appCatalog.tsx`。
- 功能分发：`src/App.tsx` -> `FeatureScreen`。
- 微信容器：`src/App.tsx` -> `src/apps/wechat/WeChatApp.tsx` -> `WeChatApp`，只负责微信四页签。
- 微信聊天列表：`src/apps/wechat/chats/WeChatChats.tsx` -> `WeChatChats`。
- 微信通讯录/导入酒馆卡/群聊/标签：`src/apps/wechat/contacts/WeChatContacts.tsx` -> `WeChatContacts`，导入解析依赖 `src/lib/charaParser.ts`。
- 微信发现入口/朋友圈/照片墙/表情包库：`src/apps/wechat/discover/WeChatDiscover.tsx` -> `WeChatDiscover`，内部用 `discoverView` 切换入口页和详情页。
- 微信我：`src/apps/wechat/me/WeChatMe.tsx` -> `WeChatMe`。
- 聊天房间/连续发送/图片发送/表情注释/人设世界书上下文/上下文消息数/接口失败重试：`src/apps/wechat/chat/ChatScreen.tsx` -> `ChatScreen`。
- 聊天气泡/多气泡拆分/图片/语音条/转写/播放中状态：`src/apps/wechat/chat/ChatScreen.tsx` -> `Bubble` 和 `splitAssistantBubbles`。
- 微信聊天预设/导入酒馆预设：`src/App.tsx` -> `WeChatMe` 的设置视图；解析函数为 `parseSillyTavernPreset`，状态在 `src/store.ts` 的 `chatPreset*` 字段。
- 微信生活化 AI：`src/apps/wechat/ai/` -> `buildWeChatSystemPrompt`、`parseWeChatReplyParts`；`ChatScreen` 负责把 AI 动作转为转账、红包、购物、表情包消息。
- 微信群聊：`src/App.tsx` -> `WeChatChats` 和 `WeChatContacts`；状态在 `src/store.ts` 的 `groupChats`，聊天复用 `chatSessions`，群头像由 `WeChatGroupAvatar` 拼成员头像，AI 回复按成员逐个发言。
- 微信朋友资料：`src/App.tsx` -> `WeChatContacts` 内部 `profileId` 视图。
- 微信标签筛选：`src/App.tsx` -> `WeChatContacts` 内部 `activeTagFilter`，状态在 `src/store.ts` 的 `contactTags`。
- QQ：`src/App.tsx` -> `src/apps/qq/QQScreen.tsx`，当前复用 `src/apps/wechat/WeChatApp.tsx` 的通用聊天列表/聊天房间。
- 日记：`src/App.tsx` -> `src/apps/diary/DiaryScreen.tsx`，状态在 `src/store.ts` 的 `DiaryEntry[] diaries`，支持列表、编辑、详情、标签/角色筛选和 char 日记生成。
- 查手机日记摘要：`src/App.tsx` -> `src/apps/diary/PeekScreen.tsx` 读取结构化日记摘要。
- 日历：`src/App.tsx` -> `src/apps/calendar/CalendarScreen.tsx`，状态在 `src/store.ts` 的 `CalendarEvent[] calendarEvents`，支持月视图、今天页、日程列表、编辑页、详情页、收藏、筛选、经期快捷记录、节日显示和从日记/备忘录转入；今天页“接下来”只展示用户记录的未来日程，最近节日单独展示两个；查手机只读取 char/shared 日程摘要。
- 相册：`src/App.tsx` -> `src/apps/gallery/GalleryScreen.tsx`，相册 UI 和照片分组/筛选/标签/可读范围/char 评价相关逻辑在 `src/apps/gallery/`；状态仍在 `src/store.ts` 的 `GalleryPhoto[] galleryPhotos` 和 `string[] galleryTags`，不改变用户数据结构。支持上传照片自动记录日期、按日期分组、点选/创建标签、设置 char 可读范围、char 评价、相簿筛选、收藏、隐藏，以及从桌面图床/微信照片墙导入；查手机只读取允许 char 读取的照片摘要。
- 备忘录：`src/App.tsx` -> `src/apps/memo/MemoScreen.tsx`，保持 `MemoEntry[]`、标签、置顶、锁定、提醒和转日历。
- 小红书：`src/App.tsx` -> `XiaohongshuApp`，真实代码在 `src/apps/xiaohongshu/`；状态在 `src/store.ts` 的 `XiaohongshuProfile xiaohongshuProfile`、`XiaohongshuNote[] xiaohongshuNotes` 和 `string[] xiaohongshuFollowingIds`，支持玩家形象编辑、推荐/关注/附近首页、刷新生成角色和世界路人笔记、从相册取图发布、我的发布、标签筛选、详情、关注、收藏和删除；没有相册图时不伪造笔记封面，AI 上下文只读取文字版小红书条目。
- B站：`src/App.tsx` -> `BilibiliScreen`，真实代码在 `src/apps/bilibili/`；状态在 `src/store.ts` 的 `BilibiliVideoEntry[] bilibiliEntries` 和 `BilibiliSearchRecord[] bilibiliSearches`，支持视频流、搜索生成、详情页、弹幕、评论、收藏和观看记录；解析模型结果时只保留 B站或 `phone://bilibili/` 模拟条目。
- 音乐：`src/App.tsx` -> `MusicScreen`，真实代码在 `src/apps/music/MusicScreen.tsx`；状态在 `src/store.ts` 的 `musicTracks`、`musicPlaylists`、`musicListenRecords`、`musicPlayer` 和 `musicSourceConfig`，当前只完成目录拆分，不新增播放器功能或状态。
- 小剧场：`src/App.tsx` -> `src/apps/theater/TheaterScreen.tsx`，逻辑在 `src/apps/theater/theaterLogic.ts`。
- 浏览器：`src/App.tsx` -> `src/apps/browser/BrowserScreen.tsx`。
- 视频通话：`src/App.tsx` -> `src/apps/video/VideoCallScreen.tsx`。
- 文本模型设置/拉取模型：`src/App.tsx` -> `src/apps/settings/SettingsScreen.tsx`，系统工具共享实现在 `src/apps/system/SystemScreens.tsx`。
- 收藏页/订单与卡包：`src/App.tsx` -> `WeChatMe` 的内部视图。
- 全局状态和迁移：`src/store.ts` -> `useAppStore` persist migrate。当前 persist version 为 42，补齐微信生活消息、电话、日历、相册、音乐、小红书、B站等旧数据兼容字段。
- ID 生成：`src/lib/utils.ts` -> `createId`。

## 黑屏排查顺序

1. 确认浏览器端口是不是当前项目。`3000` 可能被旧项目占用；当前项目可另起 `3001` 或更高端口。
2. 看小手机是否显示 `小手机界面崩了` 错误兜底。如果显示，按错误文本定位。
3. 查 `src/App.tsx` 的 `FeatureScreen` 是否把目标 screen 分发到真实组件。
4. 查 `src/store.ts` persist version/migrate，避免旧 localStorage 把 screen 或主题带到异常状态。
5. 跑 `npm run lint` 和 `npm run build`。

## 文档同步规则

- 改 `src/App.tsx`：同步文件头函数列表，必要时同步本文件“当前真实入口地图”。
- 改 `src/store.ts`：同步 persist version、迁移说明和状态字段说明。
- 改具体模块：同步对应 `docs/*-plan.md` 或 `docs/wechat.md`。
- 改生活事件、角色记忆、通知、锁屏或主动事件：同步 `docs/life-system-framework.md`。
- 每次实际修改：追加 `docs/work-log.md`。
- 新增/接入 `src/pages/*`：把占位说明改为真实职责，并在本文件登记入口。
## 2026-05-07 电话模块补充

- `src/apps/phone/PhoneScreen.tsx`：电话模块真实 UI。包含最近通话、角色拨号、呼叫中、来电中、通话中、通话详情、短口语电话 AI 回复和写入聊天记录按钮。
- `src/App.tsx`：仍负责应用壳和 `FeatureScreen` 分发；电话 screen 只 import 并渲染 `PhoneScreen`，不要再把电话业务逻辑塞回本文件。
- `src/store.ts`：新增 `PhoneCallRecord[] phoneCallRecords` 和电话记录新增、更新、删除、收藏 actions；TTS 配置支持 browser/local/openai/gemini；当前 persist version 为 41。
- `src/tts.ts`：TTS provider 工具。负责浏览器内置语音、本地 HTTP、OpenAI `/audio/speech`、Gemini `generateContent` 音频请求构造和播放。
