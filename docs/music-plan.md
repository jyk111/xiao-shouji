# 音乐模块需求文档

## 目标

音乐模块要像小手机里真实存在的音乐 App：可以听歌、建歌单、记录最近播放，也可以让 char 留下共同听歌、推荐歌、评论歌词的痕迹。它不是播放器占位，而是服务沉浸感和关系推进的生活模块。

## 需要的功能

- 首页：推荐歌单、最近播放、我喜欢、char 推荐。
- 播放器：封面、歌名、歌手、进度条、播放/暂停、上一首/下一首、循环/随机、歌词。
- 曲库：手动添加歌曲，支持标题、歌手、专辑、封面、音频地址、歌词、标签。
- 歌单：创建、编辑、删除歌单，把歌曲加入/移出歌单。
- 收藏：喜欢歌曲、收藏歌单。
- 历史：记录最近播放和播放次数。
- char 推荐：选择角色，让 char 根据世界书、最近聊天/日记/备忘生成推荐理由和歌单。
- 共同听歌：记录和某个 char 一起听过的歌，可显示评论、时间、心情。
- 歌词批注：用户或 char 可对歌词片段写短评。
- 音乐搜索：按歌名、歌手、标签、歌词关键词筛选。
- 数据导入：可从 JSON 导入歌曲/歌单；后续可以接浏览器搜索生成“像真实平台里的歌单”。

## 建议数据结构

```ts
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  audioUrl?: string;
  lyrics?: string;
  tags: string[];
  liked?: boolean;
  playCount: number;
  lastPlayedAt?: number;
  source?: 'manual' | 'browser' | 'char' | 'import';
  createdAt: number;
  updatedAt: number;
}

interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  trackIds: string[];
  characterId?: string;
  favorite?: boolean;
  source?: 'manual' | 'char' | 'browser';
  createdAt: number;
  updatedAt: number;
}

interface MusicListenRecord {
  id: string;
  trackId: string;
  characterId?: string;
  mood?: string;
  note?: string;
  createdAt: number;
}
```

## 页面结构

- `MusicScreen`：音乐首页和播放器入口。
- `MusicPlayerView`：当前播放页。
- `MusicLibraryView`：曲库列表和搜索。
- `MusicPlaylistView`：歌单详情。
- `MusicEditView`：新增/编辑歌曲或歌单。
- `MusicCharRecommendView`：char 推荐歌单生成。

## 实施顺序

1. 在 `src/store.ts` 增加 `MusicTrack[]`、`MusicPlaylist[]`、`MusicListenRecord[]` 和对应 actions。
2. 替换当前 `music` 占位页，接入 `MusicScreen`。
3. 先做静态播放器体验：播放/暂停状态、进度条、歌词展示，不强依赖真实音频。
4. 做曲库和歌单 CRUD。
5. 做喜欢、最近播放、播放历史。
6. 接 char 推荐：使用角色设定、浏览器世界书、最近聊天/日记/备忘生成推荐理由。
7. 后续接真实音频 URL、浏览器搜索生成歌单、歌词批注。

## 给下一个 AI 的说明

做音乐时只动音乐相关内容，优先读本文件。不要把音乐做成营销页或说明页，第一屏必须是可用的音乐 App。风格要跟小手机当前主题一致，哥特主题下不要突然变成普通白色播放器。先保证本地数据结构、播放器 UI、歌单和历史能跑通，再接模型生成。不要依赖外部音乐平台 API；如果没有真实音频，就先用模拟播放状态和用户填入的音频地址。
