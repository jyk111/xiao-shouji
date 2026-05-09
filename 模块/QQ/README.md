# QQ

当前真实代码入口仍在 `src/App.tsx`：

- QQ 聊天列表：`ChatList`，传入 `channel="qq"`
- QQ 聊天房间：`ChatScreen`
- QQ 语音/文字气泡：`Bubble` 的非微信分支

相关状态：

- `src/store.ts`：`chatSessions` 中 `channel: "qq"` 的会话
- `src/index.css`：目前主要复用通用手绘气泡和面板样式

维护备注：

- 微信任务不要改 QQ。
- 后续如果拆组件，把 QQ 真实入口登记回 `PROJECT_OUTLINE.md`。
