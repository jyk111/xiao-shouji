<!--
Module plan for Memo.
Sections: product goal, core flows, data model, page structure, phone integration, implementation steps.
Dependencies: future src/App.tsx MemoScreen, src/store.ts memo records, src/index.css shared panels.
Maintenance note: update this file whenever memo data structure or UI flow changes.
-->

# 备忘录模块需求文档

## 目标

备忘录不是简单文字列表，而是小手机里的快速记事、提醒、灵感和给 char 留线索的入口。它要像真实手机备忘录一样轻便：打开就能记，后续能按标签、置顶、提醒和关联对象整理。

## 核心体验

- 用户可以快速新增备忘：标题、正文、标签、颜色、置顶、是否锁定。
- 备忘可以设置提醒时间，后续转入日历。
- 备忘可以关联 char，作为查手机时 char 能看到的线索。
- 备忘可以从聊天、日记、相册照片描述里生成。
- 支持普通备忘、待办清单、灵感片段三种类型。

## 页面结构

- `MemoScreen` 顶部：全部 / 置顶 / 待办 / 已锁 四个入口。
- 列表页：按更新时间排序，置顶在前，显示标题、摘要、标签、提醒状态。
- 编辑页：标题、正文、标签点选/创建、类型、提醒时间、关联角色、锁定开关。
- 详情页：查看完整内容，支持编辑、删除、置顶、锁定、转入日历。
- 标签管理：创建标签、删除标签、给备忘打标签。

## 建议数据结构

```ts
interface MemoEntry {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'todo' | 'idea';
  tags: string[];
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'white';
  characterId?: string;
  reminderAt?: number;
  pinned?: boolean;
  locked?: boolean;
  completed?: boolean;
  source?: 'manual' | 'wechat' | 'qq' | 'diary' | 'gallery' | 'calendar';
  relatedDiaryIds?: string[];
  relatedPhotoIds?: string[];
  relatedMessageIds?: string[];
  createdAt: number;
  updatedAt: number;
}
```

## 与其他模块联动

- 日历：带提醒的备忘可转为日程。
- 日记：日记中的灵感或待办可转入备忘。
- 相册：照片描述或标签可转为备忘线索。
- 微信/QQ：聊天里的约定、地址、清单可转为备忘。
- 查手机：只读取允许 char 可见、未锁定的备忘摘要。

## 下一步实施顺序

1. 在 `src/store.ts` 用 `MemoEntry[]` 替换旧的 `string[] memos`，保留迁移旧字符串。
2. 增加 `memoTags`、新增/编辑/删除/置顶/锁定/完成 actions。
3. 重做 `MemoScreen`：列表、编辑、详情、标签创建和筛选。
4. 接入备忘转日历。
5. 接入查手机读取可见备忘。
6. 后续接聊天/日记/相册转入备忘。
