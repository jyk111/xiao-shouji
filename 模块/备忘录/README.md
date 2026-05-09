# 备忘录

当前备忘录已有基础入口，`src/App.tsx` 里的 `memo` screen 进入 `MemoScreen`，但现在仍是简单字符串列表。

下一步真实入口建议：

- 备忘录页面：继续使用 `MemoScreen`
- 备忘录状态：把 `src/store.ts` 的 `string[] memos` 升级为 `MemoEntry[] memos`
- 标签状态：新增 `string[] memoTags`
- 备忘新增/编辑/删除/置顶/锁定/完成：`addMemoEntry`、`updateMemoEntry`、`deleteMemoEntry`、`toggleMemoPinned`、`toggleMemoLocked`、`toggleMemoCompleted`
- 查手机读取备忘：`PeekScreen`，只读取允许 char 可见且未锁定的备忘摘要
- 转入日历：带提醒的备忘可创建 `CalendarEvent`

相关文档：

- `docs/memo-plan.md`：备忘录模块需求和实施顺序。

维护备注：

- 下一轮做备忘录时优先读本文件和 `docs/memo-plan.md`。
- 需要迁移旧 `string[] memos`，不要直接丢失用户已有备忘。
- 备忘录要像真实手机备忘录：快速记录、标签整理、置顶、锁定、提醒。
