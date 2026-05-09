# 下一轮只读日历

新聊天继续日历模块时，优先只读这些文件：

- `PROJECT_OUTLINE.md`
- `docs/calendar-plan.md`
- `模块/日历/README.md`
- `src/App.tsx`：只看 `FeatureScreen`、未来 `CalendarScreen`、`PeekScreen`
- `src/store.ts`：只看日历事件相关状态/actions 和 persist migrate
- `src/index.css`：只看日历页面实际使用到的通用样式

本文件夹用于隔离下一轮日历任务，不需要读取微信模块文档。

下一轮目标：

- 按 `docs/calendar-plan.md` 增加 `CalendarEvent[]`。
- 做月视图、今天页、事件列表、编辑页和详情页。
- 接入日记/备忘录转入日历，后续再接聊天提取日程。
