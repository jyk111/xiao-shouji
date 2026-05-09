<!--
Module plan for Calendar.
Sections: product goal, user flows, data model, AI behavior, phone integration, implementation steps.
Dependencies: future src/App.tsx CalendarScreen, src/store.ts calendar events/reminders, src/index.css shared panels.
Maintenance note: update this file whenever calendar data structure or UI flow changes.
-->

# 日历模块需求文档

## 目标

日历不是普通日期表，而是小手机里的生活时间线。它要把用户安排、char 的日程、纪念日、聊天里提到的约定、朋友圈/订单/日记里的事件沉淀到同一个日历里，让用户能按天查看“今天发生什么”和“接下来要做什么”。

## 核心体验

- 用户可以手动新增日程：标题、日期、时间、地点、备注、关联角色、标签。
- 用户可以快捷记录经期，经期会跨天显示并使用独立图标。
- char 可以有自己的日程，例如上课、打工、约会、失眠后的补觉、偷偷准备礼物。
- 节日按当前年份内置显示，2026 年包含元旦、春节、清明、劳动节、端午、七夕、中秋、国庆等。
- 聊天里提到“明天见”“周末去”“生日”等内容时，后续可以一键存入日历。
- 日历能显示纪念日和关系节点，比如第一次聊天、第一次通话、重要吵架、和好、约定。
- 点进某一天，可以看到当天所有事件、关联日记、备忘录和 char 状态。
- 查手机页面后续可以读取 char 的日历，但用户私人日程是否可读应有权限开关。

## 页面结构

- `CalendarScreen` 顶部：月视图 / 今天 / 日程 三个入口。
- 月视图：显示当前月份日期格，标记有事件的日期，支持切换月份。
- 月视图：不同类型事件用不同图标/颜色提示，例如经期、约会、节日、生日礼物、地点事件。
- 今天页：展示今天的日程、纪念日、char 状态和待办。
- 日程列表：按时间排序，支持按角色、标签、来源筛选。
- 编辑页：标题、日期、开始时间、结束时间、地点、备注、关联角色、提醒、标签。
- 详情页：查看事件全文，支持编辑、删除、收藏，后续可导出为关系记忆。

## 建议数据结构

```ts
interface CalendarEvent {
  id: string;
  owner: 'user' | 'char' | 'shared';
  characterId?: string;
  title: string;
  note?: string;
  location?: string;
  startAt: number;
  endAt?: number;
  allDay?: boolean;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderAt?: number;
  tags: string[];
  source?: 'manual' | 'wechat' | 'qq' | 'diary' | 'memo' | 'moment' | 'order';
  relatedDiaryIds?: string[];
  relatedMessageIds?: string[];
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

## AI 行为

生成或整理日程时应读取：

- 角色人设、世界书、当前关系状态。
- 最近微信/QQ聊天中出现的日期、时间、约定和暗示。
- 用户日记摘要、char 日记摘要、备忘录。
- 朋友圈、订单与生活事件。

输出要求：

- 只生成结构化日程候选，不要写解释。
- 时间不确定时标记为待确认，不要强行编准确时间。
- char 的私人日程要符合角色习惯，不要像系统任务清单。

## 与其他模块联动

- 微信/QQ：聊天消息可一键转为日程。
- 日记：当天日记详情可显示相关日程；日程详情可跳到相关日记。
- 备忘录：备忘录里的提醒可转为日程。
- 查手机：读取 char 日程和纪念日摘要。
- 订单与卡包：订单时间可沉淀为生活事件。

## 下一步实施顺序

1. 已完成：在 `src/store.ts` 增加 `CalendarEvent[]`、新增/编辑/删除/收藏 actions 和 persist migration。
2. 已完成：在 `src/App.tsx` 接入真实 `CalendarScreen`，替换当前占位页。
3. 已完成：月视图、今天页、日程列表、事件编辑页和详情页。
4. 已完成：角色/归属筛选、来源筛选、标签展示、收藏、类型图标和居中无滚动条显示。
5. 已完成：经期快捷记录、跨天显示和当前年份节日显示。
6. 已完成：接入“从日记/备忘录转入日历”；聊天提取日程后续再接。
7. 下一步：接入聊天消息一键转日程。
8. 下一步：接入 AI 日程候选生成。
