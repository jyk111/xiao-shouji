<!--
Design mode for Gallery.
Purpose: describe visual structure, interaction rules, data model, and future extensions for the system album.
Real entry: src/apps/gallery/GalleryScreen.tsx.
Logic: src/apps/gallery/galleryLogic.ts.
State: src/store.ts GalleryPhoto[] galleryPhotos and string[] galleryTags.
-->

# 相册设计模式

## 定位

相册是独立生活 App 模块，真实代码在 `src/apps/gallery/`。`src/App.tsx` 只负责导入 `GalleryScreen` 并在 `FeatureScreen` 中把 `gallery` 路由到该组件。

相册参考现实手机相册：用户上传照片后自动记录日期，照片按日期分组展示；用户主要通过点选标签来整理照片。char 读取和评价建立在日期、标签、相簿和可读范围之上。

## 目录边界

- `src/apps/gallery/GalleryScreen.tsx`：相册 UI、上传、导入、详情编辑、可读范围开关、char 评价入口。
- `src/apps/gallery/galleryLogic.ts`：照片筛选、日期分组、标签归一化/切换、导入照片草稿、评价文案、隐藏切换逻辑。
- `src/apps/gallery/galleryLogic.test.ts`：相册独立逻辑测试。
- `src/store.ts`：继续保存 `GalleryPhoto[] galleryPhotos`、`string[] galleryTags` 和相册 actions，不改变用户数据结构。

## 第一屏结构

- 顶部：返回、标题、上传按钮。
- 上传引导：上传照片，自动记录日期。
- 分段入口：全部、收藏、隐藏、微信。
- 相簿筛选：全部相簿、生活、自拍、截图、风景、隐藏、聊天。
- 主体：按日期分组的三列照片网格，照片可显示收藏、隐藏和 char 可读标记。
- 可导入区：把桌面图床、微信照片墙里的图片转入相册后继续点选标签。

## 详情页结构

- 大图预览。
- 标题编辑。
- 日期：自动来自上传文件时间或导入时间，只展示，不要求手填。
- 相簿选择。
- 可见对象：所有 char 或某一个 char。
- 标签点选：从已有标签中点击添加/取消。
- 创建标签：输入新标签，点击创建后立即可选。
- 评价提示：可选填写想让 char 从什么角度评价。
- char 评价区：保存每个 char 的评价记录。
- 收藏、char 可读开关、隐藏、删除操作。

## 数据规则

- 每张照片保存为 `GalleryPhoto`，本次整理不改字段和 persist 迁移。
- `source` 标记来源：上传、图床、微信、聊天、朋友圈。
- `album` 标记分类。
- `createdAt` 是照片时间线日期，上传或导入时自动写入。
- `galleryTags` 保存用户创建的标签；`tags` 保存照片已选标签。
- `description` 是可选补充，标签才是主要整理入口。
- `readableByChar` 控制 char 是否能读取。
- `characterId` 控制只给某个 char 看。
- `reviews` 保存 char 的评价。
- `hidden` 和 `favorite` 是独立状态；隐藏照片默认不可读。

## 视觉规则

- 继续使用小手机手绘粗描边系统：`hand-panel`、`pill`、`fetch-button`。
- 网格照片用稳定正方形，避免图片加载造成布局跳动。
- 隐藏相册不是单独神秘页面，先作为相簿和筛选入口存在，后续可接密码或 char 查手机权限。

## 后续扩展

- 聊天图片一键存相册。
- 朋友圈照片自动进入相册。
- 按角色筛选相册。
- 隐藏相册权限和 AI 看图点评。
