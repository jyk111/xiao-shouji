<!--
Module doc for Diary.
Sections: build goal, data model, UI flow, AI behavior, next implementation steps.
Dependencies: src/App.tsx DiaryScreen/PeekScreen, src/store.ts diaries, src/index.css shared panels.
Maintenance note: update this file whenever diary data structure or diary UI changes.
-->

# 日记模块详细构建思路

## 目标

日记不是普通记事本，而是小手机里的关系记忆系统。它要同时支持用户手写日记、char 自己写日记、聊天自动沉淀、查手机读取，以及后续作为 AI 上下文的一部分。

## 核心体验

- 用户可以写自己的日记，按日期保存，支持标题、正文、心情、标签、关联角色。
- 用户日记当前主流程为标题 + 正文；提交后 char 读完并在日记下方留下固定批注，不展开成聊天。
- char 可以生成自己的日记，内容像角色真的在手机里记录今天发生的事。
- 微信、QQ、电话、朋友圈里的重要事件可以一键存入日记。
- 查手机页面可以读取 char 日记、用户日记摘要和关系记忆。
- 日记列表要像手机日记 App：按日期分组、可搜索、可筛选角色和标签。

## 建议数据结构

当前 `src/store.ts` 已把 `diaries` 升级成结构化数组：

```ts
interface DiaryEntry {
  id: string;
  owner: 'user' | 'char';
  characterId?: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  source?: 'manual' | 'wechat' | 'qq' | 'phone' | 'moment';
  relatedMessageIds?: string[];
  createdAt: number;
  updatedAt: number;
  locked?: boolean;
}
```

persist version 19 会把旧 `string[]` 转为 `DiaryEntry[]`，并过滤旧的 4 月 30 示例内容。

## 页面结构

- `DiaryScreen` 顶部：我的日记 / char日记 两个页签。
- 我的日记列表：日期、标题、摘要，点进去看正文和 char 批注。
- 写日记页：标题、正文、提交。
- char 日记页：选择角色，点击“让 TA 写日记”，由 AI 根据近期聊天、朋友圈、订单、备忘录和用户近期日记摘要生成；列表展示，点进去看全文。
- 详情页：我的日记可编辑、删除；char 日记主要用于查看全文。

## AI 上下文

生成 char 日记时应发送：

- 角色人设、性格、世界书。
- 最近 N 条微信/QQ/电话记录。
- 用户当天手写日记摘要。
- 当前关系状态和重要标签。

输出要求：

- 只写日记正文，不写解释。
- 按角色自己的口吻写。
- 不要复述完整聊天记录，要写感受、误解、惦记和下一步想做什么。

## 与微信联动

- 聊天消息长按菜单增加“存入日记”。
- 朋友圈动态可转为当天日记素材。
- 订单与卡包可作为生活事件进入日记。
- 查手机可读取 char 日记，但用户日记是否可被 char 读取要由权限开关控制。

## 下一步实施顺序

1. 已完成：把 `diaries: string[]` 升级为 `DiaryEntry[]`，增加 persist migration。
2. 已完成：重做 `DiaryScreen` 为列表、编辑、详情三个内部视图。
3. 已完成：增加标签/角色筛选和搜索。
4. 待做：接入“从聊天存入日记”。
5. 已完成基础版：接入“让 char 写日记”的 AI 调用。
6. 已完成：让 `PeekScreen` 读取结构化日记摘要。
