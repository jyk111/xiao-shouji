# 日记

当前真实代码入口在 `src/App.tsx`：

- 日记页面：`DiaryScreen`，内部包含“我的日记”和“char日记”两个入口。
- 我的日记：写标题和正文，可选择一个或多个角色批注；提交后进入查看页，并在正文下方固定显示批注。
- char 日记：选择角色后让 TA 自己生成日记，列表展示，点进去看全文，详情页支持收藏和删除。
- 收藏：作为 `char日记` 旁边的独立页签，只收纳已收藏的 char 日记，并按不同 char 分组展示。
- 日记新增/编辑/删除：`useAppStore.addDiary`、`useAppStore.updateDiary`、`useAppStore.deleteDiary`
- 查手机里读取日记摘要：`PeekScreen`

相关状态：

- `src/store.ts`：`DiaryEntry[] diaries`
- `src/index.css`：复用通用 `hand-panel`、`hand-input`、`fetch-button`
- `docs/diary-plan.md`：日记模块详细构建思路。

维护备注：

- 日记和关系记忆尚未拆成独立模块，关系记忆当前按包含“关系”或“记忆”的标签筛选。
- 日记已从旧 `string[]` 升级成 `DiaryEntry[]`，persist version 19 会迁移旧字符串日记并过滤旧 4 月 30 示例内容。
- 默认 4 月 30 示例日记已清空；后续不要再塞演示日记进默认持久化。
