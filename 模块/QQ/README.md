# QQ

## 2026-05-10 调研结论

QQ 目前还没有独立源码目录，真实入口仍在 `src/App.tsx`：

- 桌面图标：`src/shell/appCatalog.tsx` 中 `screen: "qq"`。
- 功能分发：`src/App.tsx` 的 `FeatureScreen` 在 `screen === "qq"` 时直接渲染 `<ChatList channel={screen} />`。
- QQ 聊天列表：`src/App.tsx` 内部函数 `ChatList`，通过 `channel: "qq"` 过滤 `chatSessions`。
- QQ 聊天房间：`src/App.tsx` 内部函数 `ChatScreen`，复用 `activeChannel`，QQ 与微信共用发送、AI 回复、图片、语音、表情、引用、收藏、撤回等逻辑。
- QQ 气泡：`src/App.tsx` 内部函数 `Bubble`，通过 `channel !== "wechat"` 走通用手绘气泡分支。
- 状态：`src/store.ts` 的 `chatSessions`、`openChat`、`addMessage`、`deleteMessage`、`toggleMessageFavorite`、`recallMessage` 均以 `channel: "wechat" | "qq"` 复用。

结论：QQ 不是独立 App，也不是独立聊天实现；它现在基本是“QQ 入口 + 通用 ChatList/ChatScreen 的 qq channel”。后续拆分时不要复制微信整套页面、AI、通讯录、发现、我页代码。

## 最小拆到 `src/apps/qq/` 方案

第一刀只建立 QQ 自己的薄入口，不迁移微信功能：

- 新增 `src/apps/qq/QQApp.tsx`：导出 `QQApp`，只负责渲染 QQ 列表入口。
- 从 `src/App.tsx` 搬出 `ChatList` 中与 `channel === "qq"` 有关的最小列表逻辑，改名为 `QQChatList` 或内置在 `QQApp`。
- `QQApp` 继续使用 `useAppStore()` 读取 `characters`、`chatSessions`、`openChat`、`setScreen`，只筛选 `session.channel === "qq"`。
- `src/App.tsx` 的 `FeatureScreen` 把 `screen === "qq"` 改为渲染 `<QQApp />`。
- 可选新增 `src/apps/qq/qqTypes.ts`，只有在 QQ 后续出现专属状态或视图类型时再加。

先保留在 `src/App.tsx`：

- `ChatScreen`：聊天房间仍由全局 `activeChannel` 驱动，避免一次性拆动 AI 回复、输入栏、图片、语音、表情、引用、收藏、撤回。
- `Bubble`：QQ 当前只用非微信通用气泡分支，先不拆，避免连带搬走微信气泡和生活卡片。
- `PendingChatDraft`、`describeChatMessage`、`requestChatCompletion`、`getCharacterPrompt`、`formatMessageTime`、`delay` 等聊天辅助函数：它们被多个模块共享或与 `ChatScreen` 紧耦合，先不搬。
- `src/store.ts` 的聊天 actions：`wechat` 与 `qq` 当前共用 channel 模型，先不拆 store。

## 后续边界

- QQ 任务只改 `src/apps/qq/`、`src/App.tsx` 的 QQ 分发点、必要的 `src/store.ts` channel 字段和本 README。
- 不要把 `src/apps/wechat/` 的四页签、朋友圈、联系人、微信 AI 生活卡片整套复制到 QQ。
- 如果要做 QQ 空间、戳一戳、QQ 群或 QQ 专属 AI 语气，应先在 `src/apps/qq/` 内新增小模块，再按需要让 `ChatScreen` 接收轻量配置。
- 真正接入 `src/apps/qq/` 后，同步 `PROJECT_OUTLINE.md` 的真实入口地图和 `docs/work-log.md`。
