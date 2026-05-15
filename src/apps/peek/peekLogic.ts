import type {
  BrowserBookmark,
  BrowserHistoryItem,
  BrowserSearchRecord,
  CalendarEvent,
  Character,
  ChatMessage,
  ChatSession,
  DiaryEntry,
  GalleryPhoto,
  MemoEntry,
  MusicListenRecord,
  MusicTrack,
} from '../../store';
import type { XiaohongshuNote } from '../xiaohongshu/types';

export type PeekSectionId =
  | 'chats'
  | 'diaries'
  | 'gallery'
  | 'calendar'
  | 'memos'
  | 'browser'
  | 'xiaohongshu'
  | 'music';

export type PeekInput = {
  characters: Character[];
  chatSessions: Record<string, ChatSession>;
  diaries: DiaryEntry[];
  calendarEvents: CalendarEvent[];
  galleryPhotos: GalleryPhoto[];
  memos: MemoEntry[];
  browserSearches: BrowserSearchRecord[];
  browserBookmarks: BrowserBookmark[];
  browserHistory: BrowserHistoryItem[];
  xiaohongshuNotes: XiaohongshuNote[];
  musicTracks: MusicTrack[];
  musicListenRecords: MusicListenRecord[];
  selectedCharacterId?: string;
  now?: number;
};

export type PeekDetailItem = {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  meta?: string;
  imageUrl?: string;
  generated?: boolean;
};

export type PeekSection = {
  id: PeekSectionId;
  title: string;
  description: string;
  count: number;
  generated: boolean;
  items: PeekDetailItem[];
};

export type PeekViewModel = {
  characters: Character[];
  selectedCharacter?: Character;
  sections: PeekSection[];
};

const sectionTitles: Record<PeekSectionId, string> = {
  chats: '最近聊天',
  diaries: '日记',
  gallery: '相册',
  calendar: '日历',
  memos: '备忘',
  browser: '浏览器',
  xiaohongshu: '小红书',
  music: '音乐',
};

