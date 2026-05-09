# 相册

当前相册已有真实模块，`src/App.tsx` 里的 `gallery` screen 进入 `GalleryScreen`。核心逻辑是上传照片后自动记录日期，按日期分组展示，用户点选或创建标签，再控制 char 可读范围，并让 char 读取和评价。

真实入口：

- 相册页面：`GalleryScreen`
- 相册状态：`src/store.ts` 的 `GalleryPhoto[] galleryPhotos`
- 标签状态：`src/store.ts` 的 `string[] galleryTags`
- 相册新增/编辑/评价/删除/收藏：`addGalleryPhoto`、`updateGalleryPhoto`、`addGalleryPhotoReview`、`deleteGalleryPhoto`、`toggleGalleryPhotoFavorite`
- 标签新增/删除：`addGalleryTag`、`deleteGalleryTag`
- 可导入来源：桌面图床 `imageBed`、微信照片墙 `wechatPhotos`
- 查手机读取照片：`PeekScreen`，只读取 `readableByChar` 且非隐藏的照片摘要

相关文档：

- `docs/gallery-design.md`：相册设计模式和页面结构。

维护备注：

- 相册先做本地上传、自动日期、按日期分组、点选标签、创建标签、char 可读开关、char 评价、收藏、隐藏和详情编辑。
- 后续聊天图片、朋友圈照片、查手机隐藏相册都应进入 `GalleryPhoto`，不要再新增平行图片数组。
- 修改相册数据结构时需要同步 persist migrate 和 `PROJECT_OUTLINE.md`。
