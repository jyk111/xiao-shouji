# 日历

当前日历已有真实模块，`src/App.tsx` 里的 `calendar` screen 进入 `CalendarScreen`。

下一步真实入口建议：

- 日历页面：`CalendarScreen`
- 日程状态：`src/store.ts` 的 `CalendarEvent[] calendarEvents`
- 日程新增/编辑/删除/收藏：`addCalendarEvent`、`updateCalendarEvent`、`deleteCalendarEvent`、`toggleCalendarEventFavorite`
- 查手机读取日程：`PeekScreen`，只展示 `char/shared` 日程，避免泄露用户私人日程

相关文档：

- `docs/calendar-plan.md`：日历模块需求和实施顺序。

维护备注：

- 日历已支持本地手动日程、月视图、今天页、列表、编辑页、详情页、经期快捷记录、当前年份节日、类型图标和从日记/备忘录转入。
- AI 生成和聊天提取日程仍是后续任务。
- char 日程和用户日程要分 owner，避免查手机读取到用户私人日程。
- 修改日历数据结构时需要同步 persist migrate 和 `PROJECT_OUTLINE.md`。