function compactText(value: string, max = 64) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function formatDateLabel(time: number) {
  const date = new Date(time);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hour}:${minute}`;
}

function joinItems(items: string[]) {
  return items.filter(Boolean).join('；');
}

function channelName(channel: ChatSession['channel']) {
  return channel === 'qq' ? 'QQ' : '微信';
}

function describeMessage(message: ChatMessage) {
  if (message.recalled) return '撤回了一条消息';
  if (message.kind === 'voice') return compactText(message.transcript || message.content || '语音', 42);
  if (message.kind === 'image') return compactText(message.content || '图片', 42);
  if (message.kind === 'sticker') return compactText(message.stickerLabel || message.content || '表情', 42);
  if (message.kind === 'call-note') return compactText(`通话：${message.content}`, 42);
  if (message.kind === 'transfer') return compactText(`转账 ${message.amount || ''} ${message.note || message.content || ''}`, 42);
  if (message.kind === 'red-packet') return compactText(`红包 ${message.amount || ''} ${message.note || message.content || ''}`, 42);
  if (message.kind === 'shopping') return compactText(`购物 ${message.itemName || message.content || ''} ${message.amount || ''}`, 42);
  return compactText(message.content || '文字消息', 42);
}

function ownsCharacterRecord(character: Character, characterId?: string) {
  return characterId === character.id;
}

function generatedSeed(character: Character) {
  return character.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pickGenerated(character: Character, values: string[]) {
  return values[Math.abs(generatedSeed(character)) % values.length];
}

function characterStyle(character: Character) {
  return compactText([character.description, character.personality].filter(Boolean).join(' '), 54);
}

function generatedDetails(id: PeekSectionId, character: Character): PeekDetailItem[] {
  const name = character.name;
  const style = characterStyle(character);
  const styleLine = style ? `状态线索：${style}` : '状态线索：手机里只有零散生活痕迹。';
  const map: Record<PeekSectionId, PeekDetailItem[]> = {
    chats: [
      { id: 'generated-chat-1', title: '许知远', subtitle: '微信 · 12分钟前', body: `${name}还没回完这段聊天。对方问 TA 到家没有，又补了一句“伞不用急着还”。\n${styleLine}`, generated: true },
      { id: 'generated-chat-2', title: '便利店店员', subtitle: 'QQ · 昨晚', body: `对方发来一张排班表，说上次落下的东西还放在柜台后面。\n${name}只回了一个“我明天路过”。`, generated: true },
    ],
    diaries: [
      { id: 'generated-diary-1', title: `${name}的凌晨日记`, subtitle: '今天 01:18', body: `今天没有写太多。只是记下一个时间、一个没打出去的电话，还有一句后来删掉的话。\n${styleLine}`, generated: true },
    ],
    gallery: [
      { id: 'generated-photo-1', title: '窗边光线', subtitle: '最近项目', body: `${name}手机相册里的一张窗边照片，画面里有半杯没喝完的水。`, generated: true },
      { id: 'generated-photo-2', title: '街角招牌', subtitle: '最近项目', body: '夜里拍的，招牌有一点过曝，像是走得很急时随手留下。', generated: true },
      { id: 'generated-photo-3', title: '桌面票根', subtitle: '最近项目', body: '票根压在书页下面，只露出日期。', generated: true },
    ],
    calendar: [
      { id: 'generated-calendar-1', title: pickGenerated(character, ['傍晚去旧书店', '周末整理旧物', '晚上回一通电话']), subtitle: '角色日历', body: `${name}给这个日程留了提醒，但没有写完整备注。\n${styleLine}`, generated: true },
    ],
    memos: [
      { id: 'generated-memo-1', title: '别忘了带伞', subtitle: '置顶备忘', body: '短短一句，像是给晚上的自己看的。', generated: true },
      { id: 'generated-memo-2', title: '把消息回掉', subtitle: '待处理', body: `${name}没有写收件人，只留了一个模糊的时间。`, generated: true },
    ],
    browser: [
      { id: 'generated-browser-1', title: pickGenerated(character, ['雨天路线和旧书店营业时间', '一首歌的歌词含义', '附近今晚还开着的店']), subtitle: '搜索记录', body: `${name}最近搜过这个，后面又打开了两三个相近页面。`, generated: true },
      { id: 'generated-browser-2', title: '如何删掉一条没有发出的消息', subtitle: '浏览历史', body: '页面停留时间很短，但标题被留在历史记录里。', generated: true },
    ],
    xiaohongshu: [
      { id: 'generated-xhs-1', title: `${name}的草稿`, subtitle: '未发布笔记', body: '草稿只写了一半，像是在记录一个路口、一场雨和一个没有明说的人。', generated: true },
    ],
    music: [
      { id: 'generated-music-1', title: '循环中的歌', subtitle: '最近播放', body: `${name}的播放器停在这首歌，进度条没有播完。\n${styleLine}`, generated: true },
      { id: 'generated-music-2', title: '只属于 TA 的歌单', subtitle: '歌单', body: '歌单名很短，里面的歌都像同一个晚上留下的。', generated: true },
    ],
  };
  return map[id];
}

function generatedSection(id: PeekSectionId, character: Character): PeekSection {
  const items = generatedDetails(id, character);
  return {
    id,
    title: sectionTitles[id],
    count: 0,
    generated: true,
    items,
    description: joinItems(items.slice(0, 2).map((item) => `${item.title}：${compactText(item.body, 50)}`)),
  };
}

function buildChatSection(input: PeekInput, character: Character): PeekSection {
  const sessions = Object.values(input.chatSessions)
    .filter((session) => session.characterId === character.id)
    .sort((left, right) => right.lastUpdated - left.lastUpdated)
    .slice(0, 6);
  const items = sessions.map((session) => {
    const messages = [...session.messages].sort((left, right) => left.timestamp - right.timestamp).slice(-6);
    const latest = messages[messages.length - 1];
    return {
      id: session.id,
      title: channelName(session.channel),
      subtitle: latest ? formatDateLabel(latest.timestamp) : '还没有消息',
      body: messages.map((message) => `${message.role === 'user' ? '对方' : character.name}：${describeMessage(message)}`).join('\n') || '这个会话还没有留下消息。',
    };
  });
  if (items.length === 0) return generatedSection('chats', character);
  return {
    id: 'chats',
    title: sectionTitles.chats,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 3).map((item) => `${item.title} ${compactText(item.body, 42)}`)),
  };
}

function buildDiarySection(input: PeekInput, character: Character): PeekSection {
  const entries = input.diaries
    .filter((entry) => entry.owner === 'char' && ownsCharacterRecord(character, entry.characterId))
    .filter((entry) => !entry.locked)
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 8);
  const items = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: `${formatDateLabel(entry.createdAt)}${entry.mood ? ` · ${entry.mood}` : ''}`,
    body: entry.content || '还没有正文',
    meta: entry.tags.join('、'),
  }));
  if (items.length === 0) return generatedSection('diaries', character);
  return {
    id: 'diaries',
    title: sectionTitles.diaries,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 3).map((item) => `${item.title}：${compactText(item.body, 56)}`)),
  };
}

function buildGallerySection(input: PeekInput, character: Character): PeekSection {
  const photos = input.galleryPhotos
    .filter((photo) => !photo.hidden && ownsCharacterRecord(character, photo.characterId))
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 12);
  const items = photos.map((photo) => ({
    id: photo.id,
    title: photo.title,
    subtitle: `${photo.album} · ${formatDateLabel(photo.createdAt)}`,
    body: photo.description || photo.note || photo.tags.join('、') || '没有描述',
    imageUrl: photo.url,
    meta: photo.tags.join('、'),
  }));
  if (items.length === 0) return generatedSection('gallery', character);
  return {
    id: 'gallery',
    title: sectionTitles.gallery,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 3).map((item) => `${item.title}：${compactText(item.body, 52)}`)),
  };
}

function buildCalendarSection(input: PeekInput, character: Character): PeekSection {
  const events = input.calendarEvents
    .filter((event) => event.owner === 'char' && ownsCharacterRecord(character, event.characterId))
    .sort((left, right) => left.startAt - right.startAt)
    .slice(0, 8);
  const items = events.map((event) => ({
    id: event.id,
    title: event.title,
    subtitle: formatDateLabel(event.startAt),
    body: [event.note, event.location ? `地点：${event.location}` : '', event.tags.length ? `标签：${event.tags.join('、')}` : ''].filter(Boolean).join('\n') || '没有备注',
  }));
  if (items.length === 0) return generatedSection('calendar', character);
  return {
    id: 'calendar',
    title: sectionTitles.calendar,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 3).map((item) => `${item.subtitle} ${item.title}`)),
  };
}

function buildMemoSection(input: PeekInput, character: Character): PeekSection {
  const memos = input.memos
    .filter((memo) => ownsCharacterRecord(character, memo.characterId))
    .sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.updatedAt - left.updatedAt)
    .slice(0, 8);
  const items = memos.map((memo) => ({
    id: memo.id,
    title: memo.title,
    subtitle: memo.completed ? '已完成' : memo.type === 'todo' ? '待办' : '备忘',
    body: memo.content || memo.tags.join('、') || '没有正文',
    meta: memo.tags.join('、'),
  }));
  if (items.length === 0) return generatedSection('memos', character);
  return {
    id: 'memos',
    title: sectionTitles.memos,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 3).map((item) => `${item.title}：${compactText(item.body, 54)}`)),
  };
}

function buildBrowserSection(input: PeekInput, character: Character): PeekSection {
  const items: PeekDetailItem[] = [
    ...input.browserSearches.map((record) => ({
      id: record.id,
      title: record.query,
      subtitle: '搜索记录',
      body: record.summary,
      meta: formatDateLabel(record.createdAt),
    })),
    ...input.browserHistory.map((record) => ({
      id: record.id,
      title: record.title,
      subtitle: '浏览历史',
      body: record.query ? `来自搜索：${record.query}\n${record.url}` : record.url,
      meta: formatDateLabel(record.visitedAt),
    })),
    ...input.browserBookmarks.map((record) => ({
      id: record.id,
      title: record.title,
      subtitle: '书签',
      body: `${record.snippet}\n${record.url}`,
      meta: formatDateLabel(record.createdAt),
    })),
  ].slice(0, 12);
  if (items.length === 0) return generatedSection('browser', character);
  return {
    id: 'browser',
    title: sectionTitles.browser,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 4).map((item) => `${item.subtitle}「${item.title}」`)),
  };
}

function buildXiaohongshuSection(input: PeekInput, character: Character): PeekSection {
  const notes = input.xiaohongshuNotes
    .filter((note) => note.authorType === 'character' && note.authorId === character.id)
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 8);
  const items = notes.map((note) => ({
    id: note.id,
    title: note.title,
    subtitle: `${note.authorName}${note.location ? ` · ${note.location}` : ''}`,
    body: note.content || '没有正文',
    imageUrl: note.imageUrl,
    meta: note.tags.join('、'),
  }));
  if (items.length === 0) return generatedSection('xiaohongshu', character);
  return {
    id: 'xiaohongshu',
    title: sectionTitles.xiaohongshu,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 3).map((item) => `${item.title}：${compactText(item.body, 52)}`)),
  };
}

function trackBelongsToCharacter(track: MusicTrack, character: Character) {
  if (track.characterId) return track.characterId === character.id;
  return track.source === 'char' && track.artist.trim() === character.name.trim();
}

function buildMusicSection(input: PeekInput, character: Character): PeekSection {
  const tracksById = new Map(input.musicTracks.map((track) => [track.id, track]));
  const recordItems = input.musicListenRecords
    .filter((record) => record.characterId === character.id)
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 4)
    .map((record) => {
      const track = tracksById.get(record.trackId);
      return {
        id: record.id,
        title: track?.title || '未知歌曲',
        subtitle: record.mood || '最近播放',
        body: `${record.durationSeconds ? `播放约 ${Math.round(record.durationSeconds / 60)} 分钟` : '留下了一次播放记录'}${record.note ? `\n${record.note}` : ''}`,
        imageUrl: track?.cover && !track.cover.startsWith('linear-gradient') ? track.cover : undefined,
        meta: formatDateLabel(record.createdAt),
      };
    });
  const trackItems = input.musicTracks
    .filter((track) => trackBelongsToCharacter(track, character))
    .sort((left, right) => (right.lastPlayedAt || right.createdAt) - (left.lastPlayedAt || left.createdAt))
    .slice(0, 6)
    .map((track) => ({
      id: track.id,
      title: track.title,
      subtitle: `${track.artist}${track.source === 'char' ? ' · char创作' : ''}`,
      body: [track.lyrics ? compactText(track.lyrics, 120) : '', track.melody, track.arrangement].filter(Boolean).join('\n') || '这首歌在 TA 的音乐里留下了记录。',
      imageUrl: track.cover && !track.cover.startsWith('linear-gradient') ? track.cover : undefined,
      meta: track.liked ? '已喜欢' : track.tags.join('、'),
    }));
  const items = [...recordItems, ...trackItems].slice(0, 10);
  if (items.length === 0) return generatedSection('music', character);
  return {
    id: 'music',
    title: sectionTitles.music,
    count: items.length,
    generated: false,
    items,
    description: joinItems(items.slice(0, 4).map((item) => `${item.title}：${compactText(item.body, 48)}`)),
  };
}

function buildEmptyView(characters: Character[]): PeekViewModel {
  return {
    characters,
    selectedCharacter: undefined,
    sections: Object.entries(sectionTitles).map(([id, title]) => ({
      id: id as PeekSectionId,
      title,
      count: 0,
      generated: false,
      items: [],
      description: '导入角色后再生成 TA 的手机内容。',
    })),
  };
}

export function buildPeekViewModel(input: PeekInput): PeekViewModel {
  const selectedCharacter =
    input.characters.find((character) => character.id === input.selectedCharacterId)
    || input.characters[0];
  if (!selectedCharacter) return buildEmptyView(input.characters);
  return {
    characters: input.characters,
    selectedCharacter,
    sections: [
      buildChatSection(input, selectedCharacter),
      buildDiarySection(input, selectedCharacter),
      buildGallerySection(input, selectedCharacter),
      buildCalendarSection(input, selectedCharacter),
      buildMemoSection(input, selectedCharacter),
      buildBrowserSection(input, selectedCharacter),
      buildXiaohongshuSection(input, selectedCharacter),
      buildMusicSection(input, selectedCharacter),
    ],
  };
}

export function getPeekSection(view: PeekViewModel, id: PeekSectionId) {
  const section = view.sections.find((item) => item.id === id);
  if (!section) throw new Error(`Missing peek section: ${id}`);
  return section;
}
