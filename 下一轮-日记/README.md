# 下一轮只读日记

新聊天继续日记模块时，优先只读这些文件：

- `PROJECT_OUTLINE.md`
- `docs/diary-plan.md`
- `模块/日记/README.md`
- `src/App.tsx`：只看 `DiaryScreen`、`PeekScreen`
- `src/store.ts`：只看 `diaries`、`addDiary` 和 persist migrate
- `src/index.css`：只看日记页面实际使用到的通用样式

本文件夹用于隔离下一轮日记任务，不需要读取微信模块文档。

下一轮目标：

- 按 `docs/diary-plan.md` 把日记从 `string[]` 升级成结构化 `DiaryEntry[]`。
- 做日记列表、编辑、详情和标签筛选。
- 接入 char 日记生成和聊天存入日记。
