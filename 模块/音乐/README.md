# 音乐

音乐模块下一轮开始做，目标是小手机里的真实音乐 App，而不是占位说明页。

优先读取：

- `docs/music-plan.md`

核心方向：

- 首页：推荐、最近播放、我喜欢、char 推荐。
- 播放器：封面、歌曲信息、进度条、播放控制、歌词。
- 曲库：新增/编辑/删除歌曲。
- 歌单：创建歌单、加入歌曲、收藏歌单。
- 历史：最近播放、共同听歌记录。
- char 推荐：根据角色、世界书和最近内容生成歌单理由。

维护备注：

- 不要接入真实外部音乐平台 API 作为必需依赖。
- 没有真实音频时，用模拟播放和用户填写的 `audioUrl`。
- UI 必须符合当前手机主题，尤其哥特主题不能突兀。

## 2026-05-10 当前入口

- 真实入口：`src/App.tsx` 的 `FeatureScreen` 在 `screen === 'music'` 时渲染 `src/apps/music/MusicScreen.tsx`。
- 当前状态：已有完整音乐页从 `src/App.tsx` 拆出，行为保持不变；本轮没有新增播放器状态，也没有做新功能。
- 状态依赖：继续读取 `src/store.ts` 里的 `musicTracks`、`musicPlaylists`、`musicListenRecords`、`musicPlayer`、`musicSourceConfig` 和用户/TTS/角色相关字段。
- 维护边界：后续只在 `src/apps/music/` 内继续细拆视图和工具；除非确实需要新增持久化字段，否则不要动 `src/store.ts` 的音乐结构。
- 下一步小拆分：优先抽 `musicHelpers.ts`、搜索源工具、播放器视图、曲库/歌单视图和 char 创作视图，逐步降低 `MusicScreen.tsx` 体积。
