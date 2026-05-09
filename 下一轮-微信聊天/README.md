# 下一轮：微信聊天修整交接文档

把下面整段发给新窗口 AI：

```txt
请只修整“微信聊天”相关内容，不要动电话、QQ、小剧场、日记、相册、日历、音乐、浏览器等其他模块。

当前项目路径：
C:\Users\凡人歌\Documents\Codex\小手机

先读取这些文件：

C:\Users\凡人歌\Documents\Codex\小手机\PROJECT_OUTLINE.md
C:\Users\凡人歌\Documents\Codex\小手机\docs\wechat.md
C:\Users\凡人歌\Documents\Codex\小手机\模块\微信\README.md
C:\Users\凡人歌\Documents\Codex\小手机\src\App.tsx
C:\Users\凡人歌\Documents\Codex\小手机\src\store.ts
C:\Users\凡人歌\Documents\Codex\小手机\src\index.css

重点搜索 App.tsx：

- WeChatApp
- WeChatChats
- WeChatContacts
- WeChatDiscover
- WeChatMe
- ChatScreen
- Bubble
- WeChatAvatar
- WeChatGroupAvatar
- splitAssistantBubbles
- requestChatCompletion
- requestChatCompletionStream
- describeChatMessage
- addCallNote
- wechat-plus-panel
- wechat-compose-row
- activeToolMessageId
- pendingUserDrafts
- replyDraft
- failedDraft
- isTyping
- groupChats

重点搜索 store.ts：

- MessageKind
- ChatMessage
- ChatSession
- chatSessions
- openChat
- addMessage
- deleteMessage
- toggleMessageFavorite
- recallMessage
- chatPresetName
- chatPresetPrompt
- chatReplyStyle
- chatContextDepth
- groupChats
- stickers
- contactTags

当前结构提醒：

1. 真实微信代码仍主要在 src/App.tsx，不在 src/pages/*。
2. 微信聊天房间是 ChatScreen，气泡是 Bubble。
3. 微信聊天记录存在 store.ts 的 chatSessions，按 channel 分 wechat / qq。
4. 电话模块已经抽到 src/PhoneScreen.tsx，不要改电话。
5. TTS provider 工具在 src/tts.ts，除非微信语音播放必须用到，否则不要动。
6. App.tsx 已经很大，修微信聊天时优先局部整理；如果要新增较大逻辑，优先抽到微信专用文件，不要继续把所有东西塞进 App.tsx。

这轮目标是“修整微信聊天体验”，不是重做整个微信。请先根据现有 ChatScreen / Bubble / store 结构确认最小改动方案。

优先检查并修整这些方向：

1. 聊天页真实微信感
   - 顶部标题、返回、聊天对象显示是否像微信。
   - 消息列表、输入栏、加号面板、表情/图片/语音入口是否清楚。
   - 不要出现开发说明、调试文字、奇怪占位文案。

2. 消息发送流程
   - 用户可连续发多条消息。
   - 空白发送再触发 char 回复的逻辑是否清楚。
   - 发送失败时的重试条是否易懂，不要挡输入。
   - char 正在输入、延迟逐条出现要自然。

3. 气泡操作
   - 点击/长按气泡才显示操作，不要常驻一排工具。
   - 用户消息：引用、收藏、复制、撤回。
   - char 消息：引用、收藏、复制、删除。
   - 按钮图标和文字要分清，尤其引用和撤回不要长得像。

4. 语音/图片/表情
   - 表情描述只作为 AI 注释，不要显示 data:image 或大段描述。
   - 图片气泡要能正常预览，文件名/说明不要撑爆布局。
   - 语音条显示时长、转写、播放状态，不要像普通文字气泡。
   - 加号面板里的语音通话/视频通话只写入聊天 call-note，不要改电话模块。

5. AI 回复质量
   - 微信回复要短、自然、像真实聊天。
   - 不要长篇小说，不要旁白，不要编号解释。
   - group chat 要按成员分别发言，不要把多人合成一个人。
   - 保留现有预设、上下文深度、温度、maxTokens、replyStyle 设置。

6. 布局和移动端
   - 输入栏不能遮住最后一条消息。
   - 按钮文字不能溢出。
   - 加号面板不能顶出屏幕。
   - 深色/哥特主题和浅色主题都要能看清。
   - 不要出现页面横向滚动。

7. 数据边界
   - 不要破坏 store.ts 里的 ChatMessage / ChatSession 兼容性。
   - 如果新增消息字段，必须升级 persist version 并写 migrate。
   - 不要直接用 crypto.randomUUID，统一用 createId。

实现边界：

- 不要修 QQ，除非 ChatScreen 共享逻辑必须兼容 activeChannel === 'qq'。
- 不要修电话，除非微信加号面板只是继续写入一条 call-note。
- 不要大范围重构 App.tsx；如果必须抽文件，先说明抽哪些函数，保持最小改动。
- 不要改 docs 以外的模块说明，除非实际代码变更影响对应模块。

建议第一步：

1. 读取文件和搜索关键词。
2. 总结当前 ChatScreen / Bubble / store 的真实数据流。
3. 列出微信聊天当前最影响体验的 3-5 个问题。
4. 给出最小改动方案。
5. 再开始实现。

完成后必须验证：

- npm run lint
- npm run build
- 搜索确认没有 crypto.randomUUID / randomUUID 直接调用
- 如果改了视觉，在浏览器里打开当前项目端口看微信聊天页

输出时请说明：

- 改了哪些文件
- 修了哪些微信聊天问题
- 哪些地方没有动
- 验证命令结果
```

本文件只作为新窗口交接用；真正微信模块说明仍在 `docs/wechat.md` 和 `模块/微信/README.md`。
